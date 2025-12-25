"""Caching utilities for the application."""

import logging
from typing import Any, Callable
from django.core.cache import cache
from django.views.decorators.cache import cache_page

logger = logging.getLogger(__name__)


def get_or_set_cache(
    key: str, func: Callable, timeout: int = 300, *args, **kwargs
) -> Any:
    """Get value from cache or compute and cache it.

    Args:
        key: Cache key
        func: Function to call if not cached
        timeout: Cache timeout in seconds

    Returns:
        Cached or computed value
    """
    value = cache.get(key)
    if value is None:
        value = func(*args, **kwargs)
        cache.set(key, value, timeout)
    return value


def cache_view(timeout: int = 300):
    """Decorator to cache view results.

    Args:
        timeout: Cache timeout in seconds

    Returns:
        Decorated view
    """
    return cache_page(timeout)


# Cache timeout constants
CACHE_TIMEOUT_REFERENCES = (
    3600  # 1 hour for categories, difficulties, languages
)
CACHE_TIMEOUT_TASKS = 300  # 5 minutes for task listings
CACHE_TIMEOUT_SHORT = 60  # 1 minute for frequently changing data

# Cache key patterns
CACHE_KEY_CATEGORIES = "categories:all"
CACHE_KEY_DIFFICULTIES = "difficulties:all"
CACHE_KEY_LANGUAGES = "languages:all"
CACHE_KEY_TASKS = "tasks:list:{}"  # {} for filter hash
CACHE_KEY_TASK_DETAIL = "task:detail:{}"  # {} for task id

# Cache version keys for cache versioning
CACHE_VERSION_CATEGORIES = "cache_version:categories"
CACHE_VERSION_DIFFICULTIES = "cache_version:difficulties"
CACHE_VERSION_LANGUAGES = "cache_version:languages"
CACHE_VERSION_TASKS = "cache_version:tasks"


def invalidate_cache_pattern(pattern: str) -> None:
    """Invalidate cache keys matching a pattern.

    Args:
        pattern: Cache key pattern (supports wildcards with *)
    """
    try:
        if hasattr(cache, "delete_pattern"):
            deleted = cache.delete_pattern(pattern)
            logger.info(
                f"Invalidated cache pattern"
                f" '{pattern}': {deleted} keys deleted"
            )
        elif hasattr(cache, "get_master_client"):
            client = cache.get_master_client()
            if hasattr(client, "keys"):
                keys = client.keys(pattern)
                if keys:
                    client.delete(*keys)
                    logger.info(
                        f"Invalidated cache pattern"
                        f" '{pattern}': {len(keys)} keys deleted"
                    )
        else:
            logger.warning(
                f"delete_pattern not available,"
                f" clearing all cache for pattern '{pattern}'"
            )
            cache.clear()
    except Exception as e:
        logger.error(f"Error invalidating cache pattern '{pattern}': {e}")


def invalidate_reference_caches() -> None:
    """Invalidate all reference data caches
        (categories, difficulties, languages).

    This function invalidates caches by incrementing version numbers,
    which automatically invalidates all cached views using cache_page.
    """
    try:
        cache.incr(CACHE_VERSION_CATEGORIES, ignore_missing=True)
        cache.incr(CACHE_VERSION_DIFFICULTIES, ignore_missing=True)
        cache.incr(CACHE_VERSION_LANGUAGES, ignore_missing=True)

        patterns = [
            "codeyard:views.decorators.cache.cache_page.*categories*",
            "codeyard:views.decorators.cache.cache_page.*difficulties*",
            "codeyard:views.decorators.cache.cache_page.*languages*",
        ]
        for pattern in patterns:
            invalidate_cache_pattern(pattern)

        logger.info(
            "Invalidated reference data caches"
            " (categories, difficulties, languages)"
        )
    except Exception as e:
        logger.error(f"Error invalidating reference caches: {e}")


def invalidate_category_cache() -> None:
    """Invalidate category cache."""
    try:
        cache.incr(CACHE_VERSION_CATEGORIES, ignore_missing=True)
        invalidate_cache_pattern(
            "codeyard:views.decorators.cache.cache_page.*categories*"
        )
        logger.info("Invalidated category cache")
    except Exception as e:
        logger.error(f"Error invalidating category cache: {e}")


def invalidate_difficulty_cache() -> None:
    """Invalidate difficulty cache."""
    try:
        cache.incr(CACHE_VERSION_DIFFICULTIES, ignore_missing=True)
        invalidate_cache_pattern(
            "codeyard:views.decorators.cache.cache_page.*difficulties*"
        )
        logger.info("Invalidated difficulty cache")
    except Exception as e:
        logger.error(f"Error invalidating difficulty cache: {e}")


def invalidate_language_cache() -> None:
    """Invalidate language cache."""
    try:
        cache.incr(CACHE_VERSION_LANGUAGES, ignore_missing=True)
        invalidate_cache_pattern(
            "codeyard:views.decorators.cache.cache_page.*languages*"
        )
        logger.info("Invalidated language cache")
    except Exception as e:
        logger.error(f"Error invalidating language cache: {e}")
