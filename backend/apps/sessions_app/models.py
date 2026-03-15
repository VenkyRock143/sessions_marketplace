from django.db import models

# Create your models here.
import uuid
from django.db import models
from django.conf import settings # never import User directly
from django.utils.text import slugify 
class Category(models.Model):
name = models.CharField(max_length=60, unique=True) 
slug = models.SlugField(unique=True)
class Session(models.Model):
STATUS = [('draft','Draft'),('published','Published'),('cancelled','Cancelled')] 
creator = models.ForeignKey(
settings.AUTH_USER_MODEL, # string ref — survives User model swaps 
on_delete=models.CASCADE,
related_name='sessions' # user.sessions.all() works 
)
title = models.CharField(max_length=200)
slug = models.SlugField(unique=True, blank=True) 
description = models.TextField()
price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
# NEVER FloatField for money — binary floating point errors!
capacity = models.PositiveIntegerField(default=1) 
duration_min = models.PositiveIntegerField(default=60) 
scheduled_at = models.DateTimeField()
status = models.CharField(max_length=12, choices=STATUS, default='draft') 
created_at = models.DateTimeField(auto_now_add=True) # set once
updated_at = models.DateTimeField(auto_now=True) # updated every save
def save(self, *args, **kwargs):
if not self.slug:
self.slug = slugify(self.title) + '-' + str(uuid.uuid4())[:8] 
super().save(*args, **kwargs)
@property
def spots_remaining(self):
from apps.bookings.models import Booking # lazy — avoids circular import 
return self.capacity - self.bookings.filter(status='confirmed').count()