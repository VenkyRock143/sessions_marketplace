from django.contrib import admin
from .models import Category, Session

# Register your models here.

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = (
        'title', 
        'creator', 
        'status', 
        'scheduled_at', 
        'price'
    )
    list_filter = ('status', 'category')
    list_editable = ('status',)
    search_fields = ('title', 'creator__email')
    
    # Automatically generates slug from the title in the admin UI
    prepopulated_fields = {'slug': ('title',)}

# Simple registration for Category
admin.site.register(Category)