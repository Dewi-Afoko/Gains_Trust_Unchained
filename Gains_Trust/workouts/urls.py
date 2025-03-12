from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet,
    SetDictViewSet,
    skip_set,
    move_set,
)

# 🚀 DRF Router API Endpoints
router = DefaultRouter()
router.register(r'workouts', WorkoutViewSet, basename="workouts")
router.register(r'sets', SetDictViewSet, basename="sets")

urlpatterns = [
    path("", include(router.urls)),  # ✅ Registers all workout routes automatically
    path("<int:workout_id>/sets/<int:set_dict_id>/skip/", skip_set, name="set-skip"),
    path("<int:workout_id>/sets/<int:set_dict_id>/move/", move_set, name="set-move"),
]
