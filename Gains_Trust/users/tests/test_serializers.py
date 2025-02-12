import pytest
from rest_framework.exceptions import ValidationError
from users.serializers import UserSerializer, WeightSerializer
from django.contrib.auth import get_user_model
from users.models import Weight
from django.urls import reverse


User = get_user_model()

@pytest.mark.django_db
def test_user_serializer_create_valid_data(user_data):
    """Test creating a user with valid data"""
    data = user_data
    serializer = UserSerializer(data=data)
    assert serializer.is_valid()
    user = serializer.save()
    
    assert user.username == data['username']
    assert user.check_password(data['password'])

@pytest.mark.django_db
def test_user_serializer_create_invalid_data():
    """Test creating a user with invalid data (missing password)"""
    data = {
        'username': 'testuser',
    }
    serializer = UserSerializer(data=data)
    assert not serializer.is_valid()
    assert 'password' in serializer.errors

@pytest.mark.django_db
def test_user_serializer_update_user(create_user):
    """Test updating an existing user's data"""
    user = create_user
    data = {
        'height': 190,
        'dob': '1999-12-31'
    }
    serializer = UserSerializer(instance=user, data=data, partial=True)
    assert serializer.is_valid()
    updated_user = serializer.save()

    assert updated_user.height == data['height']
    assert updated_user.dob.strftime("%Y-%m-%d") == data['dob']

@pytest.mark.django_db
def test_user_serializer_update_invalid_data(create_user):
    """Test updating with invalid data (e.g., non-numeric height)"""
    user = create_user
    data = {
        'height': 'invalid'  # Invalid height
    }
    serializer = UserSerializer(instance=user, data=data, partial=True)
    assert not serializer.is_valid()
    assert 'height' in serializer.errors

@pytest.mark.django_db
def test_user_serializer_update_password(create_user):
    """Test updating password"""
    user = create_user
    new_password = 'newpassword123'
    data = {'password': new_password}
    serializer = UserSerializer(instance=user, data=data, partial=True)
    assert serializer.is_valid()
    updated_user = serializer.save()

    assert updated_user.check_password(new_password)

@pytest.mark.django_db
def test_weight_serializer_create_valid_data(test_request, weight_data):
    """Test creating a weight record with valid data"""
    serializer = WeightSerializer(data=weight_data, context={'request': test_request})
    assert serializer.is_valid()
    weight = serializer.save()

    assert weight.user == test_request.user
    assert weight.weight == weight_data['weight']

@pytest.mark.django_db
def test_weight_serializer_create_invalid_data(test_request):
    """Test creating a weight record with invalid weight"""
    data = {'weight': "eggs"}  
    serializer = WeightSerializer(data=data, context={'request': test_request})
    assert not serializer.is_valid()
    assert 'weight' in serializer.errors

@pytest.mark.django_db
def test_weight_serializer_create_without_user(api_client, weight_data):
    """Test creating a weight record without an authenticated user"""

    response = api_client.post(reverse("weights"), weight_data)

    assert response.status_code == 401
    assert 'detail' in response.data
    assert response.data['detail'] == 'Authentication credentials were not provided.'




@pytest.mark.django_db
def test_weight_serializer_update_weight(create_weight):
    """Test updating a weight record"""
    weight = create_weight
    new_weight = 85.0
    data = {'weight': new_weight}
    serializer = WeightSerializer(instance=weight, data=data, partial=True)
    assert serializer.is_valid()
    updated_weight = serializer.save()

    assert updated_weight.weight == new_weight

@pytest.mark.django_db
def test_weight_serializer_invalid_weight_update(create_weight):
    """Test invalid weight (negative or unreasonable values)"""
    weight = create_weight
    data = {'weight': "eggs"} 
    serializer = WeightSerializer(instance=weight, data=data, partial=True)
    assert not serializer.is_valid()
    assert 'weight' in serializer.errors
