from __future__ import annotations

from typing import Any, Dict

from django.db import transaction
from django.utils import timezone

from catalog import models
from common.services import ServiceResult


def _sync_task_status(task: models.ProgrammingTask, *, is_public: bool) -> None:
    if is_public and task.status != models.ProgrammingTask.TaskStatus.PUBLIC:
        task.status = models.ProgrammingTask.TaskStatus.PUBLIC
        task.save(update_fields=['status', 'updated_at'])


@transaction.atomic
def create_solution(*, user, validated_data: Dict[str, Any]) -> ServiceResult:
    task = validated_data['task']
    is_public = validated_data.get('is_public', False)
    solution = models.Solution.objects.create(user=user, **validated_data)
    _sync_task_status(task, is_public=is_public)
    return ServiceResult(instance=solution, created=True)


def publish_solution(solution: models.Solution, *, make_public: bool) -> models.Solution:
    if make_public:
        if not solution.is_public:
            solution.is_public = True
            solution.published_at = timezone.now()
            solution.save(update_fields=['is_public', 'published_at', 'updated_at'])
        _sync_task_status(solution.task, is_public=True)
        return solution

    if solution.is_public:
        solution.is_public = False
        solution.save(update_fields=['is_public', 'updated_at'])
    return solution


def create_review(*, user, solution: models.Solution, review_type: int) -> models.Review:
    if solution.user_id == user.id:
        raise ValueError('Нельзя оценивать собственное решение')
    review, created = models.Review.objects.update_or_create(
        solution=solution,
        added_by=user,
        defaults={'review_type': review_type},
    )
    return ServiceResult(instance=review, created=created)

