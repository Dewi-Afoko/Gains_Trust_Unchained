import pytest
from workouts.serializers import WorkoutSerializer, SetDictSerializer
from workouts.models import Workout, SetDict
from decimal import Decimal
from rest_framework import serializers

@pytest.mark.django_db
def test_workout_serializer_create(create_user):
    """Test that WorkoutSerializer correctly creates a workout."""
    workout_data = {"workout_name": "Push Day"}
    serializer = WorkoutSerializer(data=workout_data, context={"request": create_user})
    
    assert serializer.is_valid(), serializer.errors
    workout = serializer.save(user=create_user)

    assert workout.workout_name == "Push Day"
    assert workout.user == create_user

@pytest.mark.django_db
def test_workout_serializer_update(create_workout):
    """Test that WorkoutSerializer correctly updates a workout."""
    serializer = WorkoutSerializer(instance=create_workout, data={"notes": "Updated Notes"}, partial=True)
    
    assert serializer.is_valid(), serializer.errors
    updated_workout = serializer.save()

    assert updated_workout.notes == "Updated Notes"

@pytest.mark.django_db
def test_workout_serializer_optional_fields(create_user):
    """Test that WorkoutSerializer allows optional fields."""
    workout_data = {
        "workout_name": "Recovery Session",
        "user_weight": None,
        "sleep_score": None,
        "sleep_quality": None,
        "notes": None,
    }

    serializer = WorkoutSerializer(data=workout_data, context={"request": create_user})
    assert serializer.is_valid(), serializer.errors

@pytest.mark.django_db
def test_setdict_serializer_create(create_workout):
    """Test that SetDictSerializer correctly creates a set entry."""
    set_data = {
        "exercise_name": "Deadlift",
        "set_order": 1,
        "set_number": 1,
        "reps": 5,
        "loading": 150.0,
    }

    serializer = SetDictSerializer(data=set_data, context={"workout": create_workout})
    assert serializer.is_valid(), serializer.errors

    set_dict = serializer.save()
    assert set_dict.exercise_name == "Deadlift"
    assert set_dict.workout == create_workout
    assert set_dict.reps == 5
    assert set_dict.loading == 150.0

@pytest.mark.django_db
def test_setdict_serializer_update(create_setdict):
    """Test that SetDictSerializer correctly updates a set entry."""
    serializer = SetDictSerializer(instance=create_setdict, data={"reps": 8}, partial=True)

    assert serializer.is_valid(), serializer.errors
    updated_set = serializer.save()

    assert updated_set.reps == 8

@pytest.mark.django_db
def test_setdict_serializer_missing_workout():
    """Test that SetDictSerializer raises an error when saving without a workout."""
    set_data = {
        "exercise_name": "Pull-up",
        "set_order": 2,
        "set_number": 1,
        "reps": 10,
    }

    serializer = SetDictSerializer(data=set_data)
    assert serializer.is_valid(), serializer.errors  # ✅ Validation passes because `workout` is read-only

    with pytest.raises(serializers.ValidationError) as excinfo:
        serializer.save()  # ✅ Should raise an error when trying to save
    
    assert "workout" in str(excinfo.value)  # ✅ Ensure error mentions missing workout

