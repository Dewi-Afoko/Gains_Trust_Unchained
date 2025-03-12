from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutViewSet,
    SetDictView,
    complete_set,
    skip_set,
    move_set,
)

# 🚀 DRF Router API Endpoints
router = DefaultRouter()
router.register(r'', WorkoutViewSet, basename="workouts")

urlpatterns = [
    path("", include(router.urls)),  # ✅ Registers all workout routes automatically


    # ✅ SetDict Routes
    path("<int:workout_id>/sets/", SetDictView.as_view(), name="set-list"),
    path(
        "<int:workout_id>/sets/<int:set_dict_id>/",
        SetDictView.as_view(),
        name="set-detail",
    ),

    # ✅ Action-Based Endpoints
    path(
        "<int:workout_id>/sets/<int:set_dict_id>/complete/",
        complete_set,
        name="set-complete",
    ),
    path("<int:workout_id>/sets/<int:set_dict_id>/skip/", skip_set, name="set-skip"),
    path("<int:workout_id>/sets/<int:set_dict_id>/move/", move_set, name="set-move"),
]
