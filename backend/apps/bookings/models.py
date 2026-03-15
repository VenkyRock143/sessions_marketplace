from django.db import models

# Create your models here.
from django.db import models 
from django.conf import settings 
class Booking(models.Model):
STATUS = [('pending','Pending'),('confirmed','Confirmed'), 
('cancelled','Cancelled'),('completed','Completed')] 
user = models.ForeignKey(settings.AUTH_USER_MODEL,
on_delete=models.CASCADE, related_name='bookings') 
session = models.ForeignKey('sessions_app.Session', 
on_delete=models.CASCADE, related_name='bookings')
status = models.CharField(max_length=12, choices=STATUS, default='pending') 
stripe_payment_id = models.CharField(max_length=200, blank=True)
amount_paid = models.DecimalField(max_digits=8, decimal_places=2, default=0) 
booked_at = models.DateTimeField(auto_now_add=True)
class Meta:
unique_together = ('user', 'session') # no double-booking 
ordering = ['-booked_at']