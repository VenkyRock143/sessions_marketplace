from django.contrib.auth.models import AbstractUser 
from django.db import models
class User(AbstractUser):
    ROLE_USER = 'user'
    ROLE_CREATOR = 'creator'
    ROLE_CHOICES = [('user', 'User'), ('creator', 'Creator')]
    # Override email — make it unique and required
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, 
    default='user')
    avatar = models.ImageField(upload_to='avatars/', 
    null=True, blank=True)
    bio = models.TextField(blank=True)
    # Use email as the login identifier instead of username
    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['username'] 
    @property
    def is_creator(self):
        return self.role == self.ROLE_CREATOR 
        def __str__(self):
            return self.email
            class Profile(models.Model): 
                user = models.OneToOneField(
                User, on_delete=models.CASCADE, related_name='profile' 
                )
                display_name = models.CharField(max_length=120, blank=True) 
                website = models.URLField(blank=True)
                created_at = models.DateTimeField(auto_now_add=True) 
                updated_at = models.DateTimeField(auto_now=True) 
                def __str__(self):
                    return f"Profile({self.user.email})"