from django.contrib import admin
from .models import User, Workout, SetDict, Weight

# Register your models here.
admin.site.register(User)
admin.site.register(Workout)
admin.site.register(SetDict)
admin.site.register(Weight)