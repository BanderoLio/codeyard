from django.conf import settings
from django.db import models

from common.models import TimeStampedMixin


class Category(TimeStampedMixin):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Difficulty(TimeStampedMixin):
    name = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return self.name


class ProgrammingLanguage(TimeStampedMixin):
    name = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return self.name


class ProgrammingTask(TimeStampedMixin):
    class TaskStatus(models.TextChoices):
        PRIVATE = 'PRIVATE', 'Private'
        PUBLIC = 'PUBLIC', 'Public'
        HIDDEN = 'HIDDEN', 'Hidden'

    name = models.CharField(max_length=255)
    description = models.TextField()
    resource = models.URLField(blank=True)
    difficulty = models.ForeignKey(
        Difficulty, on_delete=models.PROTECT, related_name='tasks'
    )
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name='tasks'
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks',
    )
    status = models.CharField(
        max_length=16,
        choices=TaskStatus.choices,
        default=TaskStatus.PRIVATE,
    )

    class Meta:
        ordering = ('-created_at',)
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'added_by'],
                name='unique_task_name_per_user',
            )
        ]
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return self.name


class Solution(TimeStampedMixin):
    task = models.ForeignKey(
        ProgrammingTask, on_delete=models.CASCADE, related_name='solutions'
    )
    code = models.TextField()
    language = models.ForeignKey(
        ProgrammingLanguage,
        on_delete=models.PROTECT,
        related_name='solutions',
    )
    explanation = models.TextField(blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='solutions',
    )
    is_public = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ('-created_at',)
        indexes = [
            models.Index(fields=['is_public', 'task']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'{self.task.name} ({self.language.name})'


class Review(TimeStampedMixin):
    class ReviewType(models.IntegerChoices):
        NEGATIVE = 0, 'Negative'
        POSITIVE = 1, 'Positive'

    solution = models.ForeignKey(
        Solution, on_delete=models.CASCADE, related_name='reviews'
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='given_reviews',
    )
    review_type = models.IntegerField(choices=ReviewType.choices)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['solution', 'added_by'], name='unique_review_per_user'
            )
        ]

    def __str__(self):
        return f'{self.get_review_type_display()} for {self.solution_id}'
