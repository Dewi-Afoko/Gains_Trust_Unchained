from django.contrib.auth.signals import user_logged_in
from django.utils.timezone import now
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(user_logged_in)
def update_last_login(sender, request, user, **kwargs):
    """Automatically update last_login when a user logs in."""
    print(f"🔄 Updating last_login for {user.username}")  # ✅ Debugging
    user.last_login = now()
    user.save(update_fields=['last_login'])
