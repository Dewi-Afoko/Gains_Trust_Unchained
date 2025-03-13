import pytest
from workouts.models import SetDict

@pytest.mark.django_db
def test_assign_set_order(create_workout):
    """Test that `set_order` is assigned correctly before saving a new set."""
    set1 = SetDict.objects.create(workout=create_workout, exercise_name="Squat")
    set2 = SetDict.objects.create(workout=create_workout, exercise_name="Squat")
    
    assert set1.set_order == 1  # ✅ First set should be 1
    assert set2.set_order == 2  # ✅ Second set should be 2

@pytest.mark.django_db
def test_reorder_sets_after_creation(create_workout):
    """Test that `set_number` updates correctly after adding sets."""
    set1 = SetDict.objects.create(workout=create_workout, exercise_name="Bench Press")
    set2 = SetDict.objects.create(workout=create_workout, exercise_name="Bench Press")
    set3 = SetDict.objects.create(workout=create_workout, exercise_name="Squat")
    
    set1.refresh_from_db()
    set2.refresh_from_db()
    set3.refresh_from_db()

    assert set1.set_number == 1
    assert set2.set_number == 2  # ✅ Same exercise, should be numbered sequentially
    assert set3.set_number == 1  # ✅ Different exercise, starts at 1

@pytest.mark.django_db
def test_reorder_sets_after_deletion(create_workout):
    """Test that `set_number` updates correctly when a set is deleted."""
    set1 = SetDict.objects.create(workout=create_workout, exercise_name="Deadlift")
    set2 = SetDict.objects.create(workout=create_workout, exercise_name="Deadlift")
    set3 = SetDict.objects.create(workout=create_workout, exercise_name="Deadlift")

    set2.delete()  # ✅ Remove middle set

    set1.refresh_from_db()
    set3.refresh_from_db()

    assert set1.set_number == 1
    assert set3.set_number == 2  # ✅ Should shift down correctly

@pytest.mark.django_db
def test_reorder_sets_with_different_exercises(create_workout):
    """Test that `set_number` updates correctly when different exercises are mixed."""
    set1 = SetDict.objects.create(workout=create_workout, exercise_name="Squat")
    set2 = SetDict.objects.create(workout=create_workout, exercise_name="Bench Press")
    set3 = SetDict.objects.create(workout=create_workout, exercise_name="Squat")

    set1.refresh_from_db()
    set2.refresh_from_db()
    set3.refresh_from_db()

    assert set1.set_number == 1
    assert set2.set_number == 1  # ✅ Different exercise, should start from 1
    assert set3.set_number == 2  # ✅ Squat should continue numbering sequentially

@pytest.mark.django_db
def test_reorder_sets_ensures_sequential_set_order(create_workout):
    """Test that `set_order` remains sequential even when sets are manually moved."""
    set1 = SetDict.objects.create(workout=create_workout, exercise_name="Pull-up")  # ✅ Normal order
    set2 = SetDict.objects.create(workout=create_workout, exercise_name="Pull-up")
    set3 = SetDict.objects.create(workout=create_workout, exercise_name="Pull-up", set_order=10)  # ✅ Manually set

    # ✅ Refresh from DB to check actual assigned values
    set1.refresh_from_db()
    set2.refresh_from_db()
    set3.refresh_from_db()

    # ✅ Ensure all sets have sequential `set_order`
    assert set1.set_order == 1
    assert set2.set_order == 2
    assert set3.set_order == 3  # ✅ Even if originally moved, `set_order` should be sequential

