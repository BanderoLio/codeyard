from django.conf import settings
from django.utils.decorators import method_decorator
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django_ratelimit.decorators import ratelimit


class CookieMixin:
    def set_refresh_cookie(self, response, refresh_token: str) -> None:
        response.set_cookie(
            settings.REFRESH_COOKIE_NAME,
            refresh_token,
            secure=settings.REFRESH_COOKIE_SECURE,
            samesite=settings.REFRESH_COOKIE_SAMESITE,
            httponly=settings.REFRESH_COOKIE_HTTPONLY,
            max_age=int(
                settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
            ),
        )

    def clear_refresh_cookie(self, response) -> None:
        response.delete_cookie(settings.REFRESH_COOKIE_NAME)


@method_decorator(
    ratelimit(key="ip", rate="10/m", block=True), name="dispatch"
)
class CookieTokenObtainPairView(CookieMixin, TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(
            request, response, *args, **kwargs
        )
        refresh_token = response.data.pop("refresh", None)
        if response.status_code == 200 and refresh_token:
            self.set_refresh_cookie(response, refresh_token)
        return response


@method_decorator(
    ratelimit(key="ip", rate="30/m", block=True), name="dispatch"
)
class CookieTokenRefreshView(CookieMixin, TokenRefreshView):
    def post(self, request, *args, **kwargs):
        if "refresh" not in request.data:
            cookie_value = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
            if cookie_value:
                request.data["refresh"] = cookie_value
        response = super().post(request, *args, **kwargs)
        refresh_token = response.data.pop("refresh", None)
        if response.status_code == 200 and refresh_token:
            self.set_refresh_cookie(response, refresh_token)
        return response


class LogoutView(CookieMixin, APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        response = Response({"detail": "Вы вышли из системы"})
        self.clear_refresh_cookie(response)
        return response
