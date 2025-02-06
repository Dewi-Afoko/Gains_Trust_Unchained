from django.db import models
from ..models import User, Exercise, SetDict

class UserRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_records')  
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='user_records') 
    set_dict = models.ForeignKey(SetDict, on_delete=models.CASCADE, related_name='user_records', null=True, blank=True)  
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    reps = models.IntegerField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True) 


    def __str__(self):
        return f'{self.user.username} - {self.exercise.name} - {self.weight}kg x {self.reps} reps'