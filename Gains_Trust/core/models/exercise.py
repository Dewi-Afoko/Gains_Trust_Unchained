from django.db import models
from django.contrib.postgres.fields import ArrayField


class Exercise(models.Model):
    name = models.CharField(max_length=85, unique=True)
    description = models.TextField(blank=True)
    muscle_group = models.CharField(max_length=50, blank=True)
    instructions = ArrayField(models.TextField(blank=True), default=list, blank=True, null=True)
    target_muscles = ArrayField(
        models.CharField(max_length=50, blank=True), default=list, blank=True, null=True
    )
    synergist_muscles = ArrayField(
        models.CharField(max_length=50, blank=True), default=list, blank=True, null=True
    )
    equipment = ArrayField(models.CharField(max_length=50, blank=True), default=list, blank=True, null=True)
    compound_movement = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return f"{self.name}\nDescription: {self.description}"
