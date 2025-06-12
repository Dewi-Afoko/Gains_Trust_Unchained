import pytest
from workouts.models import SetDict, Workout
from workouts.signals import local_storage

@pytest.mark.django_db
def test_assign_set_order(create_user):
    """Test that a set is assigned the correct set_order when created."""
    workout = Workout.objects.create(user=create_user, workout_name="Test Workout")
    
    set1 = SetDict.objects.create(workout=workout, exercise_name="Squat")
    set2 = SetDict.objects.create(workout=workout, exercise_name="Bench Press")
    
    assert set1.set_order == 1
    assert set2.set_order == 2

@pytest.mark.django_db
def test_reorder_sets_after_creation(create_user):
    """Test that sets are reordered correctly after creation."""
    workout = Workout.objects.create(user=create_user, workout_name="Test Workout")
    
    # Create sets with the same exercise name
    set1 = SetDict.objects.create(workout=workout, exercise_name="Squat")
    set2 = SetDict.objects.create(workout=workout, exercise_name="Squat")
    set3 = SetDict.objects.create(workout=workout, exercise_name="Bench Press")
    
    # Refresh from database to see the signal effects
    set1.refresh_from_db()
    set2.refresh_from_db()
    set3.refresh_from_db()
    
    assert set1.set_number == 1
    assert set2.set_number == 2
    assert set3.set_number == 1  # First bench press set

@pytest.mark.django_db
def test_reorder_sets_after_deletion(create_user):
    """Test that sets are reordered correctly after deletion."""
    workout = Workout.objects.create(user=create_user, workout_name="Test Workout")
    
    # Create three sets
    set1 = SetDict.objects.create(workout=workout, exercise_name="Squat")
    set2 = SetDict.objects.create(workout=workout, exercise_name="Squat")
    set3 = SetDict.objects.create(workout=workout, exercise_name="Squat")
    
    # Delete the middle set
    set2.delete()
    
    # Refresh remaining sets
    set1.refresh_from_db()
    set3.refresh_from_db()
    
    # Check that order is maintained
    assert set1.set_order == 1
    assert set3.set_order == 2

@pytest.mark.django_db
def test_reorder_sets_with_different_exercises(create_user):
    """Test reordering with multiple different exercises."""
    workout = Workout.objects.create(user=create_user, workout_name="Test Workout")
    
    # Create sets with different exercises
    set1 = SetDict.objects.create(workout=workout, exercise_name="Squat")
    set2 = SetDict.objects.create(workout=workout, exercise_name="Bench Press")
    set3 = SetDict.objects.create(workout=workout, exercise_name="Squat")
    set4 = SetDict.objects.create(workout=workout, exercise_name="Bench Press")
    
    # Refresh all sets
    for s in [set1, set2, set3, set4]:
        s.refresh_from_db()
    
    # Check set numbers for each exercise
    assert set1.set_number == 1  # First squat
    assert set2.set_number == 1  # First bench press
    assert set3.set_number == 2  # Second squat
    assert set4.set_number == 2  # Second bench press

@pytest.mark.django_db 
def test_reorder_sets_ensures_sequential_set_order(create_user):
    """Test that set_order is always sequential regardless of creation order."""
    workout = Workout.objects.create(user=create_user, workout_name="Test Workout")
    
    # Create sets
    set1 = SetDict.objects.create(workout=workout, exercise_name="Squat")
    set2 = SetDict.objects.create(workout=workout, exercise_name="Bench Press")
    
    # Manually change set_order to test reordering
    set1.set_order = 5
    set1.save()
    
    # Create another set to trigger reordering
    set3 = SetDict.objects.create(workout=workout, exercise_name="Deadlift")
    
    # Refresh all sets
    set1.refresh_from_db()
    set2.refresh_from_db()
    set3.refresh_from_db()
    
    # Check that orders are sequential
    orders = [set1.set_order, set2.set_order, set3.set_order]
    orders.sort()
    assert orders == [1, 2, 3]

@pytest.mark.django_db
def test_disable_reorder_signal(create_user):
    """Test that reordering is disabled when disable_reorder_signal is True."""
    workout = Workout.objects.create(user=create_user, workout_name="Test Workout")
    
    # Set the disable flag
    local_storage.disable_reorder_signal = True
    
    try:
        # Create sets - reordering should be skipped
        set1 = SetDict.objects.create(workout=workout, exercise_name="Squat")
        set2 = SetDict.objects.create(workout=workout, exercise_name="Squat")
        
        # Manually set different orders
        set1.set_order = 10
        set1.save()
        
        # Since reordering is disabled, the order should not change
        set2.refresh_from_db()
        
        # The signal should not have reordered the sets
        assert set1.set_order == 10
        
    finally:
        # Always clean up the flag
        local_storage.disable_reorder_signal = False

