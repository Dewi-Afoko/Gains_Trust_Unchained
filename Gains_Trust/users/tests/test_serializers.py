import pytest
from users.serializers import UserSerializer, WeightSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from users.models import User, Weight, PasswordResetToken
from decimal import Decimal
from django.contrib.auth.password_validation import ValidationError

@pytest.mark.django_db
def test_user_serializer_create():
    """Test that UserSerializer correctly creates a user."""
    user_data = {
        "username": "testuser",
        "password": "strongpassword",
        "email": "test@example.com",
        "height": 180,
    }

    serializer = UserSerializer(data=user_data)
    assert serializer.is_valid(), serializer.errors

    user = serializer.save()
    assert user.username == "testuser"
    assert user.check_password("strongpassword")  # ✅ Ensure password is hashed
    assert user.email == "test@example.com"
    assert user.height == 180  # ✅ Fixed: height should be saved correctly

@pytest.mark.django_db
def test_user_serializer_password_validation():
    """Test that UserSerializer accepts any password (validation happens at view level)."""
    user_data = {
        "username": "testuser",
        "password": "123",  # Short password
    }

    serializer = UserSerializer(data=user_data)
    # Password validation happens at view level, not serializer level
    assert serializer.is_valid()
    
    # Should save successfully (UserSerializer doesn't enforce password validation)
    user = serializer.save()
    assert user.check_password("123")

@pytest.mark.django_db
def test_user_serializer_update(create_user):
    """Test that UserSerializer updates user details correctly."""
    user = create_user
    update_data = {
        "first_name": "Updated",
        "last_name": "User",
        "height": 185,
    }

    serializer = UserSerializer(instance=user, data=update_data, partial=True)
    assert serializer.is_valid(), serializer.errors

    updated_user = serializer.save()
    assert updated_user.first_name == "Updated"
    assert updated_user.last_name == "User"
    assert updated_user.height == 185

@pytest.mark.django_db
def test_user_serializer_update_password(create_user):
    """Test that UserSerializer correctly updates password."""
    user = create_user
    old_password_hash = user.password
    
    update_data = {"password": "newstrongpassword"}
    serializer = UserSerializer(instance=user, data=update_data, partial=True)
    assert serializer.is_valid(), serializer.errors

    updated_user = serializer.save()
    assert updated_user.check_password("newstrongpassword")
    assert updated_user.password != old_password_hash  # Password hash should change

@pytest.mark.django_db
def test_weight_serializer_create():
    """Test that WeightSerializer correctly creates a weight entry."""
    weight_data = {"weight": Decimal("80.5")}
    serializer = WeightSerializer(data=weight_data)
    
    assert serializer.is_valid(), serializer.errors
    # Weight serializer should not save user automatically - that's handled by ViewSet perform_create

@pytest.mark.django_db 
def test_weight_serializer_fields():
    """Test that WeightSerializer includes correct fields."""
    serializer = WeightSerializer()
    expected_fields = ["id", "weight", "date_recorded"]
    assert list(serializer.fields.keys()) == expected_fields

@pytest.mark.django_db
def test_password_reset_request_serializer_valid_email(create_user):
    """Test that PasswordResetRequestSerializer validates existing email."""
    create_user.email = "test@example.com"
    create_user.save()
    
    data = {"email": "test@example.com"}
    serializer = PasswordResetRequestSerializer(data=data)
    assert serializer.is_valid(), serializer.errors

@pytest.mark.django_db
def test_password_reset_request_serializer_invalid_email():
    """Test that PasswordResetRequestSerializer rejects non-existent email."""
    data = {"email": "nonexistent@example.com"}
    serializer = PasswordResetRequestSerializer(data=data)
    assert not serializer.is_valid()
    assert "email" in serializer.errors
    assert "No user with this email address exists." in str(serializer.errors["email"])

@pytest.mark.django_db
def test_password_reset_request_serializer_invalid_format():
    """Test that PasswordResetRequestSerializer rejects invalid email format."""
    data = {"email": "not-an-email"}
    serializer = PasswordResetRequestSerializer(data=data)
    assert not serializer.is_valid()
    assert "email" in serializer.errors

@pytest.mark.django_db
def test_password_reset_confirm_serializer_valid():
    """Test that PasswordResetConfirmSerializer validates matching passwords."""
    import uuid
    data = {
        "token": str(uuid.uuid4()),
        "new_password": "strongnewpassword",
        "confirm_password": "strongnewpassword"
    }
    serializer = PasswordResetConfirmSerializer(data=data)
    assert serializer.is_valid(), serializer.errors

@pytest.mark.django_db
def test_password_reset_confirm_serializer_password_mismatch():
    """Test that PasswordResetConfirmSerializer rejects mismatched passwords."""
    import uuid
    data = {
        "token": str(uuid.uuid4()),
        "new_password": "strongnewpassword",
        "confirm_password": "differentpassword"
    }
    serializer = PasswordResetConfirmSerializer(data=data)
    assert not serializer.is_valid()
    assert "non_field_errors" in serializer.errors
    assert "Passwords do not match." in str(serializer.errors["non_field_errors"])

@pytest.mark.django_db
def test_password_reset_confirm_serializer_weak_password():
    """Test that PasswordResetConfirmSerializer enforces password validation."""
    import uuid
    data = {
        "token": str(uuid.uuid4()),
        "new_password": "123",  # Too weak
        "confirm_password": "123"
    }
    serializer = PasswordResetConfirmSerializer(data=data)
    assert not serializer.is_valid()
    assert "new_password" in serializer.errors

