"""Custom exception handlers for API."""

from django.conf import settings
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Custom exception handler for DRF."""
    response = drf_exception_handler(exc, context)

    if response is None:
        # Log unhandled exceptions
        logger.error(
            "Unhandled exception",
            exc_info=True,
            extra={"path": context.get("request").path},
        )

        # Don't expose internal details in production
        if settings.DEBUG:
            raise exc

        return Response(
            {
                "error": "Internal server error",
                "detail": "An unexpected error occurred.",
            },
            status=500,
        )

    # Customize error response format
    if isinstance(exc, APIException):
        if hasattr(response, "data"):
            # Log validation errors
            if response.status_code == 400:
                logger.warning(
                    "Validation error",
                    extra={
                        "path": context.get("request").path,
                        "errors": response.data,
                    },
                )

            # Standardize error response
            error_data = {
                "error": exc.__class__.__name__,
                "status_code": response.status_code,
            }

            if isinstance(response.data, dict):
                error_data["detail"] = response.data
            else:
                error_data["detail"] = str(response.data)

            response.data = error_data

    return response
