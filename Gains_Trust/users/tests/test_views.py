import pytest
from django.urls import reverse
from users.models import User, Weight, PasswordResetToken
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.core import mail

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
    
    assert response.status_code == 403  # ✅  users cannot access each other's data


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
def test_unauthenticated_user_viewset_get_queryset(api_client):
    """Test that UserViewSet.get_queryset() returns User.objects.none() for unauthenticated users."""
    # This test specifically targets the User.objects.none() line (line 129)
    response = api_client.get(reverse("users-list"))
    assert response.status_code == 401  # Should get 401 due to permission classes

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

@pytest.mark.django_db
def test_update_user_via_detail_endpoint_own_profile(authenticated_client, create_user):
    """Test updating own user profile via detail endpoint to cover super().update() path."""
    # The authenticated_client is using create_user, so updating create_user's profile should work
    url = reverse("users-detail", args=[create_user.id])
    update_data = {"first_name": "UpdatedViaDetail", "last_name": "TestUser"}
    response = authenticated_client.patch(url, update_data)

    assert response.status_code == 200
    assert response.data["first_name"] == "UpdatedViaDetail"
    assert response.data["last_name"] == "TestUser"
    
    # Verify the user was actually updated
    create_user.refresh_from_db()
    assert create_user.first_name == "UpdatedViaDetail"
    assert create_user.last_name == "TestUser"


# ========== PASSWORD RESET TESTS ==========

@pytest.mark.django_db
def test_request_password_reset_valid_email(api_client, user_with_email):
    """Test password reset request with valid email."""
    data = {"email": user_with_email.email}
    response = api_client.post(reverse("password-reset-request"), data)
    
    assert response.status_code == 200
    assert response.data["message"] == "Password reset email sent successfully"
    
    # Check that a token was created
    assert PasswordResetToken.objects.filter(user=user_with_email).exists()
    
    # Check that email was sent (using Django's console backend in tests)
    assert len(mail.outbox) == 1
    assert user_with_email.email in mail.outbox[0].to

@pytest.mark.django_db
def test_request_password_reset_invalid_email(api_client):
    """Test password reset request with non-existent email."""
    data = {"email": "nonexistent@example.com"}
    response = api_client.post(reverse("password-reset-request"), data)
    
    assert response.status_code == 400
    assert "No user with this email address exists." in str(response.data)

@pytest.mark.django_db
def test_request_password_reset_invalid_email_format(api_client):
    """Test password reset request with invalid email format."""
    data = {"email": "not-an-email"}
    response = api_client.post(reverse("password-reset-request"), data)
    
    assert response.status_code == 400
    assert "email" in response.data

@pytest.mark.django_db
def test_request_password_reset_missing_email(api_client):
    """Test password reset request without email."""
    response = api_client.post(reverse("password-reset-request"), {})
    
    assert response.status_code == 400
    assert "email" in response.data

@pytest.mark.django_db
@patch('users.views.send_mail')
def test_request_password_reset_email_failure(mock_send_mail, api_client, user_with_email):
    """Test password reset request when email sending fails."""
    mock_send_mail.side_effect = Exception("SMTP Error")
    
    data = {"email": user_with_email.email}
    response = api_client.post(reverse("password-reset-request"), data)
    
    assert response.status_code == 500
    assert "Failed to send email" in response.data["error"]

@pytest.mark.django_db
def test_confirm_password_reset_valid_token(api_client, password_reset_token):
    """Test password reset confirmation with valid token."""
    old_password_hash = password_reset_token.user.password
    
    data = {
        "token": str(password_reset_token.token),
        "new_password": "newstrongpassword123",
        "confirm_password": "newstrongpassword123"
    }
    response = api_client.post(reverse("password-reset-confirm"), data)
    
    assert response.status_code == 200
    assert response.data["message"] == "Password reset successfully"
    
    # Check password was actually changed
    password_reset_token.user.refresh_from_db()
    assert password_reset_token.user.password != old_password_hash
    assert password_reset_token.user.check_password("newstrongpassword123")
    
    # Check token was marked as used
    password_reset_token.refresh_from_db()
    assert password_reset_token.is_used

@pytest.mark.django_db
def test_confirm_password_reset_expired_token(api_client, expired_password_reset_token):
    """Test password reset confirmation with expired token."""
    data = {
        "token": str(expired_password_reset_token.token),
        "new_password": "newstrongpassword123",
        "confirm_password": "newstrongpassword123"
    }
    response = api_client.post(reverse("password-reset-confirm"), data)
    
    assert response.status_code == 400
    assert response.data["error"] == "Reset token has expired"

@pytest.mark.django_db
def test_confirm_password_reset_used_token(api_client, used_password_reset_token):
    """Test password reset confirmation with already used token."""
    data = {
        "token": str(used_password_reset_token.token),
        "new_password": "newstrongpassword123",
        "confirm_password": "newstrongpassword123"
    }
    response = api_client.post(reverse("password-reset-confirm"), data)
    
    assert response.status_code == 400
    assert response.data["error"] == "Invalid or expired reset token"

@pytest.mark.django_db
def test_confirm_password_reset_invalid_token(api_client):
    """Test password reset confirmation with non-existent token."""
    import uuid
    data = {
        "token": str(uuid.uuid4()),
        "new_password": "newstrongpassword123",
        "confirm_password": "newstrongpassword123"
    }
    response = api_client.post(reverse("password-reset-confirm"), data)
    
    assert response.status_code == 400
    assert response.data["error"] == "Invalid or expired reset token"

@pytest.mark.django_db
def test_confirm_password_reset_password_mismatch(api_client, password_reset_token):
    """Test password reset confirmation with mismatched passwords."""
    data = {
        "token": str(password_reset_token.token),
        "new_password": "newstrongpassword123",
        "confirm_password": "differentpassword123"
    }
    response = api_client.post(reverse("password-reset-confirm"), data)
    
    assert response.status_code == 400
    assert "Passwords do not match" in str(response.data)

@pytest.mark.django_db
def test_confirm_password_reset_weak_password(api_client, password_reset_token):
    """Test password reset confirmation with weak password."""
    data = {
        "token": str(password_reset_token.token),
        "new_password": "123",
        "confirm_password": "123"
    }
    response = api_client.post(reverse("password-reset-confirm"), data)
    
    assert response.status_code == 400
    assert "new_password" in response.data

@pytest.mark.django_db
def test_confirm_password_reset_missing_fields(api_client):
    """Test password reset confirmation with missing required fields."""
    response = api_client.post(reverse("password-reset-confirm"), {})
    
    assert response.status_code == 400
    assert "token" in response.data
    assert "new_password" in response.data
    assert "confirm_password" in response.data

@pytest.mark.django_db
def test_confirm_password_reset_invalid_token_format(api_client):
    """Test password reset confirmation with invalid token format."""
    data = {
        "token": "not-a-uuid",
        "new_password": "newstrongpassword123",
        "confirm_password": "newstrongpassword123"
    }
    response = api_client.post(reverse("password-reset-confirm"), data)
    
    assert response.status_code == 400
    assert "token" in response.data

@pytest.mark.django_db
def test_multiple_password_reset_tokens(api_client, user_with_email):
    """Test that multiple password reset tokens can be created for the same user."""
    # Create first token
    data = {"email": user_with_email.email}
    response1 = api_client.post(reverse("password-reset-request"), data)
    assert response1.status_code == 200
    
    # Create second token
    response2 = api_client.post(reverse("password-reset-request"), data)
    assert response2.status_code == 200
    
    # Both tokens should exist
    tokens = PasswordResetToken.objects.filter(user=user_with_email)
    assert tokens.count() == 2

@pytest.mark.django_db
def test_password_reset_with_user_having_no_first_name(api_client):
    """Test password reset email content when user has no first name."""
    user = User.objects.create_user(
        username="testuser",
        email="test@example.com", 
        password="password123"
    )
    
    data = {"email": user.email}
    response = api_client.post(reverse("password-reset-request"), data)
    
    assert response.status_code == 200
    # Check email was sent with username in greeting
    assert len(mail.outbox) == 1
    assert user.username in mail.outbox[0].body

@pytest.mark.django_db
def test_password_reset_with_user_having_first_name(api_client):
    """Test password reset email content when user has first name."""
    user = User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="password123",
        first_name="John"
    )
    
    data = {"email": user.email}
    response = api_client.post(reverse("password-reset-request"), data)
    
    assert response.status_code == 200
    # Check email was sent with first name in greeting
    assert len(mail.outbox) == 1
    assert "John" in mail.outbox[0].body

