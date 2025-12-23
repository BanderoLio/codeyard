"""Serializers for catalog models with centralized validation.

These serializers handle data validation, sanitization, and transformation
for API requests/responses.
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from catalog import models, services, validators

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model (reference data)."""
    
    class Meta:
        model = models.Category
        fields = ("id", "name", "description", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class DifficultySerializer(serializers.ModelSerializer):
    """Serializer for Difficulty model (reference data)."""
    
    class Meta:
        model = models.Difficulty
        fields = ("id", "name", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class ProgrammingLanguageSerializer(serializers.ModelSerializer):
    """Serializer for ProgrammingLanguage model (reference data)."""
    
    class Meta:
        model = models.ProgrammingLanguage
        fields = ("id", "name", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class ProgrammingTaskSerializer(serializers.ModelSerializer):
    """Serializer for ProgrammingTask model with comprehensive validation.
    
    Validates:
    - Task name length and uniqueness per user
    - Description length
    - URL format for resource link
    - Ensures HTML is sanitized in all text fields
    """
    
    added_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = models.ProgrammingTask
        fields = (
            "id",
            "name",
            "description",
            "resource",
            "difficulty",
            "category",
            "added_by",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "added_by",
            "status",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value: str) -> str:
        """Validate and sanitize task name."""
        validators.validate_task_name_length(value)
        return validators.sanitize_html(value.strip())

    def validate_description(self, value: str) -> str:
        """Validate and sanitize task description."""
        validators.validate_description_length(value)
        return validators.sanitize_html(value.strip())

    def validate_resource(self, value: str) -> str:
        """Validate and sanitize resource URL."""
        if value:
            validators.validate_url_format(value)
        return validators.sanitize_html(value.strip())

    def validate(self, attrs):
        """Validate task uniqueness and other constraints."""
        user = self.context["request"].user
        name = attrs.get("name")

        if name and self.instance is None:  # Only on creation
            if models.ProgrammingTask.objects.filter(
                name=name, added_by=user
            ).exists():
                raise serializers.ValidationError(
                    {"name": "Задача с таким названием уже существует."}
                )

        return attrs


class SolutionSerializer(serializers.ModelSerializer):
    """Serializer for Solution model with code validation.
    
    Validates:
    - Code snippet length and non-empty content
    - Explanation text length
    - HTML sanitization for code and explanation
    """
    
    user = serializers.StringRelatedField(read_only=True)
    task_detail = ProgrammingTaskSerializer(source="task", read_only=True)
    language_name = serializers.CharField(
        source="language.name", read_only=True
    )

    class Meta:
        model = models.Solution
        fields = (
            "id",
            "task",
            "task_detail",
            "code",
            "language",
            "language_name",
            "explanation",
            "user",
            "is_public",
            "published_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "user",
            "published_at",
            "created_at",
            "updated_at",
        )

    def validate_code(self, value: str) -> str:
        """Validate and sanitize code snippet."""
        validators.validate_code_length(value)
        return validators.sanitize_html(value.strip())

    def validate_explanation(self, value: str) -> str:
        """Validate and sanitize explanation text."""
        if value:
            validators.validate_explanation_length(value)
        return validators.sanitize_html(value.strip())

    def create(self, validated_data):
        result = services.create_solution(
            user=self.context["request"].user,
            validated_data=validated_data,
        )
        return result.instance


class SolutionPublishSerializer(serializers.Serializer):
    is_public = serializers.BooleanField()


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model with ownership validation.
    
    Validates:
    - User cannot review their own solution
    - Only allows valid review types
    """
    
    added_by = serializers.StringRelatedField(read_only=True)
    solution = serializers.PrimaryKeyRelatedField(
        queryset=models.Solution.objects.all()
    )

    class Meta:
        model = models.Review
        fields = (
            "id",
            "solution",
            "review_type",
            "added_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "added_by", "created_at", "updated_at")

    def validate(self, attrs):
        """Validate that user is not reviewing their own solution."""
        request = self.context["request"]
        solution = attrs["solution"]
        if solution.user_id == request.user.id:
            raise serializers.ValidationError(
                "Нельзя оценивать собственное решение"
            )
        return attrs

    def create(self, validated_data):
        result = services.create_review(
            user=self.context["request"].user,
            solution=validated_data["solution"],
            review_type=validated_data["review_type"],
        )
        self.created = result.created
        return result.instance
