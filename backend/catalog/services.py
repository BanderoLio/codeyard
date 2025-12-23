"""Business logic services for catalog operations.

This module contains service layer functions that implement complex business
logic for creating/updating catalog objects with proper validation and
transactions.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from django.db import transaction
from django.utils import timezone

from catalog import models
from common.services import ServiceResult

logger = logging.getLogger(__name__)


def _sync_task_status(
    task: models.ProgrammingTask, *, is_public: bool
) -> None:
    """Update task status to PUBLIC if solution is public.
    
    Args:
        task: Programming task to update
        is_public: Whether the solution is public
    """
    if is_public and task.status != models.ProgrammingTask.TaskStatus.PUBLIC:
        task.status = models.ProgrammingTask.TaskStatus.PUBLIC
        task.save(update_fields=["status", "updated_at"])
        logger.info(f"Task {task.id} status updated to PUBLIC")


@transaction.atomic
def create_solution(*, user, validated_data: Dict[str, Any]) -> ServiceResult:
    """Create a new solution with automatic task status synchronization.
    
    If the solution is public, the associated task status is updated to PUBLIC.
    All operations are wrapped in a transaction for consistency.
    
    Args:
        user: User creating the solution
        validated_data: Validated solution data from serializer
        
    Returns:
        ServiceResult with created solution instance
        
    Raises:
        ValueError: If task is not found
    """
    task = validated_data["task"]

    if not task:
        logger.warning(f"Solution creation failed: task not found for user {user.id}")
        raise ValueError("Задача не найдена.")

    is_public = validated_data.get("is_public", False)
    solution = models.Solution.objects.create(user=user, **validated_data)
    _sync_task_status(task, is_public=is_public)
    
    logger.info(f"Solution {solution.id} created by user {user.id}")
    return ServiceResult(instance=solution, created=True)


def publish_solution(
    solution: models.Solution, *, make_public: bool
) -> models.Solution:
    """Publish or unpublish a solution.
    
    Args:
        solution: Solution to publish/unpublish
        make_public: If True, publish; if False, unpublish
        
    Returns:
        Updated solution instance
    """
    if make_public:
        if not solution.is_public:
            solution.is_public = True
            solution.published_at = timezone.now()
            solution.save(
                update_fields=["is_public", "published_at", "updated_at"]
            )
            logger.info(f"Solution {solution.id} published")
        _sync_task_status(solution.task, is_public=True)
        return solution

    if solution.is_public:
        solution.is_public = False
        solution.save(update_fields=["is_public", "updated_at"])
        logger.info(f"Solution {solution.id} unpublished")
    return solution


def create_review(
    *, user, solution: models.Solution, review_type: int
) -> ServiceResult:
    """Create or update a review for a solution.
    
    One review per user per solution is allowed. If user already reviewed,
    update the review type.
    
    Args:
        user: User creating/updating the review
        solution: Solution being reviewed
        review_type: Type of review (positive/negative)
        
    Returns:
        ServiceResult with review instance and created flag
        
    Raises:
        ValueError: If user tries to review their own solution
    """
    if solution.user_id == user.id:
        logger.warning(f"Review creation failed: user {user.id} tried to review own solution {solution.id}")
        raise ValueError("Нельзя оценивать собственное решение.")

    review, created = models.Review.objects.update_or_create(
        solution=solution,
        added_by=user,
        defaults={"review_type": review_type},
    )
    
    action = "created" if created else "updated"
    logger.info(f"Review {review.id} {action} for solution {solution.id} by user {user.id}")
    return ServiceResult(instance=review, created=created)
