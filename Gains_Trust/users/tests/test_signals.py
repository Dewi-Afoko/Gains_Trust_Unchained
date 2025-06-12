import pytest
from django.contrib.auth.signals import user_logged_in
from users.models import User

@pytest.mark.django_db
def test_update_login_history(create_user):
    """Test that user_logged_in signal updates the user's login history."""
    user = create_user

    # ✅ Ensure login history is empty before login
    assert user.login_history == []

    # ✅ Manually trigger the user_logged_in signal
    user_logged_in.send(sender=User, request=None, user=user)

    # ✅ Reload user from the database
    user.refresh_from_db()

    # ✅ Ensure login history is now populated with one entry
    assert len(user.login_history) == 1
    assert user.login_history[0] is not None
