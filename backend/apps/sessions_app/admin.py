from django.contrib import admin

# Register your models here.
from django.contrib import admin 
from .models import Category, Session 
@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'status', 
    'scheduled_at', 'price')
    list_filter = ('status', 'category') 
    list_editable = ('status',)
    search_fields = ('title', 'creator__email') 
    prepopulated_fields = {'slug': ('title',)} 
    admin.site.register(Category)