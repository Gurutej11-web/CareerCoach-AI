from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Profile, AdminActionLog

# Define an inline admin descriptor for Profile model
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    fields = ('bio', 'location', 'birth_date', 'profile_picture', 'job_title', 'company', 'skills', 'phone_number')

# Define a new User admin
class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline, )
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_phone_number', 'get_job_title', 'get_company', 'is_staff')
    list_select_related = ('profile', )

    def get_phone_number(self, instance):
        return instance.profile.phone_number
    get_phone_number.short_description = 'Phone Number'

    def get_job_title(self, instance):
        return instance.profile.job_title
    get_job_title.short_description = 'Job Title'

    def get_company(self, instance):
        return instance.profile.company
    get_company.short_description = 'Company'

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(AdminActionLog)
class AdminActionLogAdmin(admin.ModelAdmin):
    """Read-only audit trail mirroring every admin add/change/delete, with IP."""
    list_display = ('created_at', 'actor_username', 'action_flag', 'content_type_name', 'object_repr', 'ip_address')
    list_filter = ('action_flag', 'content_type_name')
    search_fields = ('actor_username', 'object_repr', 'change_message', 'ip_address')
    readonly_fields = [f.name for f in AdminActionLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
