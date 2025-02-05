from django.db import models
from django.utils.timezone import now
from .user import User
from .set_dict import SetDict

class Workout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    workout_name = models.CharField(max_length=255)
    date = models.DateField(default=now)
    complete = models.BooleanField(default=False)
    user_weight = models.FloatField(null=True, blank=True)
    sleep_score = models.IntegerField(null=True, blank=True)
    sleep_quality = models.TextField(blank=True)
    notes = models.TextField(blank=True)