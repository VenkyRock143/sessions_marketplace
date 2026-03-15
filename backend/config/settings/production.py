from .base import *

DEBUG = False
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS')

SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

DATABASES['default']['CONN_MAX_AGE'] = 60

# Supabase / managed Postgres requires SSL
DATABASES['default']['OPTIONS'] = {'sslmode': 'require'}

CORS_ALLOWED_ORIGINS = env.list(
    'CORS_ALLOWED_ORIGINS',
    default=['https://yourdomain.com']
)
