import pytest
from users.models import User, Weight, PasswordResetToken
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock
from django.utils import timezone


@pytest.mark.django_db
def test_create_user():
    """Test that a user can be created successfully."""
    user = User.objects.create_user(username="testuser", password="password123", height=180)
    assert user.username == "testuser"
    assert user.check_password("password123")
    assert user.height == 180
    assert user.login_history == []  # Default value
    assert user.__str__() == "testuser"

@pytest.mark.django_db
def test_user_login_tracking(create_user):
    """Test the track_login method updates login history correctly."""
    user = create_user
    now = timezone.now()  # ✅ Use timezone-aware datetime
    earlier = now - timedelta(days=1)
    
    user.last_login = earlier
    user.track_login()
    
    assert len(user.login_history) == 1
    assert user.login_history[0] == earlier

    # Add another login
    user.last_login = now
    user.track_login()
    
    assert len(user.login_history) == 2
    assert user.login_history[1] == now

    # Add a third login, should remove the first one
    even_later = now + timedelta(days=1)
    user.last_login = even_later
    user.track_login()
    
    assert len(user.login_history) == 2
    assert user.login_history == [now, even_later]  # Oldest login is removed

@pytest.mark.django_db
def test_create_weight(create_user):
    """Test that a weight entry can be created successfully."""
    user = create_user
    weight_entry = Weight.objects.create(user=user, weight=Decimal("80.5"))
    
    assert weight_entry.user == user
    assert weight_entry.weight == Decimal("80.5")
    assert isinstance(weight_entry.date_recorded, datetime)
    assert str(weight_entry) == f"80.5kg on {weight_entry.date_recorded.strftime('%Y-%m-%d')}"

@pytest.mark.django_db
def test_password_reset_token_creation(create_user):
    """Test that a PasswordResetToken can be created successfully."""
    user = create_user
    token = PasswordResetToken.objects.create(user=user)
    
    assert token.user == user
    assert token.token is not None
    assert not token.is_used
    assert token.created_at is not None
    assert str(token) == f"Password reset token for {user.username}"

@pytest.mark.django_db
def test_password_reset_token_is_expired():
    """Test the is_expired method of PasswordResetToken."""
    user = User.objects.create_user(username="testuser", password="password123")
    
    # Create a token and manually set creation time to past
    token = PasswordResetToken.objects.create(user=user)
    
    # Test that new token is not expired
    assert not token.is_expired()
    
    # Manually set created_at to 2 hours ago (should be expired if timeout is 1 hour)
    token.created_at = timezone.now() - timedelta(hours=2)
    token.save()
    
    assert token.is_expired()

@pytest.mark.django_db
def test_password_reset_token_not_expired():
    """Test that a recent token is not expired."""
    user = User.objects.create_user(username="testuser", password="password123")
    token = PasswordResetToken.objects.create(user=user)
    
    # Token created just now should not be expired
    assert not token.is_expired()

@pytest.mark.django_db
def test_password_reset_token_uuid_uniqueness():
    """Test that PasswordResetToken generates unique UUIDs."""
    user1 = User.objects.create_user(username="user1", password="password123")
    user2 = User.objects.create_user(username="user2", password="password123")
    
    token1 = PasswordResetToken.objects.create(user=user1)
    token2 = PasswordResetToken.objects.create(user=user2)
    
    assert token1.token != token2.token
    assert len(str(token1.token)) == 36  # UUID4 string length

@pytest.mark.django_db
def test_password_reset_token_ordering():
    """Test that PasswordResetTokens are ordered by created_at descending."""
    user = User.objects.create_user(username="testuser", password="password123")
    
    # Create first token
    token1 = PasswordResetToken.objects.create(user=user)
    
    # Create second token slightly later
    token2 = PasswordResetToken.objects.create(user=user)
    
    # Get all tokens - should be ordered by most recent first
    tokens = list(PasswordResetToken.objects.all())
    assert tokens[0] == token2  # Most recent first
    assert tokens[1] == token1

@pytest.mark.django_db
def test_password_reset_token_user_relationship():
    """Test the foreign key relationship between PasswordResetToken and User."""
    user = User.objects.create_user(username="testuser", password="password123")
    
    # Create multiple tokens for the same user
    token1 = PasswordResetToken.objects.create(user=user)
    token2 = PasswordResetToken.objects.create(user=user)
    
    # Test reverse relationship
    user_tokens = user.password_reset_tokens.all()
    assert token1 in user_tokens
    assert token2 in user_tokens
    assert len(user_tokens) == 2
