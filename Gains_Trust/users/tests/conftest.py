import pytest
from django.contrib.auth import get_user_model
from users.models import Weight
from tests.conftest import (
    create_user,
    user_data,
    test_request,
    api_client,
    factory,
)

User = get_user_model()


# Fixture to create weight data for testing
@pytest.fixture
def weight_data():
    """Fixture for weight data"""
    return {"weight": 80.5}


# Fixture to create a Weight object
@pytest.fixture
def create_weight(create_user, weight_data):
    """Fixture to create a weight record for a user"""
    weight = Weight.objects.create(user=create_user, **weight_data)
    return weight
