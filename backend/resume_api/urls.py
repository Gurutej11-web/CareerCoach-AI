from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'resumes', views.ResumeViewSet, basename='resume')
router.register(r'job-descriptions', views.JobDescriptionViewSet, basename='jobdescription')
router.register(r'analyses', views.ResumeAnalysisViewSet, basename='resumeanalysis')
router.register(r'mock-interviews', views.MockInterviewViewSet, basename='mockinterview')
router.register(r'activity', views.UserActivityViewSet, basename='useractivity')
router.register(r'bookmarks', views.BookmarkedAnswerViewSet, basename='bookmarkedanswer')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

# The API URLs are determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('analyze/', views.analyze_resume, name='analyze-resume'),
    path('test-sentiment/', views.test_sentiment_analysis, name='test_sentiment_analysis'),
    path('keyword-libraries/', views.keyword_libraries, name='keyword-libraries'),
    path('analyses/<int:analysis_id>/download/', views.download_tailored_resume, name='download-tailored-resume'),

    #Mock Interview
    path('analyze-interview/', views.analyze_interview, name='analyze-interview'),
    path('interview-feedback/<int:interview_id>/', views.get_interview_feedback, name='interview-feedback'),
    path('save-interview-attempt/', views.save_interview_attempt, name='save-interview-attempt'),
    path('mock-interviews/<int:interview_id>/share/', views.generate_share_link, name='generate-share-link'),
    path('shared-interview/<uuid:share_token>/', views.shared_interview_view, name='shared-interview'),
    path('question-score-trend/', views.question_score_trend, name='question-score-trend'),
    path('adaptive-follow-up/', views.adaptive_follow_up, name='adaptive-follow-up'),

    # Interview preparation chatbot URLs
    path('interview/chat/', views.interview_chat, name='interview-chat'),
    path('interview/history/', views.get_chat_history, name='chat-history'),
    path('interview/sessions/', views.get_chat_sessions, name='chat-sessions'),
    path('interview/faq-topics/', views.get_faq_topics, name='faq-topics'),

    # AI career tools (salary coach, LinkedIn optimizer, etc.)
    path('ai-tools/generate/', views.ai_tools_generate, name='ai-tools-generate'),

    # Dashboard / gamification
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('benchmark/', views.benchmark, name='benchmark'),
    path('next-best-action/', views.next_best_action, name='next-best-action'),
]
