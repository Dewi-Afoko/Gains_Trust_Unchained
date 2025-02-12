import pytest
from django.urls import reverse
from rest_framework import status
from workouts.models import Workout, SetDict

# ✅ TEST WorkoutView
@pytest.mark.django_db
def test_get_workouts_authenticated(api_client, create_user, create_workout):
    """Test retrieving workouts for an authenticated user"""
    api_client.force_authenticate(user=create_user)
    response = api_client.get(reverse("workouts"))
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) > 0


@pytest.mark.django_db
def test_get_workouts_unauthenticated(api_client):
    """Test retrieving workouts without authentication"""
    response = api_client.get(reverse("workouts"))
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_create_workout_authenticated(api_client, create_user):
    """Test creating a workout while authenticated"""
    api_client.force_authenticate(user=create_user)
    data = {"workout_name": "Test Workout"}
    
    response = api_client.post(reverse("workouts"), data)
    
    assert response.status_code == status.HTTP_201_CREATED
    assert "Test Workout" in response.data["message"]


@pytest.mark.django_db
def test_create_workout_unauthenticated(api_client):
    """Test creating a workout while unauthenticated"""
    data = {"workout_name": "Unauthorized Workout"}
    
    response = api_client.post(reverse("workouts"), data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_update_workout_authenticated(api_client, create_user, create_workout):
    """Test updating a workout while authenticated"""
    api_client.force_authenticate(user=create_user)
    data = {"workout_name": "Updated Workout"}
    
    response = api_client.patch(reverse("workout-detail", args=[create_workout.id]), data)
    
    assert response.status_code == status.HTTP_200_OK
    assert "Updated Workout" in response.data["message"]


@pytest.mark.django_db
def test_update_workout_unauthorized(api_client, create_workout):
    """Test updating a workout while unauthenticated"""
    data = {"workout_name": "Unauthorized Update"}
    
    response = api_client.patch(reverse("workout-detail", args=[create_workout.id]), data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_delete_workout_authenticated(api_client, create_user, create_workout):
    """Test deleting a workout while authenticated"""
    api_client.force_authenticate(user=create_user)
    
    response = api_client.delete(reverse("workout-detail", args=[create_workout.id]))
    
    assert response.status_code == status.HTTP_200_OK
    assert "deleted" in response.data["message"]


@pytest.mark.django_db
def test_delete_workout_unauthorized(api_client, create_workout):
    """Test deleting a workout while unauthenticated"""
    response = api_client.delete(reverse("workout-detail", args=[create_workout.id]))
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ✅ TEST SetDictView
@pytest.mark.django_db
def test_get_setdicts_authenticated(api_client, create_user, create_workout, create_setdict):
    """Test retrieving SetDicts for an authenticated user"""
    api_client.force_authenticate(user=create_user)
    
    response = api_client.get(reverse("set-list", args=[create_workout.id]))
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) > 0


@pytest.mark.django_db
def test_get_setdicts_unauthenticated(api_client, create_workout):
    """Test retrieving SetDicts without authentication"""
    response = api_client.get(reverse("set-list", args=[create_workout.id]))
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_create_setdict_authenticated(api_client, create_user, create_workout):
    """Test creating a SetDict while authenticated"""
    api_client.force_authenticate(user=create_user)
    data = {"exercise_name": "Squat", "loading": 100, "reps": 5}
    
    response = api_client.post(reverse("set-list", args=[create_workout.id]), data)
    
    assert response.status_code == status.HTTP_201_CREATED
    assert "Squat" in response.data["message"]


@pytest.mark.django_db
def test_create_setdict_unauthenticated(api_client, create_workout):
    """Test creating a SetDict while unauthenticated"""
    data = {"exercise_name": "Deadlift", "loading": 150, "reps": 3}
    
    response = api_client.post(reverse("set-list", args=[create_workout.id]), data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_update_setdict_authenticated(api_client, create_user, create_workout, create_setdict):
    """Test updating a SetDict while authenticated"""
    api_client.force_authenticate(user=create_user)
    data = {"loading": 120}
    
    response = api_client.patch(reverse("set-detail", args=[create_workout.id, create_setdict.id]), data)
    
    assert response.status_code == status.HTTP_200_OK
    assert "updated" in response.data["message"]


@pytest.mark.django_db
def test_update_setdict_unauthorized(api_client, create_workout, create_setdict):
    """Test updating a SetDict while unauthenticated"""
    data = {"loading": 200}
    
    response = api_client.patch(reverse("set-detail", args=[create_workout.id, create_setdict.id]), data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_delete_setdict_authenticated(api_client, create_user, create_workout, create_setdict):
    """Test deleting a SetDict while authenticated"""
    api_client.force_authenticate(user=create_user)
    
    response = api_client.delete(reverse("set-detail", args=[create_workout.id, create_setdict.id]))
    
    assert response.status_code == status.HTTP_200_OK
    assert "deleted" in response.data["message"]


@pytest.mark.django_db
def test_delete_setdict_unauthorized(api_client, create_workout, create_setdict):
    """Test deleting a SetDict while unauthenticated"""
    response = api_client.delete(reverse("set-detail", args=[create_workout.id, create_setdict.id]))
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_create_workout_invalid_data(api_client, create_user):
    """Test creating a workout with invalid data (empty name)"""
    api_client.force_authenticate(user=create_user)
    data = {"workout_name": ""}  # Invalid because it's empty
    
    response = api_client.post(reverse("workouts"), data)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "workout_name" in response.data  # Should return an error message


@pytest.mark.django_db
def test_update_workout_invalid_data(api_client, create_user, create_workout):
    """Test updating a workout with invalid data (empty name)"""
    api_client.force_authenticate(user=create_user)
    data = {"workout_name": ""}  # Invalid because it's empty
    
    response = api_client.patch(reverse("workout-detail", args=[create_workout.id]), data)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "workout_name" in response.data  # Should return an error message


@pytest.mark.django_db
def test_create_setdict_invalid_data(api_client, create_user, create_workout):
    """Test creating a SetDict with invalid data (missing required fields)"""
    api_client.force_authenticate(user=create_user)
    data = {"exercise_name": ""}  # Invalid because it's empty
    
    response = api_client.post(reverse("set-list", args=[create_workout.id]), data)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "exercise_name" in response.data  # Should return an error message


@pytest.mark.django_db
def test_update_setdict_invalid_data(api_client, create_user, create_workout, create_setdict):
    """Test updating a SetDict with invalid data (empty exercise name)"""
    api_client.force_authenticate(user=create_user)
    data = {"exercise_name": ""}  # Invalid because it's empty
    
    response = api_client.patch(reverse("set-detail", args=[create_workout.id, create_setdict.id]), data)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "exercise_name" in response.data  # Should return an error message

