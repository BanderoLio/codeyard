"""Tests for authentication endpoints."""

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


@override_settings(
    CACHES={
        "default": {
            "BACKEND": "django.core.cache.backends.dummy.DummyCache",
        }
    }
)
class AuthenticationAPITests(APITestCase):
    """Tests for authentication endpoints."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

    def test_register_new_user(self):
        """Test user registration."""
        payload = {
            "username": "newuser",
            "password": "newpass123",
            "password_confirm": "newpass123",
        }

        response = self.client.post("/api/auth/register/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_register_mismatched_password(self):
        """Test registration with mismatched passwords."""
        payload = {
            "username": "newuser2",
            "password": "newpass123",
            "password_confirm": "differentpass",
        }

        response = self.client.post("/api/auth/register/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="newuser2").exists())

    def test_register_duplicate_username(self):
        """Test registration with existing username."""
        payload = {
            "username": "testuser",  # Already exists
            "password": "newpass123",
            "password_confirm": "newpass123",
        }

        response = self.client.post("/api/auth/register/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login(self):
        """Test user login."""
        payload = {
            "username": "testuser",
            "password": "testpass123",
        }

        response = self.client.post("/api/auth/login/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refreshToken", response.cookies)

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        payload = {
            "username": "testuser",
            "password": "wrongpassword",
        }

        response = self.client.post("/api/auth/login/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token(self):
        """Test token refresh."""
        # First login to get refresh token
        login_response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # Use refresh token
        refresh_response = self.client.post(
            "/api/auth/refresh/", {}, format="json"
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)

    def test_me_endpoint_requires_auth(self):
        """Test that /me endpoint requires authentication."""
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint_returns_user_info(self):
        """Test /me endpoint returns current user info."""
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["id"], self.user.id)

    def test_logout(self):
        """Test user logout."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post("/api/auth/logout/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Refresh token cookie should be deleted
        self.assertIn("refreshToken", response.cookies)
