"""
Settings package entry point. DJANGO_SETTINGS_MODULE stays 'backend.settings'
everywhere (manage.py, wsgi.py, asgi.py, Render) — this __init__ picks
development.py or production.py based on DEBUG, so no deployment config
needs to change to pick up the split.
"""
from . import base as _base

if _base.DEBUG:
    from .development import *  # noqa: F401,F403
else:
    from .production import *  # noqa: F401,F403
