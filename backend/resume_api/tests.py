from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import UserActivity


class HealthCheckTests(APITestCase):
    def test_health_check_ok(self):
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {'status': 'ok'})


class UserActivityIsolationTests(APITestCase):
    """Regression test: dashboard activity must be scoped per-account, not
    shared across every user on the same device/browser."""

    def setUp(self):
        self.user_a = User.objects.create_user(username='alice', password='TestPass123!')
        self.user_b = User.objects.create_user(username='bob', password='TestPass123!')
        UserActivity.objects.create(user=self.user_a, activity_type='resume', description='Alice resume')
        UserActivity.objects.create(user=self.user_b, activity_type='interview', description='Bob interview')

    def test_unauthenticated_request_gets_no_activity(self):
        response = self.client.get('/api/resume/activity/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_only_sees_their_own_activity(self):
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/resume/activity/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json()['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['description'], 'Alice resume')

    def test_creating_activity_assigns_the_authenticated_user(self):
        self.client.force_authenticate(user=self.user_b)
        response = self.client.post(
            '/api/resume/activity/',
            {'activity_type': 'chatbot', 'description': 'Bob chat session'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = UserActivity.objects.get(id=response.json()['id'])
        self.assertEqual(created.user, self.user_b)


class UploadValidationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='uploader', password='TestPass123!')
        self.client.force_authenticate(user=self.user)

    def test_analyze_rejects_disallowed_file_extension(self):
        from django.core.files.uploadedfile import SimpleUploadedFile

        resume_file = SimpleUploadedFile('resume.exe', b'not a real document', content_type='application/octet-stream')
        job_desc_file = SimpleUploadedFile('jd.txt', b'a real job description', content_type='text/plain')
        response = self.client.post(
            '/api/resume/analyze/',
            {'resume_file': resume_file, 'job_desc_file': job_desc_file},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('unsupported file type', response.json()['error'])
