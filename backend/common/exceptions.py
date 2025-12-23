"""Exception handlers for API responses."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import APIException


def get_error_response_format(exc: Exception, context: dict) -> dict:
    """Format error response in unified format."""
    if isinstance(exc, APIException):
        return {
            "error": exc.detail if hasattr(exc, "detail") else str(exc),
            "status_code": exc.status_code,
        }

    # For non-API exceptions, return generic error
    return {
        "error": "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.",
        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
    }


def custom_exception_handler(exc: Exception, context: dict) -> Response:
    """
    Custom exception handler that formats errors uniformly.

    Returns:
        Response with unified error format or None to use default handling.
    """
    error_data = get_error_response_format(exc, context)
    return Response(error_data, status=error_data["status_code"])
