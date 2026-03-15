
import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Session(models.Model):
    STATUS_CHOICES = [
        ('draft',     'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
    ]

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    title        = models.CharField(max_length=200)
    slug         = models.SlugField(unique=True, blank=True)
    description  = models.TextField()
    category     = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )
    cover_image  = models.ImageField(
        upload_to='sessions/',
        null=True,
        blank=True
    )
    price        = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )
    capacity     = models.PositiveIntegerField(default=1)
    duration_min = models.PositiveIntegerField(default=60)
    scheduled_at = models.DateTimeField()
    location     = models.CharField(max_length=255, blank=True)
    status       = models.CharField(
        max_length=12,
        choices=STATUS_CHOICES,
        default='draft'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = (
                slugify(self.title) + '-' +
                str(uuid.uuid4())[:8]
            )
        super().save(*args, **kwargs)

    @property
    def spots_remaining(self):
        from apps.bookings.models import Booking
        confirmed = self.bookings.filter(
            status='confirmed'
        ).count()
        return self.capacity - confirmed

    def __str__(self):
        return self.title