from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, parser_classes, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import ScopedRateThrottle
from django.conf import settings
from django.contrib.auth.models import User
import os
import json
import tempfile
import uuid

from .pagination import ActivityPagination

# Uploaded files are read fully into memory for text extraction, so cap
# their size well below what would strain the 512MB Render free-tier worker.
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_DOCUMENT_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}
ALLOWED_AUDIO_EXTENSIONS = {'wav', 'webm', 'mp3', 'ogg', 'm4a'}


def _validate_upload(file_obj, allowed_extensions, label):
    """Returns an error string if the upload fails size/type checks, else None."""
    if file_obj.size > MAX_UPLOAD_SIZE_BYTES:
        return f"{label} is too large ({file_obj.size // (1024 * 1024)}MB). Maximum size is 10MB."
    ext = file_obj.name.rsplit('.', 1)[-1].lower() if '.' in file_obj.name else ''
    if ext not in allowed_extensions:
        return f"{label} has an unsupported file type '.{ext}'. Allowed types: {', '.join(sorted(allowed_extensions))}."
    return None

from .models import Resume, JobDescription, ResumeAnalysis, ChatMessage, MockInterview, UserActivity, BookmarkedAnswer
from .serializers import (
    ResumeSerializer,
    JobDescriptionSerializer,
    ResumeAnalysisSerializer,
    ResumeAnalysisResultSerializer,
    MockInterviewSerializer,
    InterviewAnalysisResultSerializer,
    InterviewFeedbackSerializer,
    ChatMessageSerializer,
    UserActivitySerializer,
    BookmarkedAnswerSerializer
)
from .resume_analyzer import ResumeAnalyzer
from .interview_analyzer import InterviewAnalyzer
from . import azure_language_client
from . import azure_speech_client
from . import azure_language_client
from .groq_client import InterviewChatbot, get_groq_client
import json

# Initialize the resume analyzer and interview chatbot
resume_analyzer = ResumeAnalyzer()
interview_chatbot = InterviewChatbot()
interview_analyzer = InterviewAnalyzer()

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def analyze_resume(request):
    """
    Analyze a resume against a job description and provide tailoring suggestions.
    """
    resume_file = request.FILES.get('resume_file')
    job_desc_file = request.FILES.get('job_desc_file')
    
    if not resume_file or not job_desc_file:
        return Response({
            'error': 'Both resume and job description files are required.'
        }, status=status.HTTP_400_BAD_REQUEST)

    for upload, label in ((resume_file, 'Resume'), (job_desc_file, 'Job description')):
        validation_error = _validate_upload(upload, ALLOWED_DOCUMENT_EXTENSIONS, label)
        if validation_error:
            return Response({'error': validation_error}, status=status.HTTP_400_BAD_REQUEST)

    analyzer = ResumeAnalyzer()
    
    # Extract text from files
    resume_text = analyzer.extract_text_from_file(
        resume_file.read(), 
        resume_file.name.split('.')[-1]
    )
    
    job_desc_text = analyzer.extract_text_from_file(
        job_desc_file.read(), 
        job_desc_file.name.split('.')[-1]
    )
    
    # Analyze the resume against the job description
    analysis_result = analyzer.analyze_resume_and_job_description(
        resume_text, 
        job_desc_text
    )
    
    # Log the complete results for debugging
    print("Complete analysis result:", json.dumps(analysis_result, default=str, indent=2))
    
    # Specifically check the sentiment analysis part
    sentiment_data = analysis_result.get('sentimentAnalysis', {})
    print("Sentiment Analysis data:", json.dumps(sentiment_data, default=str, indent=2))
    
    return Response(analysis_result, status=status.HTTP_200_OK)

@api_view(['POST'])
def test_sentiment_analysis(request):
    """
    Debug endpoint to test sentiment analysis functionality.
    """
    text = request.data.get('text', 'This is a test text with a neutral sentiment.')
    result = azure_language_client.analyze_sentiment(text)
    
    # Log the raw result
    print("Raw sentiment analysis result:", result)
    
    # Return the full result
    return Response(result, status=status.HTTP_200_OK)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def analyze_interview(request):
    """
    Analyze a mock interview recording and provide feedback.
    """
    audio_file = request.FILES.get('audio_file')
    job_description_id = request.data.get('job_description_id')
    interview_title = request.data.get('title', 'Mock Interview')
    
    if not audio_file:
        return Response({
            'error': 'Audio file is required.'
        }, status=status.HTTP_400_BAD_REQUEST)

    validation_error = _validate_upload(audio_file, ALLOWED_AUDIO_EXTENSIONS, 'Audio recording')
    if validation_error:
        return Response({'error': validation_error}, status=status.HTTP_400_BAD_REQUEST)

    # Get job description text if provided
    job_description_text = ""
    job_description = None
    
    if job_description_id:
        try:
            job_description = JobDescription.objects.get(id=job_description_id)
            job_description_text = job_description.content
        except JobDescription.DoesNotExist:
            return Response({
                'error': 'Job description not found.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    # Read audio data from file
    audio_data = audio_file.read()
    
    # Save audio file for later reference
    audio_file_path = None
    if audio_data:
        # Create a unique filename
        filename = f"interview_{uuid.uuid4().hex}.wav"
        audio_dir = os.path.join(settings.MEDIA_ROOT, 'interviews')
        
        # Create directory if it doesn't exist
        os.makedirs(audio_dir, exist_ok=True)
        
        # Save audio file
        audio_file_path = os.path.join(audio_dir, filename)
        with open(audio_file_path, 'wb') as f:
            f.write(audio_data)
    
    # Analyze the interview
    analysis_result = interview_analyzer.analyze_interview(audio_data, job_description_text)
    
    if "error" in analysis_result:
        return Response({
            'error': analysis_result["error"]
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create or update the MockInterview model instance
    mock_interview = MockInterview(
        user=request.user,
        job_description=job_description,
        title=interview_title,
        transcript=analysis_result.get("transcript", ""),
        audio_file_path=audio_file_path,
        duration=analysis_result.get("audio_analysis", {}).get("duration", 0),
        audio_analysis=analysis_result.get("audio_analysis", {}),
        content_analysis=analysis_result.get("content_analysis", {}),
        feedback=analysis_result.get("feedback", {}),
        overall_score=analysis_result.get("feedback", {}).get("overall_score", {}).get("score", 0)
    )
    mock_interview.save()
    
    # Return the analysis result
    serializer = InterviewAnalysisResultSerializer(analysis_result)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_interview_feedback(request, interview_id):
    """
    Get detailed feedback for a specific mock interview.
    """
    try:
        interview = MockInterview.objects.get(id=interview_id, user=request.user)
        feedback = interview.feedback
        
        serializer = InterviewFeedbackSerializer(feedback)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except MockInterview.DoesNotExist:
        return Response({
            'error': 'Mock interview not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
def interview_chat(request):
    """
    Process a user message to the interview preparation chatbot and get a response.
    """
    try:
        user_message = request.data.get('message', '')
        session_id = request.data.get('session_id', '')
        user_id = request.user.id if request.user.is_authenticated else None
        
        if not user_message:
            return Response({
                'error': 'Message is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate a new session ID if none provided
        if not session_id:
            session_id = interview_chatbot.generate_session_id()
        
        # Get previous messages in this session if user is authenticated
        previous_messages = []
        if user_id:
            previous_messages = ChatMessage.objects.filter(
                user_id=user_id,
                session_id=session_id
            ).order_by('timestamp')
        
        # Save the user message if user is authenticated
        if user_id:
            user_chat_message = ChatMessage.objects.create(
                user_id=user_id,
                message=user_message,
                is_user=True,
                session_id=session_id
            )
        
        # Get response from the chatbot with better error handling
        print(f"Sending message to Groq: '{user_message}'")
        bot_response = interview_chatbot.get_response(user_message, previous_messages)
        print(f"Received response from Groq: '{bot_response}'")
        
        # Save the bot response if user is authenticated
        if user_id:
            bot_chat_message = ChatMessage.objects.create(
                user_id=user_id,
                message=bot_response,
                is_user=False,
                session_id=session_id
            )
        
        return Response({
            'message': bot_response,
            'session_id': session_id
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Error in interview_chat view: {str(e)}")
        return Response({
            'error': 'An unexpected error occurred.',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view wraps this in a generated APIView subclass exposed as `.cls`;
# throttle_scope must be set there (not on the function) for ScopedRateThrottle
# to find it — this is the public, unauthenticated endpoint most exposed to abuse.
interview_chat.cls.throttle_scope = 'interview_chat'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_history(request):
    """
    Get the chat history for a specific session.
    """
    session_id = request.query_params.get('session_id', '')
    
    if not session_id:
        return Response({
            'error': 'Session ID is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get messages for this session
    messages = ChatMessage.objects.filter(
        user=request.user,
        session_id=session_id
    ).order_by('timestamp')
    
    serializer = ChatMessageSerializer(messages, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_sessions(request):
    """
    Get a list of all chat sessions for the authenticated user.
    """
    # Get all unique session IDs for this user. ChatMessage's default
    # ordering (Meta.ordering = ['timestamp']) gets pulled into the SELECT
    # for DISTINCT to be well-defined, which silently turns this into
    # "distinct (session_id, timestamp)" and returns the same session once
    # per message. order_by() clears that default ordering first.
    sessions = ChatMessage.objects.filter(
        user=request.user
    ).order_by().values('session_id').distinct()
    
    session_data = []
    for session in sessions:
        session_id = session['session_id']
        # Get the first message in this session
        first_message = ChatMessage.objects.filter(
            user=request.user,
            session_id=session_id,
            is_user=True
        ).order_by('timestamp').first()
        
        # Get the timestamp of the last message
        last_message = ChatMessage.objects.filter(
            user=request.user,
            session_id=session_id
        ).order_by('-timestamp').first()
        
        if first_message and last_message:
            session_data.append({
                'session_id': session_id,
                'title': first_message.message[:50] + ('...' if len(first_message.message) > 50 else ''),
                'last_updated': last_message.timestamp
            })
    
    # Sort sessions by last updated timestamp, newest first
    session_data.sort(key=lambda x: x['last_updated'], reverse=True)
    
    return Response(session_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_faq_topics(request):
    """
    Get a list of predefined FAQ topics for the interview preparation chatbot.
    """
    faq_topics = list(interview_chatbot.predefined_faqs.keys())
    
    return Response({
        'topics': faq_topics
    }, status=status.HTTP_200_OK)

class ResumeViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing Resume instances"""
    serializer_class = ResumeSerializer
    
    def get_queryset(self):
        """Return resumes for the current authenticated user only"""
        user = self.request.user
        if user.is_authenticated:
            return Resume.objects.filter(user=user).order_by('-created_at')
        return Resume.objects.none()
    
    def perform_create(self, serializer):
        """Set the user when creating a new resume"""
        serializer.save(user=self.request.user)

class JobDescriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing JobDescription instances"""
    serializer_class = JobDescriptionSerializer
    
    def get_queryset(self):
        """Return job descriptions for the current authenticated user only"""
        user = self.request.user
        if user.is_authenticated:
            return JobDescription.objects.filter(user=user).order_by('-created_at')
        return JobDescription.objects.none()
    
    def perform_create(self, serializer):
        """Set the user when creating a new job description"""
        serializer.save(user=self.request.user)

class ResumeAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing ResumeAnalysis instances"""
    serializer_class = ResumeAnalysisSerializer
    
    def get_queryset(self):
        """Return analyses for the current authenticated user only"""
        user = self.request.user
        if user.is_authenticated:
            return ResumeAnalysis.objects.filter(user=user).order_by('-created_at')
        return ResumeAnalysis.objects.none()

class MockInterviewViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and managing MockInterview instances"""
    serializer_class = MockInterviewSerializer
    
    def get_queryset(self):
        """Return mock interviews for the current authenticated user only"""
        user = self.request.user
        if user.is_authenticated:
            return MockInterview.objects.filter(user=user).order_by('-created_at')
        return MockInterview.objects.none()
    
    def perform_create(self, serializer):
        """Set the user when creating a new mock interview"""
        serializer.save(user=self.request.user)

class UserActivityViewSet(viewsets.ModelViewSet):
    """
    Per-account dashboard activity log (stats, score chart, achievements,
    recent-activity feed). Every request is scoped to request.user, so this
    data lives with the account, not the browser/device.
    """
    serializer_class = UserActivitySerializer
    pagination_class = ActivityPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return UserActivity.objects.filter(user=user).order_by('-created_at')
        return UserActivity.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Each entry is a (label, system prompt) pair used to steer the Groq model
# toward one specific career-coaching task. Keyed by the id the frontend
# sends so new tools can be added here without touching the view logic.
AI_TOOLS = {
    'salary_negotiation': (
        'Salary Negotiation Coach',
        "You are a salary negotiation coach. Given the user's job offer details and goals, "
        "provide a short negotiation script they could say out loud, plus 3-4 concise tips. "
        "Be practical and specific to the numbers/context they gave you."
    ),
    'linkedin_headline': (
        'LinkedIn Headline & Summary Optimizer',
        "You are a LinkedIn profile optimization expert. Given the user's role, experience, and "
        "goals, write 3 alternative LinkedIn headlines (under 220 characters each) and a 3-sentence "
        "'About' summary. Keep it professional and specific, not generic buzzwords."
    ),
    'job_red_flags': (
        'Job Posting Red-Flag Detector',
        "You are a job posting analyst. Given a job description, list any red flags (vague pay, "
        "unrealistic requirements for the level, excessive scope, culture warning signs) as bullet "
        "points, then give an overall risk rating of Low, Medium, or High with a one-line reason."
    ),
    'networking_message': (
        'Networking Message Generator',
        "You are a professional networking coach. Given who the user wants to contact and why, "
        "write a concise, warm, non-pushy outreach message (suitable for LinkedIn or email) under "
        "150 words."
    ),
    'skill_gap': (
        'Skill Gap Analyzer',
        "You are a career coach. Given the user's current skills and their target role, list the "
        "key skill gaps as bullet points, and for each one suggest a specific type of course, "
        "certification, or project that would close it."
    ),
    'company_research': (
        'Company Research Briefing',
        "You are a company research assistant preparing a candidate for an interview. Given the "
        "company name and any details provided, produce a short briefing: likely culture/values, "
        "what they probably care about right now, and 3 smart questions to ask the interviewer."
    ),
    'elevator_pitch': (
        'Elevator Pitch Generator',
        "You are an elevator pitch coach. Given the user's background and the role they're "
        "targeting, write a natural-sounding 30-second spoken elevator pitch (roughly 75-100 words)."
    ),
    'thank_you_note': (
        'Post-Interview Thank-You Note',
        "You are an interview follow-up coach. Given details about the interview (role, interviewer, "
        "topics discussed), write a concise, warm, professional thank-you email, under 150 words."
    ),
    'interview_predictor': (
        'Interview Question Predictor',
        "You are an interview question predictor. Given a job description, predict the 6-8 most "
        "likely interview questions for this role, grouped under headings like Behavioral, "
        "Technical, and Situational."
    ),
    'bullet_rewriter': (
        'Resume Bullet-Point Rewriter',
        "You are a resume writing coach. Given the user's raw job duties or bullet points, rewrite "
        "each one into a concise, achievement-oriented bullet point that leads with a strong action "
        "verb and includes a quantified result wherever plausible. Return one rewritten bullet per "
        "line, in the same order as the input."
    ),
    'cover_letter': (
        'Cover Letter Generator',
        "You are a cover letter writer. Given the user's background/resume summary and the job "
        "description or role they're applying to, write a concise, tailored cover letter (3-4 short "
        "paragraphs) that connects their experience to the role without simply repeating the resume."
    ),
}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([ScopedRateThrottle])
def ai_tools_generate(request):
    """
    Generic endpoint powering the AI Tools hub (salary coach, LinkedIn
    optimizer, red-flag detector, etc.) — one Groq call per request, steered
    by a per-tool system prompt, so each new tool is just a dictionary entry
    rather than a new view.
    """
    tool = request.data.get('tool', '')
    user_input = request.data.get('input', '').strip()

    if tool not in AI_TOOLS:
        return Response({'error': 'Unknown tool.'}, status=status.HTTP_400_BAD_REQUEST)
    if not user_input:
        return Response({'error': 'Please provide some input for this tool.'}, status=status.HTTP_400_BAD_REQUEST)

    label, system_prompt = AI_TOOLS[tool]

    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input},
            ],
            temperature=0.7,
            max_tokens=700,
        )
        result = response.choices[0].message.content.strip()
        return Response({'tool': tool, 'label': label, 'result': result}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': 'The AI service is temporarily unavailable. Please try again in a moment.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

ai_tools_generate.cls.throttle_scope = 'ai_tools'

class BookmarkedAnswerViewSet(viewsets.ModelViewSet):
    """Chatbot answers the user starred for quick reference later."""
    serializer_class = BookmarkedAnswerSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return BookmarkedAnswer.objects.filter(user=user).order_by('-created_at')
        return BookmarkedAnswer.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
