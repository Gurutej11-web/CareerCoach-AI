from django.db import models
from django.contrib.auth.models import User
import uuid

class Resume(models.Model):
    """Model to store user's resume information"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")
    title = models.CharField(max_length=100)
    file_name = models.CharField(max_length=255)
    content = models.TextField()
    file_type = models.CharField(max_length=10)  # pdf, docx, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"

class JobDescription(models.Model):
    """Model to store job descriptions for analysis"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="job_descriptions")
    title = models.CharField(max_length=100)
    company = models.CharField(max_length=100, blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    file_type = models.CharField(max_length=10, blank=True, null=True)  # pdf, docx, txt, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.company or 'Unknown'}"

class ResumeAnalysis(models.Model):
    """Model to store the results of resume analysis"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="analyses")
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="analyses")
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name="analyses")
    keywords_to_add = models.JSONField(default=list)
    keywords_to_remove = models.JSONField(default=list)
    format_suggestions = models.JSONField(default=list)
    content_suggestions = models.JSONField(default=list)
    match_score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Resume Analyses"
    
    def __str__(self):
        return f"Analysis for {self.resume.title} - {self.job_description.title}"

class MockInterview(models.Model):
    """Model to store mock interview data and analysis results"""
    DIFFICULTY_CHOICES = [
        ('junior', 'Junior'),
        ('mid', 'Mid-level'),
        ('senior', 'Senior'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mock_interviews")
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE,
                                        related_name="mock_interviews", null=True, blank=True)
    title = models.CharField(max_length=100)
    transcript = models.TextField()
    audio_file_path = models.CharField(max_length=255, blank=True, null=True)  # Path to stored audio file
    duration = models.FloatField(default=0.0)  # Duration in seconds
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='mid')
    # The actual question asked, so attempts at the same question can be
    # grouped for a per-question score trend.
    question_text = models.TextField(blank=True)
    # Groups multiple question-attempts fired from one "full session" run
    # into a single combined report. Blank for standalone single-question attempts.
    session_id = models.CharField(max_length=64, blank=True, db_index=True)
    # Set only when the user explicitly generates a shareable link for this
    # attempt, so a mentor can view the (read-only) feedback without logging in.
    share_token = models.UUIDField(null=True, blank=True, unique=True)

    # Analysis results stored as JSON
    audio_analysis = models.JSONField(default=dict)
    content_analysis = models.JSONField(default=dict)
    feedback = models.JSONField(default=dict)
    overall_score = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Mock Interviews"

    def __str__(self):
        return f"Mock Interview: {self.title} - {self.user.username}"
    
class UserActivity(models.Model):
    """
    Lightweight per-account activity log powering the dashboard's stats,
    score chart, achievements, and recent-activity feed. Stored server-side
    (tied to the authenticated user) rather than in browser localStorage, so
    the same data follows the account across devices and doesn't leak
    between different users sharing one device/browser.
    """
    ACTIVITY_TYPES = [
        ('resume', 'Resume'),
        ('interview', 'Interview'),
        ('chatbot', 'Chatbot'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activities")
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.CharField(max_length=255)
    score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "User Activities"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.activity_type}: {self.description} - {self.user.username}"

class ChatMessage(models.Model):
    """Model to store chat messages for the interview preparation chatbot"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_messages")
    message = models.TextField()
    is_user = models.BooleanField(default=True)  # True if message is from user, False if from bot
    timestamp = models.DateTimeField(auto_now_add=True)
    session_id = models.CharField(max_length=100)  # To group messages in a conversation
    
    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{'User' if self.is_user else 'Bot'}: {self.message[:50]}..."

class BookmarkedAnswer(models.Model):
    """
    A chatbot answer the user starred for quick reference later. Stores the
    answer text directly (not a FK to ChatMessage) so a bookmark survives
    independently of the original conversation's lifecycle.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookmarked_answers")
    question = models.TextField(blank=True)
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Bookmark: {self.answer[:50]}... - {self.user.username}"


class Notification(models.Model):
    """
    In-app notification (streaks, achievements, progress digest) shown in the
    dashboard's notification center. Separate from email delivery — creating
    one of these never sends anything on its own.
    """
    NOTIFICATION_TYPES = [
        ('streak', 'Streak'),
        ('achievement', 'Achievement'),
        ('digest', 'Progress Digest'),
        ('system', 'System'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    title = models.CharField(max_length=150)
    message = models.CharField(max_length=500)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.notification_type}: {self.title} - {self.user.username}"
