from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    height = models.IntegerField(blank=True, null=True)
    dob = models.DateField(blank=True, null=True)

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="core_users",
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="core_users_permissions",
        blank=True,
    )

    def __str__(self):
        return self.username