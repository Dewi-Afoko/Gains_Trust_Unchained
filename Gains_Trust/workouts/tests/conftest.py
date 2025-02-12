import pytest
from workouts.models import Workout, SetDict
from tests.conftest import create_user, user_data, test_request, api_client, factory
from django.utils.timezone import now

# ✅ Use the `create_user` fixture from `tests/conftest.py`
@pytest.fixture
def create_workout(create_user):
    """Fixture to create a workout for a user"""
    return Workout.objects.create(user=create_user, workout_name="Push Day", date=now().date())

@pytest.fixture
def workout_data(create_user):
    """Fixture to return sample workout data"""
    return {
        "user": create_user,
        "name": "Leg Day",
    }

@pytest.fixture
def create_setdict(create_workout):
    """Fixture to create a SetDict entry for a workout"""
    return SetDict.objects.create(
        workout=create_workout,
        exercise_name="Bench Press",
        loading=100,
        reps=5,
    )

@pytest.fixture
def setdict_data(create_workout):
    """Fixture for SetDict data"""
    return {
        "workout": create_workout,
        "exercise_name": "Deadlift",
        "loading": 140,
        "reps": 3,
    }
