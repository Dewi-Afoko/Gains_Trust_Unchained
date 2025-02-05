from django.db import models
from .user import User

class Weight(models.Model):
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='weights')
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    date_recorded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.weight}kg on {self.date_recorded.strftime('%Y-%m-%d')}"