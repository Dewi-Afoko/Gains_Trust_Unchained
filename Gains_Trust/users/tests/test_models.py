import pytest
from users.models import User, Weight, UserRecord
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
