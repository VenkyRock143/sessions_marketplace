from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser 
from django.db import models
class User(AbstractUser):
ROLE_USER = 'user'
ROLE_CREATOR = 'creator'
ROLE_CHOICES = [('user','User'),('creator','Creator')] 
email = models.EmailField(unique=True)
role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user') 
avatar = models.ImageField(upload_to='avatars/', null=True, blank=True) 
bio = models.TextField(blank=True)
USERNAME_FIELD = 'email' # login with email
REQUIRED_FIELDS = ['username'] # still needed for social-auth 
@property
def is_creator(self):
return self.role == self.ROLE_CREATOR