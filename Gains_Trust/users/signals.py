from django.contrib.auth.signals import user_logged_in
from django.utils.timezone import now
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(user_logged_in)
def store_previous_last_login(sender, request, user, **kwargs):
    """Store the previous last_login before it gets updated"""
    if user.last_login:
        user.previous_last_login = user.last_login  # Store the previous login
    user.last_login = now()  # Update last_login as usual
    user.save(update_fields=["previous_last_login", "last_login"])
