from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile

# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email', 
        'username', 
        'role', 
        'is_staff', 
        'date_joined'
    )
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'username')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role & Bio', {'fields': ('role', 'avatar', 'bio')}),
    )

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'website')
    search_fields = ('user__email', 'display_name')