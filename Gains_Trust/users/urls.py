from django.urls import path, include
from .views import (
    UserViewSet,
    WeightViewSet,
    check_availability,
    request_password_reset,
    confirm_password_reset,
)
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r"users", UserViewSet, basename="users")
router.register(r"weights", WeightViewSet, basename="weights")


urlpatterns = [
    # Custom views MUST come before router.urls to avoid conflicts
    path("users/check_availability/", check_availability, name="check-availability"),
    path("password-reset/request/", request_password_reset, name="password-reset-request"),
    path("password-reset/confirm/", confirm_password_reset, name="password-reset-confirm"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="logout"),
    # Router URLs come last
    path("", include(router.urls)),
]
