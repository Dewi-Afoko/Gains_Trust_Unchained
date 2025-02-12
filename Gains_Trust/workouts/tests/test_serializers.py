import pytest
from workouts.serializers import WorkoutSerializer, SetDictSerializer
from rest_framework.exceptions import ValidationError


# ✅ TEST WorkoutSerializer
@pytest.mark.django_db
def test_workout_serializer_create_valid_data(create_workout):
    """Test creating a workout with valid data"""
    serializer = WorkoutSerializer(instance=create_workout)
    data = serializer.data

    assert data["workout_name"] == create_workout.workout_name
    assert data["id"] == create_workout.id
    assert "user" in data  # Should be present but read-only


@pytest.mark.django_db
def test_workout_serializer_create_invalid_data(factory):
    """Test creating a workout without authentication"""
    request = factory.post("/api/workouts/")
    request.user = None  # Explicitly attach a None user

    data = {"workout_name": "Chest Day"}
    serializer = WorkoutSerializer(data=data, context={"request": request})

    assert serializer.is_valid(), serializer.errors  # Ensure validation passes

    with pytest.raises(ValidationError) as exc_info:
        serializer.save()

    assert "user" in exc_info.value.detail


@pytest.mark.django_db
def test_workout_serializer_update(create_workout):
    """Test updating a workout with valid data"""
    serializer = WorkoutSerializer(
        instance=create_workout,
        data={"workout_name": "New Workout"},
        partial=True,
    )

    assert serializer.is_valid(), serializer.errors
    updated_workout = serializer.save()

    assert updated_workout.workout_name == "New Workout"


@pytest.mark.django_db
def test_workout_serializer_read_only_fields(create_workout):
    """Test that read-only fields cannot be updated"""
    serializer = WorkoutSerializer(
        instance=create_workout, data={"user": None}, partial=True
    )

    assert serializer.is_valid(), serializer.errors
    updated_workout = serializer.save()

    assert updated_workout.user == create_workout.user  # User should remain unchanged


# ✅ TEST SetDictSerializer
@pytest.mark.django_db
def test_setdict_serializer_create_valid_data(create_setdict):
    """Test creating a SetDict with valid data"""
    serializer = SetDictSerializer(instance=create_setdict)
    data = serializer.data

    assert data["exercise_name"] == create_setdict.exercise_name
    assert data["set_number"] == create_setdict.set_number


@pytest.mark.django_db
def test_setdict_serializer_create_invalid_data():
    """Test creating a SetDict without a workout in context"""
    serializer = SetDictSerializer(data={"exercise_name": "Squat", "reps": 5})

    # Validate first
    assert serializer.is_valid(), serializer.errors

    # Now try to save and expect an error
    with pytest.raises(ValidationError) as exc_info:
        serializer.save()

    assert "workout" in exc_info.value.detail  # Ensure error is correctly raised


@pytest.mark.django_db
def test_setdict_serializer_update(create_setdict):
    """Test updating a SetDict with valid data"""
    serializer = SetDictSerializer(
        instance=create_setdict, data={"reps": 8}, partial=True
    )

    assert serializer.is_valid(), serializer.errors
    updated_set = serializer.save()

    assert updated_set.reps == 8


@pytest.mark.django_db
def test_setdict_serializer_read_only_fields(create_setdict):
    """Test that read-only fields cannot be updated"""
    serializer = SetDictSerializer(
        instance=create_setdict,
        data={"set_number": 99, "set_order": 99},
        partial=True,
    )

    assert serializer.is_valid(), serializer.errors
    updated_set = serializer.save()

    assert (
        updated_set.set_number == create_setdict.set_number
    )  # Should remain unchanged
    assert updated_set.set_order == create_setdict.set_order  # Should remain unchanged
