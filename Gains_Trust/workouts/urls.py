from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet,
    SetDictViewSet,
)

# 🚀 DRF Router API Endpoints
router = DefaultRouter()
router.register(r'workouts', WorkoutViewSet, basename="workouts")
router.register(r'sets', SetDictViewSet, basename="sets")

urlpatterns = [
    path("", include(router.urls)),  # ✅ Registers all workout routes automatically
]
