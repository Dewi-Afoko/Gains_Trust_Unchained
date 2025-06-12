import pytest
from django.contrib.auth import get_user_model
from users.models import Weight, PasswordResetToken
from tests.conftest import (
    create_user,
    create_user_2,
    user_data,
    test_request,
    api_client,
    factory,
    authenticated_client
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


# Fixture to create user with email for password reset testing
@pytest.fixture
def user_with_email():
    """Fixture to create a user with email address for password reset testing."""
    return User.objects.create_user(
        username="emailuser",
        email="test@example.com",
        password="password123"
    )


# Fixture to create a password reset token
@pytest.fixture
def password_reset_token(user_with_email):
    """Fixture to create a password reset token for testing."""
    return PasswordResetToken.objects.create(user=user_with_email)


# Fixture to create an expired password reset token
@pytest.fixture
def expired_password_reset_token(user_with_email):
    """Fixture to create an expired password reset token for testing."""
    from django.utils import timezone
    from datetime import timedelta
    
    token = PasswordResetToken.objects.create(user=user_with_email)
    # Set created_at to 2 hours ago to make it expired
    token.created_at = timezone.now() - timedelta(hours=2)
    token.save()
    return token


# Fixture to create a used password reset token
@pytest.fixture
def used_password_reset_token(user_with_email):
    """Fixture to create a used password reset token for testing."""
    token = PasswordResetToken.objects.create(user=user_with_email)
    token.is_used = True
    token.save()
    return token
