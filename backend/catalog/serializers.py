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
        """Validate task name."""
        validators.validate_task_name_length(value)
        return value.strip()

    def validate_description(self, value: str) -> str:
        """Validate task description."""
        validators.validate_description_length(value)
        return value.strip()

    def validate_resource(self, value: str) -> str:
        """Validate resource URL."""
        if value:
            validators.validate_url_format(value)
        return value.strip() if value else value

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
    """
    
    user = serializers.StringRelatedField(read_only=True)
    task_detail = ProgrammingTaskSerializer(source="task", read_only=True)
    language_name = serializers.CharField(
        source="language.name", read_only=True
    )
    positive_reviews_count = serializers.IntegerField(read_only=True)
    negative_reviews_count = serializers.IntegerField(read_only=True)
    user_review = serializers.SerializerMethodField()

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
            "positive_reviews_count",
            "negative_reviews_count",
            "user_review",
        )
        read_only_fields = (
            "id",
            "user",
            "published_at",
            "created_at",
            "updated_at",
            "positive_reviews_count",
            "negative_reviews_count",
            "user_review",
        )

    def get_user_review(self, obj):
        """Get review by current user if exists."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        
        # Check if user_review_list was prefetched
        if hasattr(obj, "user_review_list") and obj.user_review_list:
            user_review = obj.user_review_list[0]
            return {
                "id": user_review.id,
                "review_type": user_review.review_type,
            }
        
        # Fallback: query directly if not prefetched
        try:
            user_review = obj.reviews.filter(added_by=request.user).first()
            if user_review:
                return {
                    "id": user_review.id,
                    "review_type": user_review.review_type,
                }
        except Exception:
            pass
        
        return None

    def validate_code(self, value: str) -> str:
        """Validate code snippet."""
        validators.validate_code_length(value)
        return value.strip()

    def validate_explanation(self, value: str) -> str:
        """Validate explanation text."""
        if value:
            validators.validate_explanation_length(value)
        return value.strip() if value else value

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
