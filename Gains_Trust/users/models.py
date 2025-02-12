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


class Weight(models.Model):
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="weights"
    )
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    date_recorded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.weight}kg on {self.date_recorded.strftime('%Y-%m-%d')}"


class UserRecord(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_records"
    )
    exercise = models.ForeignKey(
        "core.Exercise", on_delete=models.CASCADE, related_name="user_records"
    )
    set_dict = models.ForeignKey(
        "workouts.SetDict",
        on_delete=models.CASCADE,
        related_name="user_records",
        null=True,
        blank=True,
    )
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    reps = models.IntegerField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.exercise.name} - {self.weight}kg x {self.reps} reps"
