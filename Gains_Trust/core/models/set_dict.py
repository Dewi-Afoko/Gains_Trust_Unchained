from django.db import models

class SetDict(models.Model):
    workout = models.ForeignKey('core.Workout', on_delete=models.CASCADE, related_name="set_dicts")
    exercise_name = models.CharField(max_length=255)
    set_order = models.IntegerField(null=True, blank=True)
    set_number = models.IntegerField(null=True, blank=True)
    set_type = models.CharField(max_length=100, blank=True)
    reps = models.IntegerField(null=True, blank=True)
    focus = models.CharField(max_length=150, blank=True)
    rest = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    complete = models.BooleanField(default=False)