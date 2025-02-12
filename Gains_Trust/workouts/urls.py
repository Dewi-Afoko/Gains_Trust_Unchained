from django.urls import path
from .views import SetDictView, WorkoutView

urlpatterns = [
    path("", WorkoutView.as_view(), name="workouts"),
    path("<int:workout_id>/", WorkoutView.as_view(), name="workout-detail"),
    path("<int:workout_id>/sets/", SetDictView.as_view(), name="set-list"),
    path(
        "<int:workout_id>/sets/<int:set_dict_id>/",
        SetDictView.as_view(),
        name="set-detail",
    ),
]
