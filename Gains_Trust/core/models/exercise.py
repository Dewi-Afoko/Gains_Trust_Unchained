from django.db import models
from django.contrib.postgres.fields import ArrayField

class Exercise(models.Model):
    name = models.CharField(max_length=85, unique=True)
    description = models.TextField(blank=True)
    muscle_group = models.CharField(max_length=50, blank=True)
    instructions = ArrayField(models.TextField(blank=True, default=list))
    target_muscles = ArrayField(models.CharField(max_length=50, blank=True, default=list))
    synergist_muscles = ArrayField(models.CharField(max_length=50, blank=True, default=list))
    equipment = ArrayField(models.CharField(max_length=50, blank=True, default=list))
    compound_movement = models.BooleanField(null=True, blank=True)


    def __str__(self):
        return f'{self.name}\nMuscle group: {self.muscle_group}\n Description: {self.description}'
