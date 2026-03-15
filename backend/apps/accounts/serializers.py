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
            'id', 'email', 'username',
            'first_name', 'last_name',
            'role', 'avatar', 'bio',
            'profile', 'date_joined',
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined']