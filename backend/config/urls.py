from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView, 
    SpectacularSwaggerView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Admin Interface
    path('admin/', admin.site.urls),

    # Authentication & Social Auth
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('social-auth/', include('social_django.urls', namespace='social')),
    path('api/auth/', include('apps.accounts.urls')),

    # Feature Apps
    path('api/sessions/', include('apps.sessions_app.urls')),
    path('api/bookings/', include('apps.bookings.urls')),

    # API Documentation (drf-spectacular)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Serving Media Files during Development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, 
        document_root=settings.MEDIA_ROOT
    )