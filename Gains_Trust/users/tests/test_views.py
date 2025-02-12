import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from users.models import Weight
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import reverse



import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from users.models import Weight


# ✅ TEST USER REGISTRATION
@pytest.mark.django_db
def test_register_valid_data(api_client, user_data):
    """Test registering a user with valid data"""
    response = api_client.post(reverse("register"), user_data, format="json")
    
    assert response.status_code == status.HTTP_201_CREATED
    assert "message" in response.data
    assert f"{user_data['username']} successfully registered!" in response.data["message"]


@pytest.mark.django_db
def test_register_missing_password(api_client, user_data):
    """Test registering a user with missing password"""
    del user_data["password"]
    response = api_client.post(reverse("register"), user_data, format="json")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.data


@pytest.mark.django_db
def test_register_existing_username(api_client, user_data, create_user):
    """Test registering a user with an existing username"""
    response = api_client.post(reverse("register"), user_data, format="json")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "username" in response.data


# ✅ TEST LOGOUT
@pytest.mark.django_db
def test_logout_missing_token(api_client, create_user):
    """Test logout with a missing refresh token"""
    api_client.force_authenticate(user=create_user)
    response = api_client.post(reverse("logout"), {}, format="json")  # Missing token
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in response.data
    assert response.data["error"] == "Refresh token missing."


@pytest.mark.django_db
def test_logout_invalid_token(api_client, create_user):
    """Test logout with an invalid refresh token"""
    api_client.force_authenticate(user=create_user)
    response = api_client.post(reverse("logout"), {"refresh": "invalid_token"}, format="json")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "error" in response.data
    assert response.data["error"] == "Invalid token."


@pytest.mark.django_db
def test_logout_valid_token(api_client, create_user):
    """Test logout with a valid refresh token"""
    api_client.force_authenticate(user=create_user)
    refresh_token = str(RefreshToken.for_user(create_user))  
    
    response = api_client.post(reverse("logout"), {"refresh": refresh_token}, format="json")
    
    assert response.status_code == status.HTTP_205_RESET_CONTENT
    assert "message" in response.data
    assert response.data["message"] == "Successfully logged out."


# ✅ TEST USER UPDATES
@pytest.mark.django_db
def test_update_user_valid_data(api_client, create_user):
    """Test updating a user with valid data"""
    api_client.force_authenticate(user=create_user)
    data = {"height": 180, "dob": "1990-01-01"}
    
    response = api_client.patch(reverse("update"), data, format="json")
    
    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.data
    assert response.data["message"] == f"User details updated successfully for {create_user.username}."
    assert "data" in response.data
    assert response.data["data"]["height"] == data["height"]
    assert response.data["data"]["dob"] == data["dob"]


@pytest.mark.django_db
def test_update_user_invalid_data(api_client, create_user):
    """Test updating the user with invalid data"""
    api_client.force_authenticate(user=create_user)
    data = {"height": "invalid_value", "dob": "invalid_date"}
    
    response = api_client.patch(reverse("update"), data, format="json")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "height" in response.data
    assert "dob" in response.data


@pytest.mark.django_db
def test_update_user_without_authentication(api_client):
    """Test that a user cannot update their details without authentication"""
    data = {"height": 180, "dob": "1990-01-01"}
    response = api_client.patch(reverse("update"), data, format="json")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "detail" in response.data
    assert response.data["detail"] == "Authentication credentials were not provided."


# ✅ TEST WEIGHT CREATION & RETRIEVAL
@pytest.mark.django_db
def test_create_weight_invalid_data(api_client, create_user):
    """Test that a 400 Bad Request is returned when invalid weight data is provided"""
    api_client.force_authenticate(user=create_user)
    invalid_data = {}
    
    response = api_client.post(reverse("weights"), invalid_data, format="json")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "weight" in response.data


@pytest.mark.django_db
def test_create_weight_authenticated(api_client, create_user, weight_data):
    """Test creating a weight record with an authenticated user"""
    api_client.force_authenticate(user=create_user)
    response = api_client.post(reverse("weights"), weight_data, format="json")
    
    assert response.status_code == status.HTTP_201_CREATED
    assert "message" in response.data
    assert f"{weight_data['weight']:.2f} logged" in response.data["message"]
    assert f"by {create_user.username}" in response.data["message"]


@pytest.mark.django_db
def test_create_weight_unauthenticated(api_client, weight_data):
    """Test creating a weight record without authentication"""
    response = api_client.post(reverse("weights"), weight_data, format="json")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_get_weights_authenticated(api_client, create_user, create_weight):
    """Test retrieving weight records with an authenticated user"""
    api_client.force_authenticate(user=create_user)
    
    response = api_client.get(reverse("weights"))
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1


@pytest.mark.django_db
def test_get_weights_unauthenticated(api_client):
    """Test retrieving weight records without authentication"""
    response = api_client.get(reverse("weights"))
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ✅ TEST WEIGHT DELETION
@pytest.mark.django_db
def test_delete_weight_authenticated(api_client, create_user, create_weight):
    """Test deleting a weight record with an authenticated user"""
    api_client.force_authenticate(user=create_user)
    
    response = api_client.delete(reverse("weight-detail", args=[create_weight.id]))
    
    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.data
    assert f"Weight record with ID {create_weight.id} has been deleted" in response.data["message"]


@pytest.mark.django_db
def test_delete_weight_unauthenticated(api_client, create_weight):
    """Test deleting a weight record without authentication"""
    response = api_client.delete(reverse("weight-detail", args=[create_weight.id]))
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_delete_weight_other_user(api_client, create_user, create_weight):
    """Test that a user cannot delete another user's weight record"""
    api_client.force_authenticate(user=create_user)
    other_user = get_user_model().objects.create_user(username="otheruser", password="password123")
    weight = Weight.objects.create(user=other_user, weight=80.5)
    
    response = api_client.delete(reverse("weight-detail", args=[weight.id]))  
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_delete_weight_invalid_id(api_client, create_user):
    """Test deleting a weight with an invalid ID returns 404"""
    api_client.force_authenticate(user=create_user)
    invalid_weight_id = 9999
    
    response = api_client.delete(reverse("weight-detail", args=[invalid_weight_id]))
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
