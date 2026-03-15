from django.db import models 
from django.conf import settings 
class Booking(models.Model): 
    STATUS_CHOICES = [
    ('pending', 'Pending'), 
    ('confirmed', 'Confirmed'), 
    ('cancelled', 'Cancelled'), 
    ('completed', 'Completed'), 
    ]
    user = models.ForeignKey( 
    settings.AUTH_USER_MODEL, 
    on_delete=models.CASCADE, 
    related_name='bookings' 
    )
    session = models.ForeignKey( 
    'sessions_app.Session',
    on_delete=models.CASCADE, 
    related_name='bookings' 
    )
    status = models.CharField(
    max_length=12, choices=STATUS_CHOICES, default='pending' 
    )
    stripe_payment_id = models.CharField(max_length=200, blank=True) 
    amount_paid = models.DecimalField(
    max_digits=8, decimal_places=2, default=0 
    )
    notes = models.TextField(blank=True)
    booked_at = models.DateTimeField(auto_now_add=True) 
    updated_at= models.DateTimeField(auto_now=True) 
    class Meta:
        unique_together = ('user', 'session') 
        ordering = ['-booked_at']
        def __str__(self):
            return f"{self.user.email} -> {self.session.title}"