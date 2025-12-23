"""Validators for catalog models."""

import re
import html
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator


def sanitize_html(value: str) -> str:
    """Sanitize HTML entities in text."""
    if not isinstance(value, str):
        return value
    return html.escape(value)


def validate_task_name_length(value: str) -> None:
    """Validate task name length."""
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
    """Validate description field length."""
    if not isinstance(value, str):
        return

    value = value.strip()
    if len(value) > 5000:
        raise ValidationError(
            "Описание должно содержать максимум 5000 символов."
        )


def validate_url_format(value: str) -> None:
    """Validate URL format and allowed schemes."""
    if not value:
        return

    validator = URLValidator(schemes=["http", "https"])
    try:
        validator(value)
    except ValidationError:
        raise ValidationError(
            "Некорректный URL. Разрешены только http и https."
        )
