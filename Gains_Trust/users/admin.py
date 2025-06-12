from django.contrib import admin
from .models import User, UserRecord, Weight, PasswordResetToken

# Register your models here.
admin.site.register(User)
admin.site.register(UserRecord)
admin.site.register(Weight)

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'is_used', 'is_expired']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['token', 'created_at']
