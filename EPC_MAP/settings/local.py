import environ
from .base import *

env = environ.Env()

env.read_env(str(BASE_DIR / "envs"/ ".local"))

SETTINGS_NAME=env('DJANGO_ENV')
DEBUG=True
# Set Template Debug
TEMPLATES[0]['OPTIONS']['debug'] = DEBUG
DEFAULT_HTTP_PROTOCOL="http"

SECRET_KEY=env("SECRET_KEY")

ALLOWED_HOSTS = ['localhost', '127.0.0.1']
BASE_URL = 'http://127.0.0.1:8000'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env("POSTGRESQL_DB_NAME"),
        'USER': env("POSTGRESQL_DB_USER"),
        'PASSWORD': env("POSTGRESQL_DB_PASSWORD"),
        'HOST': env("POSTGRESQL_DB_HOST"),
        'PORT': env("POSTGRESQL_DB_PORT")
    }
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = 'staticfiles'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# Media files (User uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
DEFAULT_FILE_STORAGE = env('DEFAULT_FILE_STORAGE')

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

ACCOUNT_EMAIL_VERIFICATION = 'mandatory'  # Options: 'mandatory', 'optional', 'none'

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

SESSION_COOKIE_SECURE = False