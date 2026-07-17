"""
Enhanced admin audit trail. django.contrib.admin already writes a LogEntry
for every add/change/delete made through /admin/, but LogEntry doesn't
capture the request IP and isn't easily filterable as a dedicated "security"
view. This module mirrors each LogEntry into AdminActionLog with that extra
context, via a thread-local set by CurrentRequestMiddleware and read by the
post_save signal receiver below.
"""
import threading

_local = threading.local()


class CurrentRequestMiddleware:
    """Stashes the current request's IP in a thread-local so the LogEntry
    post_save signal (which has no access to the request) can read it."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _local.ip_address = _get_client_ip(request)
        try:
            return self.get_response(request)
        finally:
            _local.ip_address = None


def _get_client_ip(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def get_current_ip():
    return getattr(_local, 'ip_address', None)


def mirror_log_entry(sender, instance, created, **kwargs):
    """Signal receiver for django.contrib.admin.models.LogEntry post_save."""
    if not created:
        return
    from .models import AdminActionLog

    AdminActionLog.objects.create(
        log_entry_id=instance.pk,
        actor_username=instance.user.get_username() if instance.user_id else '',
        action_flag=instance.action_flag,
        content_type_name=str(instance.content_type) if instance.content_type_id else '',
        object_id=instance.object_id,
        object_repr=instance.object_repr,
        change_message=instance.change_message,
        ip_address=get_current_ip(),
    )
