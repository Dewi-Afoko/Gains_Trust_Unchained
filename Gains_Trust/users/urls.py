from django.urls import path
from .views import register, logout, update_user, WeightView, check_availability, my_details
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path("register/", register, name="register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", logout, name="logout"),
    path("update_user/", update_user, name="update"),
    path("weights/", WeightView.as_view(), name="weights"),
    path("weights/<int:weight_id>/", WeightView.as_view(), name="weight-detail"),
    path("check_availability/", check_availability, name="check_availability"),
    path("me/", my_details, name="my_details"),
]
