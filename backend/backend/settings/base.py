"""
Shared Django settings for the backend project, common to every environment.
development.py and production.py both start with `from .base import *` and
layer their own environment-specific overrides on top — see this package's
__init__.py for which one gets picked, based on DEBUG.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# This file lives at backend/backend/settings/base.py, three levels below
# the Django project root (backend/) where manage.py, db.sqlite3, and media/
# live — hence parent.parent.parent instead of the single parent.parent a
# flat settings.py would use.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables explicitly from backend/.env — without an explicit
# path, load_dotenv() searches upward from the current working directory and
# can silently pick up an unrelated .env (e.g. the frontend's root .env).
load_dotenv(BASE_DIR / '.env')


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-secret-key-for-development-only')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Render injects this automatically for every service — include it so the
# deployed backend doesn't need ALLOWED_HOSTS set manually.
_render_hostname = os.getenv('RENDER_EXTERNAL_HOSTNAME')
if _render_hostname:
    ALLOWED_HOSTS.append(_render_hostname)


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'drf_spectacular',
    'corsheaders',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'crispy_forms',
    'crispy_bootstrap5',
    
    # Project apps
    'resume_api',
    'interviews',
    'users',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'backend.middleware.ContentSecurityPolicyMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'users.admin_audit.CurrentRequestMiddleware',
]

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + [origin.strip() for origin in os.getenv('CORS_EXTRA_ORIGINS', '').split(',') if origin.strip()]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + [origin.strip() for origin in os.getenv('CORS_EXTRA_ORIGINS', '').split(',') if origin.strip()]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    # Scoped throttle protects the public (AllowAny), Groq-backed chat
    # endpoint from being hammered by anonymous traffic, since each request
    # costs a real Groq API call.
    'DEFAULT_THROTTLE_RATES': {
        'interview_chat': '30/minute',
        'ai_tools': '20/minute',
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # Adds a consistent `error: {message, status_code}` object to every
    # DRF-raised error response, without touching the existing `detail` /
    # field-error shape the frontend already reads.
    'EXCEPTION_HANDLER': 'backend.exception_handlers.api_exception_handler',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'CareerCoach AI API',
    'DESCRIPTION': 'REST API for resume tailoring, mock interviews, and the interview-prep chatbot.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Login and Logout URLs
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'dashboard'
LOGOUT_REDIRECT_URL = 'login'

# Crispy Forms
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"

# Azure Language service settings
AZURE_LANGUAGE_KEY = os.getenv("AZURE_LANGUAGE_KEY")
AZURE_LANGUAGE_ENDPOINT = os.getenv("AZURE_LANGUAGE_ENDPOINT")

# Azure Computer Vision settings
AZURE_VISION_KEY = os.getenv("AZURE_VISION_KEY")
AZURE_VISION_ENDPOINT = os.getenv("AZURE_VISION_ENDPOINT")

# Azure Machine Learning settings
ML_SUBSCRIPTION_ID = os.getenv("ML_SUBSCRIPTION_ID")
ML_RESOURCE_GROUP = os.getenv("ML_RESOURCE_GROUP")
ML_WORKSPACE_NAME = os.getenv("ML_WORKSPACE_NAME")

# Groq API settings
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# The deployed React app's origin, used to build links (e.g. password-reset)
# that need to point at the SPA rather than this Django backend.
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Email — defaults to printing to the console since no SMTP provider is
# configured. Set EMAIL_HOST/EMAIL_HOST_USER/EMAIL_HOST_PASSWORD (and this
# to 'django.core.mail.backends.smtp.EmailBackend') to send real email.
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@careercoach-ai.local')

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
_static_dir = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = [_static_dir] if os.path.isdir(_static_dir) else []
STORAGES = {
    # Django 4.2+ requires a "default" entry (used for FileField/ImageField,
    # e.g. Profile.profile_picture) once STORAGES is defined at all — without
    # it, any serializer touching an uploaded file's .url crashes with
    # InvalidStorageError instead of falling back to FileSystemStorage.
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Media files (User uploaded files)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Baseline security headers shared by every environment. HSTS/SSL-redirect/
# secure-cookies are production-only overrides — see settings/production.py.
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Cache — in-memory by default (fine for a single-process deployment like
# Render's free tier); override CACHE_BACKEND/CACHE_LOCATION for Redis/Memcached.
CACHES = {
    'default': {
        'BACKEND': os.getenv('CACHE_BACKEND', 'django.core.cache.backends.locmem.LocMemCache'),
        'LOCATION': os.getenv('CACHE_LOCATION', 'careercoach-ai-cache'),
    }
}
