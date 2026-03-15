from rest_framework import serializers
from .models import Session, Category
from apps.accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class SessionListSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False
    )
    spots_remaining = serializers.IntegerField(read_only=True)
    is_booked = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id', 'title', 'slug', 'description', 'creator',
            'category', 'category_id', 'cover_image', 'price',
            'capacity', 'duration_min', 'scheduled_at',
            'location', 'status', 'spots_remaining',
            'is_booked', 'created_at',
        ]
        read_only_fields = ['id', 'slug', 'creator', 'created_at']

    def get_is_booked(self, obj):
        req = self.context.get('request')
        if req and req.user.is_authenticated:
            return obj.bookings.filter(
                user=req.user,
                status__in=['pending', 'confirmed']
            ).exists()
        return False

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)