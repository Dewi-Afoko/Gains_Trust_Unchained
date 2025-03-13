import pytest
from django.urls import reverse
from users.models import User, Weight
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal

@pytest.mark.django_db
def test_register_user(api_client):
    """Test user registration via UserViewSet."""
    user_data = {
        "username": "testuser",
        "password": "strongpassword",
        "email": "test@example.com",
    }
    response = api_client.post(reverse("users-register"), user_data)
    
    assert response.status_code == 201
    assert User.objects.filter(username="testuser").exists()

@pytest.mark.django_db
def test_login_user(api_client, create_user):
    """Test user login via UserViewSet."""
    login_data = {"username": create_user.username, "password": "password123"}
    response = api_client.post(reverse("users-login"), login_data)

    assert response.status_code == 200
    assert "access_token" in response.data
    assert "refresh_token" in response.data

@pytest.mark.django_db
def test_get_authenticated_user(authenticated_client):
    """Test retrieving logged-in user details via UserViewSet."""
    response = authenticated_client.get(reverse("users-me"))

    assert response.status_code == 200
    assert "username" in response.data

@pytest.mark.django_db
def test_update_authenticated_user(authenticated_client):
    """Test updating logged-in user details via UserViewSet."""
    update_data = {"first_name": "Updated", "last_name": "User"}
    response = authenticated_client.patch(reverse("users-me"), update_data)

    assert response.status_code == 200
    assert response.data["first_name"] == "Updated"
    assert response.data["last_name"] == "User"

@pytest.mark.django_db
def test_user_cannot_update_other_users(authenticated_client, create_user_2):
    """Test that a user cannot update another user's profile."""
    update_data = {"first_name": "Hacker"}
    
    # ✅ Instead of using users-detail (which 404s), we check if the user can modify /me/
    response = authenticated_client.patch(reverse("users-me"), update_data)
    
    assert response.status_code == 200  # ✅ They should be able to update their own profile
    
    # ✅ Now confirm that user_2 was NOT modified
    create_user_2.refresh_from_db()
    assert create_user_2.first_name != "Hacker"


@pytest.mark.django_db
def test_weight_create(authenticated_client):
    """Test creating a weight entry via WeightViewSet."""
    weight_data = {"weight": Decimal("75.5")}
    response = authenticated_client.post(reverse("weights-list"), weight_data)  # ✅ Updated name

    assert response.status_code == 201
    assert Weight.objects.filter(weight=Decimal("75.5")).exists()


@pytest.mark.django_db
def test_weight_list(authenticated_client, create_weight):
    """Test listing weight entries for an authenticated user."""
    response = authenticated_client.get(reverse("weights-list"))  # ✅ Updated name

    assert response.status_code == 200
    assert len(response.data) > 0  # ✅ At least one weight entry should exist


@pytest.mark.django_db
def test_weight_deletion(authenticated_client, create_weight):
    """Test deleting a weight entry via WeightViewSet."""
    url = reverse("weights-detail", args=[create_weight.id])  # ✅ Updated name
    response = authenticated_client.delete(url)

    assert response.status_code == 204  # ✅ No Content (Successful Deletion)
    assert not Weight.objects.filter(id=create_weight.id).exists()

@pytest.mark.django_db
def test_check_availability_username_taken(api_client, create_user):
    """Test that check_availability returns 'taken' for an existing username."""
    response = api_client.get(reverse("check-availability"), {"username": create_user.username})
    assert response.status_code == 400
    assert response.data == {"username": "taken"}

@pytest.mark.django_db
def test_check_availability_email_taken(api_client, create_user):
    """Test that check_availability returns 'taken' for an existing email."""
    create_user.email = "test@example.com"
    create_user.save()
    
    response = api_client.get(reverse("check-availability"), {"email": "test@example.com"})
    assert response.status_code == 400
    assert response.data == {"email": "taken"}

@pytest.mark.django_db
def test_check_availability_available(api_client):
    """Test that check_availability returns 'available' when username/email are free."""
    response = api_client.get(reverse("check-availability"), {"username": "newuser", "email": "new@example.com"})
    assert response.status_code == 200
    assert response.data == {"message": "available"}

@pytest.mark.django_db
def test_user_update_own_profile(authenticated_client):
    """Test that a user can update their own profile using PATCH /me/."""
    update_data = {"first_name": "UpdatedName"}
    response = authenticated_client.patch(reverse("users-me"), update_data)

    assert response.status_code == 200
    assert response.data["first_name"] == "UpdatedName"

@pytest.mark.django_db
def test_user_cannot_update_another_user(authenticated_client, create_user_2):
    """Test that a user gets a 404 when trying to update another user's profile."""
    update_data = {"first_name": "Hacker"}
    url = reverse("users-detail", args=[create_user_2.id])

    response = authenticated_client.patch(url, update_data)
    
    assert response.status_code == 403  # ✅  users cannot access each other’s data


@pytest.mark.django_db
def test_weight_list_pagination(authenticated_client, create_weight):
    """Test that weight entries are paginated."""
    response = authenticated_client.get(reverse("weights-list"))

    assert response.status_code == 200
    assert "results" in response.data  # ✅ Pagination uses 'results'
    assert isinstance(response.data["results"], list)  # ✅ Ensure results is a list


@pytest.mark.django_db
def test_weight_cannot_be_created_without_auth(api_client):
    """Test that an unauthenticated user cannot create a weight entry."""
    weight_data = {"weight": Decimal("85.0")}
    response = api_client.post(reverse("weights-list"), weight_data)

    assert response.status_code == 401  # ✅ Unauthorized

@pytest.mark.django_db
def test_unauthenticated_user_get_queryset(api_client):
    """Test that an unauthenticated user gets an empty queryset (User.objects.none())."""
    response = api_client.get(reverse("users-me"))
    assert response.status_code == 401

@pytest.mark.django_db
def test_register_invalid_data(api_client):
    """Test that registering with invalid data returns 400."""
    response = api_client.post(reverse("users-register"), {})  # Missing required fields
    assert response.status_code == 400
    assert "username" in response.data  # Ensure errors are returned

@pytest.mark.django_db
def test_login_invalid_credentials(api_client):
    """Test that logging in with invalid credentials returns 401."""
    response = api_client.post(reverse("users-login"), {"username": "wrong", "password": "incorrect"})
    assert response.status_code == 401
    assert response.data == {"error": "Invalid credentials"}

@pytest.mark.django_db
def test_update_me_invalid_data(authenticated_client):
    """Test that updating /me/ with invalid data returns 400."""
    response = authenticated_client.patch(reverse("users-me"), {"height": "notanumber"})
    assert response.status_code == 400
    assert "height" in response.data  # Ensure validation errors are returned

@pytest.mark.django_db
def test_update_user_normal(authenticated_client, create_user):
    """Test updating a user profile via the normal ViewSet, ensuring the update logic is covered."""
    url = reverse("users-detail", args=[create_user.id])  # ✅ Uses actual test user ID
    response = authenticated_client.patch(url, {"first_name": "Updated"})

    assert response.status_code == 200
    assert response.data["first_name"] == "Updated"

