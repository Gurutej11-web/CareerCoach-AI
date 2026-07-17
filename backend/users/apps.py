from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        from django.contrib.admin.models import LogEntry
        from django.db.models.signals import post_save
        from .admin_audit import mirror_log_entry

        post_save.connect(mirror_log_entry, sender=LogEntry, dispatch_uid='mirror_log_entry_to_admin_audit')
