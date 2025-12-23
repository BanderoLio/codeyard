"""API documentation enhancements."""

from drf_spectacular.utils import extend_schema, OpenApiResponse
from drf_spectacular.types import OpenApiTypes


# Request/Response examples for authentication
AUTH_LOGIN_EXAMPLES = {
    "application/json": {
        "username": "testuser",
        "password": "securepassword123",
    }
}

AUTH_LOGIN_RESPONSE_EXAMPLES = {
    "application/json": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    }
}

AUTH_REGISTER_EXAMPLES = {
    "application/json": {
        "username": "newuser",
        "email": "user@example.com",
        "password": "securepassword123",
    }
}

# Task examples
TASK_CREATE_EXAMPLES = {
    "application/json": {
        "name": "Binary Search Tree",
        "description": "Implement a binary search tree with insert, delete, and search operations",
        "difficulty": 2,
        "category": 1,
        "resource": "https://example.com/bst-tutorial",
    }
}

TASK_RESPONSE_EXAMPLES = {
    "application/json": {
        "id": 1,
        "name": "Binary Search Tree",
        "description": "Implement a binary search tree with insert, delete, and search operations",
        "resource": "https://example.com/bst-tutorial",
        "difficulty": 2,
        "category": 1,
        "added_by": "testuser",
        "status": "PUBLIC",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
    }
}

# Solution examples
SOLUTION_CREATE_EXAMPLES = {
    "application/json": {
        "task": 1,
        "code": "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None",
        "language": 1,
        "explanation": "Node class for BST implementation",
        "is_public": False,
    }
}

# Review examples
REVIEW_CREATE_EXAMPLES = {
    "application/json": {
        "solution": 1,
        "review_type": 1,
    }
}

# Error responses
ERROR_RESPONSE_EXAMPLES = {
    "application/json": {
        "error": "ValidationError",
        "status_code": 400,
        "detail": {
            "name": ["This field is required."],
        },
    }
}

ERROR_UNAUTHORIZED_EXAMPLES = {
    "application/json": {
        "error": "AuthenticationFailed",
        "status_code": 401,
        "detail": "Authentication credentials were not provided.",
    }
}

ERROR_FORBIDDEN_EXAMPLES = {
    "application/json": {
        "error": "PermissionDenied",
        "status_code": 403,
        "detail": "You do not have permission to perform this action.",
    }
}

# Schema decorators
def schema_login():
    """Schema for login endpoint."""
    return extend_schema(
        description="Login with username and password. Returns access token and sets refresh token in cookie.",
        examples=AUTH_LOGIN_EXAMPLES,
        responses={
            200: OpenApiResponse(description="Login successful"),
            401: OpenApiResponse(description="Invalid credentials"),
        },
    )


def schema_register():
    """Schema for register endpoint."""
    return extend_schema(
        description="Register a new user account.",
        examples=AUTH_REGISTER_EXAMPLES,
        responses={
            201: OpenApiResponse(description="User registered successfully"),
            400: OpenApiResponse(description="Invalid data or user already exists"),
        },
    )
