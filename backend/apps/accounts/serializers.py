from rest_framework import serializers
from .models import User, Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['display_name', 'website', 'created_at']
        read_only_fields = ['created_at']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name',
            'last_name', 'role', 'avatar', 'bio',
            'profile', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined']

    def to_representation(self, instance):
        # Safely handle missing profile — auto-create rather than crash
        try:
            instance.profile
        except Profile.DoesNotExist:
            Profile.objects.get_or_create(user=instance)
        return super().to_representation(instance)
