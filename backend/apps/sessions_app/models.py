import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Session(models.Model):
    # Status Options
    STATUS_CHOICES = [
        ('draft',     'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
    ]

    # Ownership & Categorization
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions'
    )

    # Core Content
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    cover_image = models.ImageField(
        upload_to='sessions/',
        null=True,
        blank=True
    )

    # Logistics & Pricing
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )
    capacity = models.PositiveIntegerField(default=1)
    duration_min = models.PositiveIntegerField(default=60)
    scheduled_at = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=12,
        choices=STATUS_CHOICES,
        default='draft'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']

    def save(self, *args, **kwargs):
        """Automatically generate a unique slug if not provided."""
        if not self.slug:
            unique_id = str(uuid.uuid4())[:8]
            self.slug = f"{slugify(self.title)}-{unique_id}"
        super().save(*args, **kwargs)

    @property
    def spots_remaining(self):
        """Calculates available spots based on confirmed bookings."""
        from apps.bookings.models import Booking
        confirmed_count = self.bookings.filter(status='confirmed').count()
        return max(0, self.capacity - confirmed_count)

    def __str__(self):
        return self.title