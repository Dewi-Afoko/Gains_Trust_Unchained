import pytest
from users.serializers import UserSerializer, WeightSerializer
from users.models import User, Weight
from decimal import Decimal

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
    assert user.height is None

@pytest.mark.django_db
def test_user_serializer_password_min_length():
    """Test that the UserSerializer enforces password min_length=6."""
    user_data = {
        "username": "testuser",
        "password": "123",
    }

    serializer = UserSerializer(data=user_data)
    assert not serializer.is_valid()
    assert "password" in serializer.errors

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
def test_weight_serializer_create(create_user, factory):
    """Test that WeightSerializer correctly creates a weight entry with an authenticated user."""
    weight_data = {"weight": Decimal("80.5")}

    # ✅ Use the factory fixture to create a request
    request = factory.post("/api/weights/", weight_data)
    request.user = create_user  # ✅ Assign user manually

    # ✅ Pass request in context to the serializer
    serializer = WeightSerializer(data=weight_data, context={"request": request})
    
    assert serializer.is_valid(), serializer.errors
    weight = serializer.save()

    assert weight.weight == Decimal("80.5")
    assert weight.user == create_user  # ✅ Ensures user is assigned correctly
    assert weight.date_recorded is not None

