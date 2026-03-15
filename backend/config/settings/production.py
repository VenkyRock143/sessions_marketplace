from .base import * 
DEBUG = False
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS')
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True 
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
DATABASES['default']['CONN_MAX_AGE'] = 60
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS',Sessions Marketplace — Complete Build Guide  ·  Page 13
default=['https://yourdomain.com'])