import environ
from pathlib import Path 
from datetime import timedelta
# BASE_DIR must be defined first
BASE_DIR = Path(__file__).resolve().parent.parent.parent
# base.py is at: backend/config/settings/base.py 
# .parent.parent.parent = backend/
env = environ.Env()
environ.Env.read_env(BASE_DIR / '.env')
# Single SECRET_KEY — reads from .env
SECRET_KEY = env('DJANGO_SECRET_KEY', 
default='dev-key-change-in-production')
DEBUG = env.bool('DJANGO_DEBUG', default=True)
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['*']) 
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:3000')
# MOST CRITICAL LINE — must be before first migration
AUTH_USER_MODEL = 'accounts.User' 
INSTALLED_APPS = [
'django.contrib.admin', 
'django.contrib.auth',
'django.contrib.contenttypes', 
'django.contrib.sessions',
'django.contrib.messages', 
'django.contrib.staticfiles',
# Third-party
'rest_framework',
'rest_framework_simplejwt', 
'corsheaders',
'social_django', 
'django_filters', 
'drf_spectacular',
# Your appsSessions Marketplace — Complete Build Guide  ·  Page 11
'apps.accounts',
'apps.sessions_app', 
'apps.bookings',
]
MIDDLEWARE = [
'django.middleware.security.SecurityMiddleware',
'corsheaders.middleware.CorsMiddleware', # must be 2nd
'django.contrib.sessions.middleware.SessionMiddleware',
'django.middleware.common.CommonMiddleware',
'django.middleware.csrf.CsrfViewMiddleware',
'django.contrib.auth.middleware.AuthenticationMiddleware',
'django.contrib.messages.middleware.MessageMiddleware',
'django.middleware.clickjacking.XFrameOptionsMiddleware',
'social_django.middleware.SocialAuthExceptionMiddleware',
]
ROOT_URLCONF = 'config.urls' 
TEMPLATES = [{
'BACKEND': 'django.template.backends.django.DjangoTemplates',
'DIRS': [],
'APP_DIRS': True,
'OPTIONS': {'context_processors': [
'django.template.context_processors.debug',
'django.template.context_processors.request',
'django.contrib.auth.context_processors.auth',
'django.contrib.messages.context_processors.messages',
'social_django.context_processors.backends',
'social_django.context_processors.login_redirect', 
]},
}]
WSGI_APPLICATION = 'config.wsgi.application' 
DATABASES = {
'default': {
'ENGINE': 'django.db.backends.postgresql',
'NAME': env('POSTGRES_DB', default='sessions_db'),
'USER': env('POSTGRES_USER', default='sessions_user'), 
'PASSWORD': env('POSTGRES_PASSWORD', default='password'), 
'HOST': env('POSTGRES_HOST', default='localhost'),
'PORT': env('POSTGRES_PORT', default='5432'), 
'OPTIONS': {
            'sslmode': 'require',
        },
}
}
REST_FRAMEWORK = {
'DEFAULT_AUTHENTICATION_CLASSES': [
'rest_framework_simplejwt.authentication.JWTAuthentication', 
],
'DEFAULT_PERMISSION_CLASSES': [
'rest_framework.permissions.IsAuthenticatedOrReadOnly', 
],
'DEFAULT_FILTER_BACKENDS': [
'django_filters.rest_framework.DjangoFilterBackend', 
'rest_framework.filters.SearchFilter',
'rest_framework.filters.OrderingFilter', 
],
'DEFAULT_PAGINATION_CLASS':
'rest_framework.pagination.PageNumberPagination', 
'PAGE_SIZE': 12,
'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema', 
}
SIMPLE_JWT = {
'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
'REFRESH_TOKEN_LIFETIME': timedelta(days=30), 
'ROTATE_REFRESH_TOKENS': True,
'BLACKLIST_AFTER_ROTATION': True, 
'AUTH_HEADER_TYPES': ('Bearer',), 
}
AUTHENTICATION_BACKENDS = [
'social_core.backends.google.GoogleOAuth2', 
'social_core.backends.github.GithubOAuth2', 
'django.contrib.auth.backends.ModelBackend', 
]
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = env('GOOGLE_CLIENT_ID', default='')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = env('GOOGLE_CLIENT_SECRET', default='')
SOCIAL_AUTH_GITHUB_KEY = env('GITHUB_CLIENT_ID', default='')
SOCIAL_AUTH_GITHUB_SECRET = env('GITHUB_CLIENT_SECRET', default='')
SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/api/auth/callback/'
SOCIAL_AUTH_PIPELINE = (
'social_core.pipeline.social_auth.social_details',
'social_core.pipeline.social_auth.social_uid',
'social_core.pipeline.social_auth.auth_allowed',
'social_core.pipeline.social_auth.social_user',
'social_core.pipeline.user.get_username',
'social_core.pipeline.user.create_user',
'apps.accounts.pipeline.save_profile',
'social_core.pipeline.social_auth.associate_user',
'social_core.pipeline.social_auth.load_extra_data',
'social_core.pipeline.user.user_details',
)
CORS_ALLOWED_ORIGINS = ['http://localhost:3000','http://127.0.0.1:3000'] 
CORS_ALLOW_CREDENTIALS = True
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles' 
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media' 
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC' 
USE_I18N = True 
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField' 
SPECTACULAR_SETTINGS = {
'TITLE': 'Sessions Marketplace API', 'VERSION': '1.0.0',
}