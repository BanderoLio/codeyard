from typing import Dict, Any
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password hashing.
    
    Validates:
    - Password and confirmation match
    - Password minimum length (5 chars)
    - Optional email field
    
    Note: Passwords are automatically hashed by Django's create_user() method.
    """

    password = serializers.CharField(
        write_only=True, min_length=5, max_length=255
    )
    password_confirm = serializers.CharField(
        write_only=True, min_length=5, max_length=255
    )

    class Meta:
        model = User
        fields = ("username", "email", "password", "password_confirm")
        extra_kwargs = {
            "email": {"required": False, "allow_blank": True}
        }

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate that passwords match.
        
        Args:
            data: Validated data dict
            
        Returns:
            Cleaned data with password_confirm removed
            
        Raises:
            ValidationError: If passwords don't match
        """
        if data.get("password") != data.get("password_confirm"):
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )
        data.pop("password_confirm", None)
        return data

    def create(self, validated_data: Dict[str, Any]):
        """Create a new user with securely hashed password.
        
        Uses Django's create_user() which automatically applies PBKDF2 hashing.
        
        Args:
            validated_data: Validated user data
            
        Returns:
            Created User instance with hashed password
        """
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile information (read-only)."""

    class Meta:
        model = User
        fields = ("id", "username", "email")
        read_only_fields = ("id", "username", "email")

