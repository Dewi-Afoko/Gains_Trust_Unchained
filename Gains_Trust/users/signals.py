from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(user_logged_in)
def update_login_history(sender, request, user, **kwargs):
    """Runs every time a user logs in and updates login history."""
    user.track_login()  # Custom method
