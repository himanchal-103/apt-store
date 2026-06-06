from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["name", "email", "phone", "password", "role"]

    def validate_role(self, value):
        allowed = [User.Role.USER, User.Role.REVIEWER, User.Role.ADMIN]
        if value not in allowed:
            raise serializers.ValidationError(f"Role must be one of: {', '.join(allowed)}")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ["id", "name", "email", "phone", "role", "is_active", "created_at"]