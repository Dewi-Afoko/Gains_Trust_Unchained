import pytest
from core.models import Exercise


@pytest.mark.django_db
def test_exercise_creation():
    """Test that an Exercise can be created successfully."""
    exercise = Exercise.objects.create(
        name="Bench Press",
        description="A compound upper body exercise",
        muscle_group="chest",
        instructions=["Lie on bench", "Lower weight to chest", "Press up"],
        target_muscles=["pectorals", "triceps"],
        synergist_muscles=["deltoids"],
        equipment=["barbell", "bench"],
        compound_movement=True
    )
    
    assert exercise.name == "Bench Press"
    assert exercise.description == "A compound upper body exercise"
    assert exercise.muscle_group == "chest"
    assert exercise.instructions == ["Lie on bench", "Lower weight to chest", "Press up"]
    assert exercise.target_muscles == ["pectorals", "triceps"]
    assert exercise.synergist_muscles == ["deltoids"]
    assert exercise.equipment == ["barbell", "bench"]
    assert exercise.compound_movement is True

@pytest.mark.django_db
def test_exercise_str_method():
    """Test the string representation of Exercise model."""
    exercise = Exercise.objects.create(
        name="Squat",
        description="A fundamental lower body exercise"
    )
    
    expected_str = f"{exercise.name}\nDescription: {exercise.description}"
    assert str(exercise) == expected_str

@pytest.mark.django_db
def test_exercise_minimal_creation():
    """Test Exercise creation with only required fields."""
    exercise = Exercise.objects.create(name="Pull-up")
    
    assert exercise.name == "Pull-up"
    assert exercise.description == ""
    assert exercise.muscle_group == ""
    assert exercise.instructions == []
    assert exercise.target_muscles == []
    assert exercise.synergist_muscles == []
    assert exercise.equipment == []
    assert exercise.compound_movement is None

@pytest.mark.django_db
def test_exercise_unique_name():
    """Test that exercise names must be unique."""
    Exercise.objects.create(name="Deadlift")
    
    with pytest.raises(Exception):  # Should raise IntegrityError
        Exercise.objects.create(name="Deadlift")

@pytest.mark.django_db
def test_exercise_blank_fields():
    """Test Exercise with all optional fields blank."""
    exercise = Exercise.objects.create(
        name="Test Exercise",
        description="",
        muscle_group="",
        instructions=[],
        target_muscles=[],
        synergist_muscles=[],
        equipment=[],
        compound_movement=None
    )
    
    assert exercise.name == "Test Exercise"
    assert exercise.description == ""
    assert exercise.muscle_group == ""
    assert exercise.instructions == []
    assert exercise.target_muscles == []
    assert exercise.synergist_muscles == []
    assert exercise.equipment == []
    assert exercise.compound_movement is None 