from rest_framework import serializers
from .models import Booking
from apps.sessions_app.models import Session
from apps.sessions_app.serializers import SessionListSerializer


class BookingSerializer(serializers.ModelSerializer):
    session_detail = SessionListSerializer(
        source='session', read_only=True
    )
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(),
        source='session',
        write_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'id', 'session_id', 'session_detail',
            'status', 'amount_paid', 'notes', 'booked_at',
        ]
        read_only_fields = ['id', 'status', 'amount_paid', 'booked_at']

    def validate(self, attrs):
        session = attrs['session']
        user = self.context['request'].user
        if session.spots_remaining <= 0:
            raise serializers.ValidationError('Session is fully booked.')
        if Booking.objects.filter(
            user=user,
            session=session,
            status__in=['pending', 'confirmed']
        ).exists():
            raise serializers.ValidationError(
                'You have already booked this session.'
            )
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'confirmed'
        validated_data['amount_paid'] = validated_data['session'].price
        return super().create(validated_data)