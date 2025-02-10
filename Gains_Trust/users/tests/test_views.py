import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from users.models import Weight
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
def test_register_valid_data(api_client, user_data):
    """Test registering a user with valid data"""
    response = api_client.post('/users/register/', user_data, format='json')
    
    assert response.status_code == status.HTTP_201_CREATED
    assert 'message' in response.data
    assert f"{user_data['username']} successfully registered!" in response.data['message']


@pytest.mark.django_db
def test_register_missing_password(api_client, user_data):
    """Test registering a user with missing password"""
    del user_data['password']
    response = api_client.post('/users/register/', user_data, format='json')
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'password' in response.data


@pytest.mark.django_db
def test_register_existing_username(api_client, user_data, create_user):
    """Test registering a user with an existing username"""
    response = api_client.post('/users/register/', user_data, format='json')
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'username' in response.data



@pytest.mark.django_db
def test_logout_missing_token(api_client, create_user):
    """Test logout with a missing refresh token"""
    
    # Authenticate the API client
    api_client.force_authenticate(user=create_user)
    
    # Send a POST request without the refresh token
    response = api_client.post('/users/logout/', {}, format='json')  # Missing token
    
    # Expecting 400 Bad Request because the refresh token is missing
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in response.data
    assert response.data['error'] == "Refresh token missing."

@pytest.mark.django_db
def test_logout_invalid_token(api_client, create_user):
    """Test logout with an invalid refresh token"""
    
    # Authenticate the API client
    api_client.force_authenticate(user=create_user)
    
    # Send a POST request with an invalid refresh token
    response = api_client.post('/users/logout/', {'refresh': 'invalid_token'}, format='json')
    
    # Expecting 400 Bad Request because the token is invalid
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in response.data
    assert response.data['error'] == "Invalid token."

@pytest.mark.django_db
def test_logout_valid_token(api_client, create_user):
    """Test logout with a valid refresh token"""
    
    # Authenticate the API client
    api_client.force_authenticate(user=create_user)
    
    # Obtain a refresh token for the user
    refresh_token = str(RefreshToken.for_user(create_user))  # Generate a valid refresh token
    
    # Send a POST request with the valid refresh token
    response = api_client.post('/users/logout/', {'refresh': refresh_token}, format='json')
    
    # Expecting 205 Reset Content because the token is valid
    assert response.status_code == status.HTTP_205_RESET_CONTENT
    assert 'message' in response.data
    assert response.data['message'] == "Successfully logged out."


################################
@pytest.mark.django_db
def test_update_user_valid_data(api_client, create_user):
    """Test updating a user with valid data"""
    
    # Authenticate the API client
    api_client.force_authenticate(user=create_user)
    
    # Prepare valid data for updating the user
    data = {
        'height': 180,
        'dob': '1990-01-01'
    }
    
    # Send a PATCH request with valid data
    response = api_client.patch('/users/update_user/', data, format='json')
    
    # Expecting 200 OK because the update is valid
    assert response.status_code == status.HTTP_200_OK
    assert 'message' in response.data
    assert response.data['message'] == f"User details updated successfully for {create_user.username}."
    assert 'data' in response.data
    assert response.data['data']['height'] == data['height']
    assert response.data['data']['dob'] == data['dob']


@pytest.mark.django_db
def test_update_user_invalid_data(api_client, create_user):
    """Test updating the user with invalid data (e.g., incorrect height or dob format)"""
    
    # Authenticate the API client
    api_client.force_authenticate(user=create_user)
    
    # Prepare invalid data for updating the user
    data = {
        'height': 'invalid_value',  # Invalid height (should be an integer)
        'dob': 'invalid_date'  # Invalid dob format
    }
    
    # Send a PATCH request with invalid data
    response = api_client.patch('/users/update_user/', data, format='json')
    
    # Expecting 400 Bad Request due to invalid data
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'height' in response.data
    assert 'dob' in response.data


@pytest.mark.django_db
def test_update_user_without_authentication(api_client, create_user):
    """Test that a user cannot update their details without authentication"""
    
    # No authentication is done here
    data = {
        'height': 180,
        'dob': '1990-01-01'
    }
    
    # Send a PATCH request without authentication
    response = api_client.patch('/users/update_user/', data, format='json')
    
    # Expecting 401 Unauthorized since the user is not authenticated
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert 'detail' in response.data
    assert response.data['detail'] == "Authentication credentials were not provided."






################################



@pytest.mark.django_db
def test_create_weight_authenticated(api_client, create_user, weight_data):
    """Test creating a weight record with an authenticated user"""
    api_client.force_authenticate(user=create_user)  # Authenticate the client
    response = api_client.post('/users/weights/', weight_data, format='json')  # Using the correct endpoint
    assert response.status_code == status.HTTP_201_CREATED
    assert 'message' in response.data
    assert f"{weight_data['weight']:.2f} logged" in response.data['message']  # Check for weight logged
    assert 'by testuser' in response.data['message']  # Ensure the username is part of the message



@pytest.mark.django_db
def test_create_weight_unauthenticated(api_client, weight_data):
    """Test creating a weight record without authentication"""
    response = api_client.post('/users/weights/', weight_data, format='json')  # Using the correct endpoint
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_get_weights_authenticated(api_client, create_user, create_weight):
    """Test retrieving weight records with an authenticated user"""
    api_client.force_authenticate(user=create_user)
    response = api_client.get('/users/weights/')
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1  # Assuming only one weight record


@pytest.mark.django_db
def test_get_weights_unauthenticated(api_client):
    """Test retrieving weight records without authentication"""
    response = api_client.get('/users/weights/')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_delete_weight_authenticated(api_client, create_user, create_weight):
    """Test deleting a weight record with an authenticated user"""
    api_client.force_authenticate(user=create_user)
    weight = create_weight  # Assume weight is created by the fixture
    response = api_client.delete('/users/weights/delete/', data={'id': weight.id}, format='json')  # Correct the URL
    assert response.status_code == status.HTTP_200_OK
    assert 'message' in response.data
    assert f'Weight record with ID {weight.id} has been deleted' in response.data['message']


@pytest.mark.django_db
def test_delete_weight_unauthenticated(api_client, create_weight):
    """Test deleting a weight record without authentication"""
    weight = create_weight  # Assume weight is created by the fixture
    response = api_client.delete('/users/weights/delete/', data={'id': weight.id}, format='json')  # Correct the URL
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_delete_weight_other_user(api_client, create_user, create_weight):
    """Test that a user cannot delete another user's weight record"""
    api_client.force_authenticate(user=create_user)
    other_user = get_user_model().objects.create_user(username='otheruser', password='password123')
    weight = Weight.objects.create(user=other_user, weight=80.5)  # Create a weight for another user
    
    # Ensure that the correct URL is used
    response = api_client.delete('/users/weights/delete/', data={'id': weight.id}, format='json')  
    
    # Since the weight belongs to another user, we expect a 404 Not Found
    assert response.status_code == status.HTTP_404_NOT_FOUND

