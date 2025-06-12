import pytest
from workouts.models import Workout, SetDict
from datetime import datetime, timedelta
from django.utils.timezone import now

@pytest.mark.django_db
def test_create_workout(create_user):
    """Test that a Workout instance can be created successfully."""
    workout = Workout.objects.create(user=create_user, workout_name="Leg Day")

    assert workout.user == create_user
    assert workout.workout_name == "Leg Day"
    assert workout.date == now().date()  # ✅ Should default to today's date
    assert workout.complete is False
    assert workout.__str__() == f"{create_user.username} - Leg Day ({workout.date})"

@pytest.mark.django_db
def test_create_setdict(create_workout):
    """Test that a SetDict instance can be created successfully."""
    set_dict = SetDict.objects.create(
        workout=create_workout,
        exercise_name="Squat",
        set_order=1,
        set_number=1,
        reps=10,
        loading=100.0,
    )

    assert set_dict.workout == create_workout
    assert set_dict.exercise_name == "Squat"
    assert set_dict.set_order == 1
    assert set_dict.set_number == 1
    assert set_dict.reps == 10
    assert set_dict.loading == 100.0
    assert set_dict.complete is False
    assert set_dict.__str__() == f"{create_workout.workout_name} - Squat (Set 1)"

@pytest.mark.django_db
def test_workout_with_optional_fields(create_user):
    """Test that a Workout instance can store optional fields correctly."""
    workout = Workout.objects.create(
        user=create_user,
        workout_name="Morning Routine",
        user_weight=80.5,
        sleep_score=8,
        sleep_quality="Good",
        notes="Felt strong",
        start_time=now(),
        duration=45,
    )

    assert workout.user_weight == 80.5
    assert workout.sleep_score == 8
    assert workout.sleep_quality == "Good"
    assert workout.notes == "Felt strong"
    assert workout.start_time is not None
    assert workout.duration == 45

@pytest.mark.django_db
def test_setdict_with_optional_fields(create_workout):
    """Test that a SetDict instance can store optional fields correctly."""
    set_dict = SetDict.objects.create(
        workout=create_workout,
        exercise_name="Bench Press",
        set_order=2,
        set_number=1,
        set_type="Warm-up",
        reps=8,
        loading=60.0,
        focus="Chest activation",
        rest=90,
        notes="Felt easy",
        complete=True,
        is_active_set=True,
        set_start_time=now(),
        set_duration=30,
    )

    assert set_dict.set_type == "Warm-up"
    assert set_dict.focus == "Chest activation"
    assert set_dict.rest == 90
    assert set_dict.notes == "Felt easy"
    assert set_dict.complete is True
    assert set_dict.is_active_set is True
    assert set_dict.set_start_time is not None
    assert set_dict.set_duration == 30
