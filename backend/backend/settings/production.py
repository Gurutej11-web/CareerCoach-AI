"""
Production-only overrides, layered on top of base.py. Selected automatically
by __init__.py whenever DEBUG=False — see that file for the switch.
"""
import os
from .base import *  # noqa: F401,F403

# Render terminates TLS at its proxy and forwards plain HTTP internally, so
# Django needs to trust X-Forwarded-Proto to know the original request was
# HTTPS — without this, SECURE_SSL_REDIRECT would redirect-loop.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
