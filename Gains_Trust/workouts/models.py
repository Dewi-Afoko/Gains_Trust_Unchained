from django.db import models
from django.utils.timezone import now
from users.models import User

# Create your models here.
class Workout(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name="workoutss")
    workout_name = models.CharField(max_length=255)
    date = models.DateField(default=now)
    complete = models.BooleanField(default=False)
    user_weight = models.FloatField(null=True, blank=True)
    sleep_score = models.IntegerField(null=True, blank=True)
    sleep_quality = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.workout_name} ({self.date})"
    

class SetDict(models.Model):
    workout = models.ForeignKey('workouts.Workout', on_delete=models.CASCADE, related_name="set_dicts")
    exercise_name = models.CharField(max_length=255)
    set_order = models.IntegerField(null=True, blank=True)
    set_number = models.IntegerField(null=True, blank=True)
    set_type = models.CharField(max_length=100, blank=True)
    reps = models.IntegerField(null=True, blank=True)
    focus = models.CharField(max_length=150, blank=True)
    rest = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    complete = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.workout.workout_name} - {self.exercise_name} (Set {self.set_order})"