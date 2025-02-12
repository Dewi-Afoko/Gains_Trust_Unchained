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
