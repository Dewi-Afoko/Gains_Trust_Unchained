import pytest
from django.urls import reverse
from workouts.models import Workout, SetDict
from django.utils.timezone import now
from datetime import timedelta
from workouts.serializers import SetDictSerializer
from workouts.views import skip_active_set, update_active_set

@pytest.mark.django_db
def test_create_workout(authenticated_client):
    """Test creating a workout via WorkoutViewSet."""
    workout_data = {"workout_name": "Leg Day"}
    response = authenticated_client.post(reverse("workouts-list"), workout_data)

    assert response.status_code == 201
    assert Workout.objects.filter(workout_name="Leg Day").exists()

@pytest.mark.django_db
def test_retrieve_workout(authenticated_client, create_workout):
    """Test retrieving a workout via WorkoutViewSet."""
    response = authenticated_client.get(reverse("workouts-detail", args=[create_workout.id]))

    assert response.status_code == 200
    assert response.data["workout_name"] == create_workout.workout_name

@pytest.mark.django_db
def test_update_workout(authenticated_client, create_workout):
    """Test updating a workout via WorkoutViewSet."""
    response = authenticated_client.patch(reverse("workouts-detail", args=[create_workout.id]), {"notes": "Updated"})

    assert response.status_code == 200
    assert response.data["notes"] == "Updated"

@pytest.mark.django_db
def test_delete_workout(authenticated_client, create_workout):
    """Test deleting a workout via WorkoutViewSet."""
    response = authenticated_client.delete(reverse("workouts-detail", args=[create_workout.id]))

    assert response.status_code == 204
    assert not Workout.objects.filter(id=create_workout.id).exists()

@pytest.mark.django_db
def test_duplicate_workout(authenticated_client, create_workout):
    """Test duplicating a workout."""
    response = authenticated_client.post(reverse("workouts-duplicate", args=[create_workout.id]))

    assert response.status_code == 201
    assert Workout.objects.filter(workout_name__icontains="(Copy)").exists()

@pytest.mark.django_db
def test_duplicate_set(authenticated_client, create_setdict):
    """Test duplicating a set."""
    response = authenticated_client.post(reverse("sets-duplicate", args=[create_setdict.id]))

    assert response.status_code == 201
    assert "duplicated" in response.data["message"]

@pytest.mark.django_db
def test_start_workout(authenticated_client, create_workout):
    """Test starting a workout, setting start_time."""
    response = authenticated_client.patch(reverse("workouts-start-workout", args=[create_workout.id]))

    assert response.status_code == 200
    create_workout.refresh_from_db()
    assert create_workout.start_time is not None

@pytest.mark.django_db
def test_start_workout_already_started(authenticated_client, create_workout):
    """Test restarting an already started workout."""
    # First start the workout
    create_workout.start_time = now()
    create_workout.save()
    
    response = authenticated_client.patch(reverse("workouts-start-workout", args=[create_workout.id]))

    assert response.status_code == 200
    assert "restarted" in response.data["message"]

@pytest.mark.django_db
def test_complete_workout(authenticated_client, create_workout):
    """Test completing a workout, ensuring duration is calculated."""
    create_workout.start_time = now() - timedelta(minutes=45)  # ✅ Simulate started workout
    create_workout.save()

    response = authenticated_client.patch(reverse("workouts-complete-workout", args=[create_workout.id]))

    assert response.status_code == 200
    create_workout.refresh_from_db()
    assert create_workout.complete is True
    assert create_workout.duration > 0

@pytest.mark.django_db
def test_complete_workout_not_started(authenticated_client, create_workout):
    """Test completing a workout that hasn't been started."""
    response = authenticated_client.patch(reverse("workouts-complete-workout", args=[create_workout.id]))

    assert response.status_code == 400
    assert "cannot be marked complete before it has been started" in response.data["message"]

@pytest.mark.django_db
def test_complete_workout_already_completed(authenticated_client, create_workout):
    """Test completing a workout that is already completed."""
    create_workout.start_time = now() - timedelta(minutes=45)
    create_workout.complete = True
    create_workout.save()

    response = authenticated_client.patch(reverse("workouts-complete-workout", args=[create_workout.id]))

    assert response.status_code == 400
    assert "already marked as complete" in response.data["error"]

@pytest.mark.django_db
def test_get_sets_filtered_by_workout(authenticated_client, create_workout, create_user):
    """Test filtering sets by workout."""
    # Create sets for this workout
    set1 = SetDict.objects.create(workout=create_workout, exercise_name="Squat")
    
    # Create another workout and set
    workout2 = Workout.objects.create(user=create_user, workout_name="Other Workout")
    set2 = SetDict.objects.create(workout=workout2, exercise_name="Deadlift")
    
    response = authenticated_client.get(reverse("sets-list"), {"workout": create_workout.id})
    
    assert response.status_code == 200
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["id"] == set1.id

@pytest.mark.django_db
def test_create_set(authenticated_client, create_workout):
    """Test creating a set entry via the API endpoint."""

    # ✅ Create a set via the actual API endpoint
    set_data = {
        "exercise_name": "Bench Press",
        "reps": 10,
        "loading": 80.0,
        "workout": create_workout.id,  # Pass workout ID as the ViewSet expects
    }

    response = authenticated_client.post(reverse("sets-list"), set_data)
    
    assert response.status_code == 201
    assert response.data["exercise_name"] == "Bench Press"
    assert response.data["reps"] == 10
    assert response.data["loading"] == 80.0
    
    # Verify the set was created in the database
    set_dict = SetDict.objects.get(id=response.data["id"])
    assert set_dict.workout == create_workout


@pytest.mark.django_db
def test_retrieve_set(authenticated_client, create_setdict):
    """Test retrieving a set entry via SetDictViewSet."""
    response = authenticated_client.get(reverse("sets-detail", args=[create_setdict.id]))

    assert response.status_code == 200
    assert response.data["exercise_name"] == create_setdict.exercise_name

@pytest.mark.django_db
def test_update_set(authenticated_client, create_setdict):
    """Test updating a set entry via SetDictViewSet."""
    response = authenticated_client.patch(reverse("sets-detail", args=[create_setdict.id]), {"reps": 12})

    assert response.status_code == 200
    assert response.data["reps"] == 12

@pytest.mark.django_db
def test_delete_set(authenticated_client, create_setdict):
    """Test deleting a set entry via SetDictViewSet."""
    response = authenticated_client.delete(reverse("sets-detail", args=[create_setdict.id]))

    assert response.status_code == 204
    assert not SetDict.objects.filter(id=create_setdict.id).exists()

@pytest.mark.django_db
def test_complete_set(authenticated_client, create_setdict):
    """Test completing a set via complete_set action."""
    url = reverse("sets-complete-set", args=[create_setdict.id])

    response = authenticated_client.patch(url)

    assert response.status_code == 200
    create_setdict.refresh_from_db()
    assert create_setdict.complete is True  # ✅ Set should be marked as complete


@pytest.mark.django_db
def test_skip_set(authenticated_client, create_setdict):
    """Test skipping a set via skip_set action (moving to last)."""
    url = reverse("sets-skip-set", args=[create_setdict.id])

    response = authenticated_client.patch(url)

    assert response.status_code == 200
    create_setdict.refresh_from_db()
    assert create_setdict.set_order > 0  # ✅ Set should be moved to last position
    assert create_setdict.is_active_set is False  # ✅ Set should not be active


@pytest.mark.django_db
def test_move_set(authenticated_client, create_setdict):
    """Test moving a set to a new position via move_set action."""
    # Create another set for testing the move
    set2 = SetDict.objects.create(workout=create_setdict.workout, exercise_name="Deadlift", set_order=2)

    url = reverse("sets-move-set", args=[create_setdict.id])
    data = {"new_position": 2}  # Moving set1 to position 2

    response = authenticated_client.patch(url, data)

    assert response.status_code == 200
    create_setdict.refresh_from_db()
    set2.refresh_from_db()

    # Ensure the order is updated correctly
    assert create_setdict.set_order == 2
    assert set2.set_order == 1

@pytest.mark.django_db
def test_complete_set_mark_incomplete(authenticated_client, create_setdict):
    """Test that a set can be marked complete and then incomplete (reseting variables)."""

    # ✅ Initially mark the set as complete
    response = authenticated_client.patch(reverse("sets-complete-set", args=[create_setdict.id]))
    assert response.status_code == 200
    create_setdict.refresh_from_db()

    assert create_setdict.complete is True  # ✅ Set should be marked as complete

    # ✅ Now, mark the set as incomplete
    response = authenticated_client.patch(reverse("sets-complete-set", args=[create_setdict.id]))
    assert response.status_code == 200
    create_setdict.refresh_from_db()

    # ✅ Ensure variables are reset
    assert create_setdict.complete is False  # ✅ Set should now be incomplete
    assert create_setdict.set_duration is None  # ✅ Duration should be reset
    assert create_setdict.set_start_time is None  # ✅ Start time should be reset


@pytest.mark.django_db
def test_update_active_set(authenticated_client, create_user):
    """Test that the active set is correctly updated when `update_active_set` is called."""
    
    # Step 1: Create a workout with start_time
    workout = Workout.objects.create(user=create_user, workout_name="Push Day", start_time=now())

    # Step 2: Create multiple sets, some incomplete
    set1 = SetDict.objects.create(workout=workout, exercise_name="Squat", set_order=1, complete=False)
    set2 = SetDict.objects.create(workout=workout, exercise_name="Bench Press", set_order=2, complete=False)

    # Step 3: Set the first set as active
    set1.is_active_set = True
    set1.complete = True
    set1.save()

    # Ensure `update_active_set` works and only the next incomplete set is marked active
    update_active_set(workout.id)

    set1.refresh_from_db()
    set2.refresh_from_db()

    assert set1.is_active_set is False  # ✅ The previous set should no longer be active
    assert set2.is_active_set is True  # ✅ The next incomplete set should be active

@pytest.mark.django_db
def test_update_active_set_with_rest_timing(authenticated_client, create_user):
    """Test that active set timing considers rest periods."""
    
    # Step 1: Create a workout with start_time
    workout = Workout.objects.create(user=create_user, workout_name="Push Day", start_time=now())

    # Step 2: Create sets with rest time
    set1 = SetDict.objects.create(workout=workout, exercise_name="Squat", set_order=1, complete=True, rest=60)
    set2 = SetDict.objects.create(workout=workout, exercise_name="Bench Press", set_order=2, complete=False)

    # Ensure `update_active_set` works with rest timing
    update_active_set(workout.id)

    set2.refresh_from_db()
    assert set2.is_active_set is True
    assert set2.set_start_time is not None


@pytest.mark.django_db
def test_skip_active_set(authenticated_client, create_user):
    """Test that a skipped set activates the next available set."""

    # Step 1: Create a workout with start_time
    workout = Workout.objects.create(user=create_user, workout_name="Push Day", start_time=now())

    # Step 2: Create multiple sets, some incomplete
    set1 = SetDict.objects.create(workout=workout, exercise_name="Squat", set_order=1, complete=False)
    set2 = SetDict.objects.create(workout=workout, exercise_name="Bench Press", set_order=2, complete=False)
    skipped_set = SetDict.objects.create(workout=workout, exercise_name="Deadlift", set_order=3, complete=False)

    # Step 3: Set the first set as active
    set1.is_active_set = True
    set1.save()

    # Step 4: Skip the active set
    skip_active_set(workout.id, set1)

    set1.refresh_from_db()
    skipped_set.refresh_from_db()
    set2.refresh_from_db()

    # Step 5: Ensure the set we just skipped is inactive, and the next set is active
    assert set1.is_active_set is False  # ✅ The set we just skipped should no longer be active
    assert set2.is_active_set is True  # ✅ The skipped set should be marked as active

