from django.urls import path
from .views import (
    WorkoutView,
    SetDictView,
    complete_set,
    skip_set,
    move_set,
    duplicate_workout,
    start_timer,
    complete_workout
)

urlpatterns = [
    # ✅ Workout Routes
    path("", WorkoutView.as_view(), name="workouts"),
    path("<int:workout_id>/", WorkoutView.as_view(), name="workout-detail"),
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
    path("<int:workout_id>/duplicate/", duplicate_workout, name="duplicate-workout"),
    path("<int:workout_id>/start/", start_timer, name="start-workout"),
    path("<int:workout_id>/complete/", complete_workout, name="complete-workout"),
]
