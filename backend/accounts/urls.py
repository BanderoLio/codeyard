from django.urls import path

from accounts.authentication import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
)

app_name = "accounts"

urlpatterns = [
    path("login/", CookieTokenObtainPairView.as_view(), name="login"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
