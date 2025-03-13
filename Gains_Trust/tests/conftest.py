import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APIRequestFactory

User = get_user_model()


# Fixture to return APIClient instance
@pytest.fixture
def api_client():
    """Fixture to return an instance of APIClient"""
    return APIClient()


# Fixture to create an API request factory instance
@pytest.fixture
def factory():
    """Fixture for APIRequestFactory"""
    return APIRequestFactory()


# Fixture to create a request with user attached
@pytest.fixture
def test_request(factory, create_user):
    """Fixture to create a request with user attached"""
    request = factory.post("/some-url/", {"weight": 80.5})
    request.user = create_user  # Attach the created user
    return request


@pytest.fixture
def user_data():
    """Fixture to return sample user data"""
    return {
        "username": "testuser",
        "password": "password123",
    }


@pytest.fixture
def create_user(user_data):
    """Fixture to create a user in the database"""
    return User.objects.create_user(**user_data)

@pytest.fixture
def create_user_2():
    """Fixture to create a second user."""
    return User.objects.create_user(username="testuser2", password="password123")

@pytest.fixture
def create_superuser():
    """Fixture to create a superuser."""
    return User.objects.create_superuser(username="admin", password="adminpass")



@pytest.fixture
def authenticated_client(api_client, create_user):
    """Fixture for an authenticated API client."""
    api_client.force_authenticate(user=create_user)
    return api_client

