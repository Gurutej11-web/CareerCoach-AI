from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'bio', 'location', 'birth_date', 'profile_picture', 'job_title', 'company', 'skills',
            'phone_number', 'goal_target_score', 'goal_target_interviews', 'email_verified',
            'upcoming_interview_date', 'upcoming_interview_label',
            'career_goal', 'target_role', 'leaderboard_opt_in',
            'portfolio_public', 'portfolio_slug',
            'notify_achievement_alerts', 'notify_streak_reminders', 'notify_progress_digest',
        ]
        read_only_fields = ['email_verified']

    def validate_portfolio_slug(self, value):
        if not value:
            return value
        import re
        if not re.match(r'^[a-z0-9-]+$', value):
            raise serializers.ValidationError('Slug may only contain lowercase letters, numbers, and hyphens.')
        qs = Profile.objects.filter(portfolio_slug__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('This portfolio URL is already taken.')
        return value

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    job_title = serializers.CharField(required=False, allow_blank=True)
    company = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 
                 'phone_number', 'job_title', 'company']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if email is already used
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})
        
        return attrs

    def create(self, validated_data):
        # Remove non-user fields
        phone_number = validated_data.pop('phone_number', '')
        job_title = validated_data.pop('job_title', '')
        company = validated_data.pop('company', '')
        
        # Remove password_confirm from validated data
        validated_data.pop('password_confirm')
        
        # Create user
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        user.set_password(validated_data['password'])
        user.save()
        
        # Update profile with additional info
        if phone_number or job_title or company:
            profile = user.profile
            profile.phone_number = phone_number
            profile.job_title = job_title
            profile.company = company
            profile.save()
        
        return user 