from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from catalog import models, services, validators

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Category
        fields = ("id", "name", "description", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class DifficultySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Difficulty
        fields = ("id", "name", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class ProgrammingLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ProgrammingLanguage
        fields = ("id", "name", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class ProgrammingTaskSerializer(serializers.ModelSerializer):
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
        validators.validate_task_name_length(value)
        return validators.sanitize_html(value.strip())

    def validate_description(self, value: str) -> str:
        validators.validate_description_length(value)
        return validators.sanitize_html(value.strip())

    def validate_resource(self, value: str) -> str:
        if value:
            validators.validate_url_format(value)
        return validators.sanitize_html(value.strip())

    def validate(self, attrs):
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
        """Validate code field."""
        if not isinstance(value, str) or not value.strip():
            raise serializers.ValidationError(
                "Код не может быть пустым."
            )
        if len(value.strip()) < 1:
            raise serializers.ValidationError(
                "Код должен содержать минимум 1 символ."
            )
        if len(value) > 1_000_000:
            raise serializers.ValidationError(
                "Код слишком длинный (максимум 1000000 символов)."
            )
        return validators.sanitize_html(value.strip())

    def validate_explanation(self, value: str) -> str:
        if value:
            if len(value.strip()) > 100000:
                raise serializers.ValidationError(
                    "Объяснение слишком длинное (максимум 100000 символов)."
                )
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
