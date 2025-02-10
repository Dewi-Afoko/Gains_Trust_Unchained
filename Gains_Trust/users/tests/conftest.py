import pytest
from rest_framework.test import APIClient, APIRequestFactory
from django.contrib.auth import get_user_model
from users.models import Weight

User = get_user_model()

# Fixture to return APIClient instance
@pytest.fixture
def api_client():
    """Fixture to return an instance of APIClient"""
    return APIClient()

# Fixture for user data to create a new user
@pytest.fixture
def user_data():
    """Fixture to return sample user data"""
    return {
        'username': 'testuser',
        'password': 'password123',
    }

# Fixture to create a user
@pytest.fixture
def create_user(user_data):
    """Fixture to create a user in the database"""
    user = User.objects.create_user(**user_data)
    return user

# Fixture to create an API request factory instance
@pytest.fixture
def factory():
    """Fixture for APIRequestFactory"""
    return APIRequestFactory()

# Fixture to create a request with user attached
@pytest.fixture
def test_request(factory, create_user):
    """Fixture to create a request with user attached"""
    request = factory.post('/some-url/', {'weight': 80.5})
    request.user = create_user  # Attach the created user
    return request

# Fixture to create weight data for testing
@pytest.fixture
def weight_data():
    """Fixture for weight data"""
    return {
        'weight': 80.5
    }

# Fixture to create a Weight object
@pytest.fixture
def create_weight(create_user, weight_data):
    """Fixture to create a weight record for a user"""
    weight = Weight.objects.create(user=create_user, **weight_data)
    return weight
