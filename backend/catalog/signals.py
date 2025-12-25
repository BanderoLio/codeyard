"""Django signals for cache invalidation."""

import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from catalog import models
from common.cache_utils import (
    invalidate_category_cache,
    invalidate_difficulty_cache,
    invalidate_language_cache,
)

logger = logging.getLogger(__name__)


@receiver([post_save, post_delete], sender=models.Category)
def invalidate_categories_cache(sender, instance, **kwargs):
    """Invalidate category cache when Category is saved or deleted."""
    logger.info(f"Category {instance.id} changed, invalidating cache")
    invalidate_category_cache()


@receiver([post_save, post_delete], sender=models.Difficulty)
def invalidate_difficulties_cache(sender, instance, **kwargs):
    """Invalidate difficulty cache when Difficulty is saved or deleted."""
    logger.info(f"Difficulty {instance.id} changed, invalidating cache")
    invalidate_difficulty_cache()


@receiver([post_save, post_delete], sender=models.ProgrammingLanguage)
def invalidate_languages_cache(sender, instance, **kwargs):
    """Invalidate language cache when ProgrammingLanguage is saved or deleted."""
    logger.info(f"ProgrammingLanguage {instance.id} changed, invalidating cache")
    invalidate_language_cache()

