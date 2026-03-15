from django.contrib import admin
from .models import Booking

# Register your models here.

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'user', 
        'session', 
        'status', 
        'amount_paid', 
        'booked_at'
    )
    list_filter = ('status',)
    search_fields = (
        'user__email', 
        'session__title'
    )