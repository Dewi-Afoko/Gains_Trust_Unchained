import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from users.admin import PasswordResetTokenAdmin
from users.models import PasswordResetToken

User = get_user_model()


@pytest.mark.django_db
def test_password_reset_token_admin_list_display():
    """Test that PasswordResetTokenAdmin shows correct list display fields."""
    admin = PasswordResetTokenAdmin(PasswordResetToken, AdminSite())
    expected_fields = ['user', 'token', 'created_at', 'is_used', 'is_expired']
    assert admin.list_display == expected_fields

@pytest.mark.django_db
def test_password_reset_token_admin_list_filter():
    """Test that PasswordResetTokenAdmin has correct list filters."""
    admin = PasswordResetTokenAdmin(PasswordResetToken, AdminSite())
    expected_filters = ['is_used', 'created_at']
    assert admin.list_filter == expected_filters

@pytest.mark.django_db
def test_password_reset_token_admin_search_fields():
    """Test that PasswordResetTokenAdmin has correct search fields."""
    admin = PasswordResetTokenAdmin(PasswordResetToken, AdminSite())
    expected_fields = ['user__username', 'user__email']
    assert admin.search_fields == expected_fields

@pytest.mark.django_db
def test_password_reset_token_admin_readonly_fields():
    """Test that PasswordResetTokenAdmin has correct readonly fields."""
    admin = PasswordResetTokenAdmin(PasswordResetToken, AdminSite())
    expected_fields = ['token', 'created_at']
    assert admin.readonly_fields == expected_fields

@pytest.mark.django_db
def test_password_reset_token_admin_is_expired_display(user_with_email, password_reset_token):
    """Test that the is_expired method displays correctly in admin."""
    admin = PasswordResetTokenAdmin(PasswordResetToken, AdminSite())
    
    # Test with non-expired token
    assert not password_reset_token.is_expired()
    
    # Test with expired token (we already have the expired_password_reset_token fixture)
    from django.utils import timezone
    from datetime import timedelta
    
    expired_token = PasswordResetToken.objects.create(user=user_with_email)
    expired_token.created_at = timezone.now() - timedelta(hours=2)
    expired_token.save()
    
    assert expired_token.is_expired() 