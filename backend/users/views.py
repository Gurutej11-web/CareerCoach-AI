from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils import timezone
from .models import Profile
from .forms import ProfileForm

# REST Framework imports
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

# Import serializers
from .serializers import UserSerializer, ProfileSerializer, RegisterSerializer

# Regular Django views
def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! You can now log in.')
            return redirect('login')
    else:
        form = UserCreationForm()
    return render(request, 'users/register.html', {'form': form})

@login_required
def profile_view(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile has been updated!')
            return redirect('profile')
    else:
        form = ProfileForm(instance=request.user.profile)
    
    return render(request, 'users/profile.html', {'form': form})

# API Views
def send_verification_email(user):
    """
    Email a verification link (console-logged locally since no SMTP provider
    is configured — see the password-reset flow for the same setup). This is
    informational only: an unverified account can still log in and use every
    feature, it just shows a dismissible "verify your email" banner.
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"

    send_mail(
        subject='Verify your CareerCoach AI email',
        message=(
            f"Hi {user.username},\n\n"
            f"Click the link below to verify your email address:\n{verify_url}\n\n"
            "If you didn't create this account, you can safely ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )

class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            send_verification_email(user)

            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_api_view(request):
    try:
        profile = request.user.profile
    except Profile.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        user_serializer = UserSerializer(request.user)
        return Response({
            'user': user_serializer.data,
            'profile': serializer.data
        })
    
    elif request.method == 'PUT':
        user_data = request.data.get('user', {})
        profile_data = request.data.get('profile', {})
        
        user_serializer = UserSerializer(request.user, data=user_data, partial=True)
        profile_serializer = ProfileSerializer(profile, data=profile_data, partial=True)
        
        if user_serializer.is_valid() and profile_serializer.is_valid():
            user_serializer.save()
            profile_serializer.save()
            return Response({
                'user': user_serializer.data,
                'profile': profile_serializer.data
            })
        
        errors = {}
        if not user_serializer.is_valid():
            errors.update(user_serializer.errors)
        if not profile_serializer.is_valid():
            errors.update(profile_serializer.errors)
            
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    
    # Get current and new password from request
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    # Check if current password is correct
    if not user.check_password(current_password):
        return Response({'detail': 'Current password is incorrect'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    # Set new password
    user.set_password(new_password)
    user.save()
    
    # Update token after password change
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'detail': 'Password changed successfully',
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({'detail': 'Successfully logged out'},
                        status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)},
                        status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Send a password-reset link to the given email if an account exists.
    Always returns 200 with a generic message regardless of whether the
    email is registered, so this endpoint can't be used to enumerate accounts.
    """
    email = request.data.get('email', '').strip()
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    generic_response = Response(
        {'detail': 'If an account with that email exists, a password reset link has been sent.'},
        status=status.HTTP_200_OK,
    )

    user = User.objects.filter(email__iexact=email).first()
    if not user:
        return generic_response

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

    send_mail(
        subject='Reset your CareerCoach AI password',
        message=(
            f"Hi {user.username},\n\n"
            f"Click the link below to reset your CareerCoach AI password:\n{reset_url}\n\n"
            "If you didn't request this, you can safely ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )

    return generic_response

@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """Validate the uid/token pair from the reset link and set a new password."""
    uidb64 = request.data.get('uid', '')
    token = request.data.get('token', '')
    new_password = request.data.get('new_password', '')

    if not uidb64 or not token or not new_password:
        return Response({'error': 'uid, token, and new_password are all required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({'error': 'This reset link is invalid.'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'This reset link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new_password, user=user)
    except DjangoValidationError as e:
        return Response({'error': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({'detail': 'Your password has been reset. You can now log in.'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_data(request):
    """
    GDPR-style full data export: every record tied to the authenticated
    account, as a single downloadable JSON file. Account deletion already
    permanently removes this same data (see delete_account below) — this is
    the "take a copy first" counterpart to that.
    """
    from django.http import JsonResponse
    from django.core.serializers.json import DjangoJSONEncoder
    from resume_api.models import (
        Resume, JobDescription, ResumeAnalysis, MockInterview,
        ChatMessage, BookmarkedAnswer, UserActivity, Notification,
    )

    user = request.user
    data = {
        'exported_at': timezone.now().isoformat(),
        'user': {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined.isoformat(),
        },
        'profile': ProfileSerializer(user.profile).data,
        'resumes': list(Resume.objects.filter(user=user).values()),
        'job_descriptions': list(JobDescription.objects.filter(user=user).values()),
        'resume_analyses': list(ResumeAnalysis.objects.filter(user=user).values()),
        'mock_interviews': list(MockInterview.objects.filter(user=user).values()),
        'chat_messages': list(ChatMessage.objects.filter(user=user).values()),
        'bookmarked_answers': list(BookmarkedAnswer.objects.filter(user=user).values()),
        'activity_log': list(UserActivity.objects.filter(user=user).values()),
        'notifications': list(Notification.objects.filter(user=user).values()),
    }

    response = JsonResponse(data, encoder=DjangoJSONEncoder, json_dumps_params={'indent': 2})
    response['Content-Disposition'] = f'attachment; filename="careercoach-ai-export-{user.username}.json"'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Permanently delete the authenticated user's account and everything tied
    to it (resumes, analyses, mock interviews, chat history, activity log —
    all CASCADE from the User FK). Requires the current password as
    confirmation since this can't be undone.
    """
    password = request.data.get('password', '')
    if not request.user.check_password(password):
        return Response({'error': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.delete()
    return Response({'detail': 'Your account has been permanently deleted.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """Confirm the uid/token pair from a verification email and mark the account verified."""
    uidb64 = request.data.get('uid', '')
    token = request.data.get('token', '')

    if not uidb64 or not token:
        return Response({'error': 'uid and token are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({'error': 'This verification link is invalid.'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'This verification link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

    user.profile.email_verified = True
    user.profile.save()

    return Response({'detail': 'Your email has been verified.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_email(request):
    """Let a logged-in user with an unverified email request a fresh link."""
    if request.user.profile.email_verified:
        return Response({'detail': 'Your email is already verified.'}, status=status.HTTP_200_OK)

    send_verification_email(request.user)
    return Response({'detail': 'Verification email sent.'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sessions(request):
    """
    List the user's active login sessions (outstanding, non-blacklisted,
    non-expired refresh tokens). There's no per-device fingerprint captured
    at login, so sessions are identified by when they were created rather
    than by device/browser.
    """
    from django.utils import timezone
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

    blacklisted_ids = BlacklistedToken.objects.values_list('token_id', flat=True)
    sessions = (
        OutstandingToken.objects.filter(user=request.user, expires_at__gt=timezone.now())
        .exclude(id__in=blacklisted_ids)
        .order_by('-created_at')
    )
    return Response([
        {'id': s.id, 'created_at': s.created_at, 'expires_at': s.expires_at}
        for s in sessions
    ])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_session(request):
    """Revoke a single session (blacklists that refresh token so it can no longer be used to get new access tokens)."""
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

    session_id = request.data.get('id')
    try:
        token = OutstandingToken.objects.get(id=session_id, user=request.user)
    except OutstandingToken.DoesNotExist:
        return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

    BlacklistedToken.objects.get_or_create(token=token)
    return Response({'detail': 'Session revoked.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_all_sessions(request):
    """Log the user out everywhere by blacklisting every outstanding refresh token."""
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

    tokens = OutstandingToken.objects.filter(user=request.user)
    for token in tokens:
        BlacklistedToken.objects.get_or_create(token=token)

    return Response({'detail': 'All sessions revoked. You will need to log in again on other devices.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_portfolio(request, slug):
    """
    Read-only public portfolio page: bio, job title, skills, career goal, and
    a couple of headline stats (mock interview count, best resume match
    score). Only served when the owner explicitly opted in via
    profile.portfolio_public — otherwise 404 regardless of whether the slug
    exists, so it can't be used to enumerate accounts.
    """
    from resume_api.models import MockInterview, ResumeAnalysis

    try:
        profile = Profile.objects.select_related('user').get(portfolio_slug__iexact=slug, portfolio_public=True)
    except Profile.DoesNotExist:
        return Response({'error': 'Portfolio not found.'}, status=status.HTTP_404_NOT_FOUND)

    user = profile.user
    best_match = ResumeAnalysis.objects.filter(user=user).order_by('-match_score').values_list('match_score', flat=True).first()

    return Response({
        'display_name': (f"{user.first_name} {user.last_name}".strip() or user.username),
        'bio': profile.bio,
        'job_title': profile.job_title,
        'target_role': profile.target_role,
        'career_goal': profile.career_goal,
        'location': profile.location,
        'skills': [s.strip() for s in profile.skills.split(',') if s.strip()],
        'stats': {
            'mock_interviews_completed': MockInterview.objects.filter(user=user).count(),
            'best_resume_match_score': best_match,
        },
    }, status=status.HTTP_200_OK)
