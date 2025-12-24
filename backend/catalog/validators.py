"""Input validation utilities for catalog models.

This module provides centralized validation for all user input to prevent XSS,
invalid data, and ensure data consistency across the application.
"""

import re
import html
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator


def sanitize_html(value: str) -> str:
    """Sanitize HTML entities in text to prevent XSS attacks.
    
    Args:
        value: String to sanitize
        
    Returns:
        Sanitized string with HTML entities escaped
    """
    if not isinstance(value, str):
        return value
    return html.escape(value)


def validate_task_name_length(value: str) -> None:
    """Validate task name length constraints (3-255 chars).
    
    Args:
        value: Task name to validate
        
    Raises:
        ValidationError: If name is too short or too long
    """
    if not isinstance(value, str):
        return

    value = value.strip()
    if len(value) < 3:
        raise ValidationError(
            "Название задачи должно содержать минимум 3 символа."
        )
    if len(value) > 255:
        raise ValidationError(
            "Название задачи должно содержать максимум 255 символов."
        )


def validate_description_length(value: str) -> None:
    """Validate description length constraint (max 5000 chars).
    
    Args:
        value: Description text to validate
        
    Raises:
        ValidationError: If description exceeds maximum length
    """
    if not isinstance(value, str):
        return

    value = value.strip()
    if len(value) > 5000:
        raise ValidationError(
            "Описание должно содержать максимум 5000 символов."
        )


def validate_url_format(value: str) -> None:
    """Validate URL format and allowed schemes (http/https only).
    
    Args:
        value: URL to validate
        
    Raises:
        ValidationError: If URL format is invalid or scheme not allowed
    """
    if not value:
        return

    validator = URLValidator(schemes=["http", "https"])
    try:
        validator(value)
    except ValidationError:
        raise ValidationError(
            "Некорректный URL. Разрешены только http и https."
        )


def validate_code_length(value: str) -> None:
    """Validate code snippet length constraint (1-1000000 chars).
    
    Args:
        value: Code to validate
        
    Raises:
        ValidationError: If code is empty or exceeds maximum length
    """
    if not isinstance(value, str) or not value.strip():
        raise ValidationError("Код не может быть пустым.")
    
    if len(value) > 1_000_000:
        raise ValidationError(
            "Код слишком длинный (максимум 1000000 символов)."
        )


def validate_explanation_length(value: str) -> None:
    """Validate explanation text length constraint (max 100000 chars).
    
    Args:
        value: Explanation text to validate
        
    Raises:
        ValidationError: If explanation exceeds maximum length
    """
    if value and len(value.strip()) > 100_000:
        raise ValidationError(
            "Объяснение слишком длинное (максимум 100000 символов)."
        )
