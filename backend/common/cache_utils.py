"""Caching utilities for the application."""

from typing import Any, Callable, Optional
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view


def get_or_set_cache(
    key: str,
    func: Callable,
    timeout: int = 300,
    *args,
    **kwargs
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
CACHE_TIMEOUT_REFERENCES = 3600  # 1 hour for categories, difficulties, languages
CACHE_TIMEOUT_TASKS = 300  # 5 minutes for task listings
CACHE_TIMEOUT_SHORT = 60  # 1 minute for frequently changing data

# Cache key patterns
CACHE_KEY_CATEGORIES = "categories:all"
CACHE_KEY_DIFFICULTIES = "difficulties:all"
CACHE_KEY_LANGUAGES = "languages:all"
CACHE_KEY_TASKS = "tasks:list:{}"  # {} for filter hash
CACHE_KEY_TASK_DETAIL = "task:detail:{}"  # {} for task id
