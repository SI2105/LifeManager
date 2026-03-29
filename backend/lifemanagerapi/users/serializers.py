from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import Group
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import User


AuthUser = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "groups", "first_name"]


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ["url", "name"]


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]
        read_only_fields = ["id", "email"]

# Response Serializer to allow better documenting for responses
class AuthTokensSerializer(serializers.Serializer):
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

# Response Serializer to allow better documenting for responses
class AuthSuccessSerializer(AuthTokensSerializer):
    user = MeSerializer(read_only=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]

    def validate_email(self, value): # using custom field level validation using "validate_<fieldname>" pattern documented here: https://www.django-rest-framework.org/api-guide/serializers/#field-level-validation
        normalized = value.strip().lower()
        if AuthUser.objects.filter(email=normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        user = AuthUser.objects.create_user(
            username=email,
            email=email,
            password=password,
            **validated_data,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        try:
            user = AuthUser.objects.get(email=email)
        except AuthUser.DoesNotExist as exc:
            raise serializers.ValidationError("Invalid credentials.") from exc

        if not user.check_password(password) or not user.is_active:
            raise serializers.ValidationError("Invalid credentials.")

        attrs["user"] = user
        return attrs


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate_refresh(self, value):
        try:
            token = RefreshToken(value)
            token.blacklist()
        except TokenError as exc:
            raise serializers.ValidationError("Invalid or expired refresh token.") from exc
        return value