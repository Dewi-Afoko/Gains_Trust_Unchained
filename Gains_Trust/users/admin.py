from django.contrib import admin
from .models import User, UserRecord, Weight

# Register your models here.
admin.site.register(User)
admin.site.register(UserRecord)
admin.site.register(Weight)
