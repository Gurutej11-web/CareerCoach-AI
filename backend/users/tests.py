from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APITestCase
from rest_framework import status


class RegistrationTests(APITestCase):
    """Regression test: optional profile fields (first_name, phone_number,
    etc.) previously rejected blank strings because the serializer set
    required=False without allow_blank=True, breaking signup for anyone who
    left them empty."""

    def _payload(self, **overrides):
        payload = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
            'first_name': '',
            'last_name': '',
            'phone_number': '',
            'job_title': '',
            'company': '',
        }
        payload.update(overrides)
        return payload

    def test_register_succeeds_with_blank_optional_fields(self):
        response = self.client.post('/users/api/register/', self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_rejects_mismatched_passwords(self):
        response = self.client.post(
            '/users/api/register/',
            self._payload(password_confirm='SomethingElse123!'),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(username='existing', email='newuser@example.com', password='pw')
        response = self.client.post('/users/api/register/', self._payload(username='different'), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='resetme', email='resetme@example.com', password='OldPass123!'
        )

    def test_request_reset_sends_email_for_existing_user(self):
        response = self.client.post('/users/api/password-reset/', {'email': 'resetme@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('reset-password', mail.outbox[0].body)

    def test_request_reset_is_indistinguishable_for_unknown_email(self):
        known = self.client.post('/users/api/password-reset/', {'email': 'resetme@example.com'}, format='json')
        unknown = self.client.post('/users/api/password-reset/', {'email': 'nobody@example.com'}, format='json')
        self.assertEqual(known.status_code, unknown.status_code)
        self.assertEqual(known.json(), unknown.json())
        # Only the real account should have actually triggered an email.
        self.assertEqual(len(mail.outbox), 1)

    def test_confirm_reset_changes_password_and_token_is_single_use(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            '/users/api/password-reset-confirm/',
            {'uid': uid, 'token': token, 'new_password': 'BrandNewPass456!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('BrandNewPass456!'))
        self.assertFalse(self.user.check_password('OldPass123!'))

        # The token was invalidated by the password change, so replaying it
        # (e.g. from a stale email link) must not work a second time.
        replay = self.client.post(
            '/users/api/password-reset-confirm/',
            {'uid': uid, 'token': token, 'new_password': 'AnotherPass789!'},
            format='json',
        )
        self.assertEqual(replay.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_reset_rejects_bad_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        response = self.client.post(
            '/users/api/password-reset-confirm/',
            {'uid': uid, 'token': 'not-a-real-token', 'new_password': 'BrandNewPass456!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DeleteAccountTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='todelete', password='CorrectPass123!')
        self.client.force_authenticate(user=self.user)

    def test_delete_requires_correct_password(self):
        response = self.client.post('/users/api/delete-account/', {'password': 'WrongPassword'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(username='todelete').exists())

    def test_delete_removes_the_account(self):
        response = self.client.post('/users/api/delete-account/', {'password': 'CorrectPass123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(User.objects.filter(username='todelete').exists())

    def test_delete_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/users/api/delete-account/', {'password': 'CorrectPass123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileGoalsTests(APITestCase):
    """Regression test: GET /users/api/profile/ previously 500'd for every
    user because settings.STORAGES defined "staticfiles" but no "default"
    entry, and ProfileSerializer.profile_picture (an ImageField) crashes
    resolving its .url without a default storage backend configured."""

    def setUp(self):
        self.user = User.objects.create_user(username='goalsetter', password='TestPass123!')
        self.client.force_authenticate(user=self.user)

    def test_get_profile_does_not_500(self):
        response = self.client.get('/users/api/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.json()['profile']['goal_target_score'])

    def test_can_set_and_persist_goals(self):
        response = self.client.put(
            '/users/api/profile/',
            {'profile': {'goal_target_score': 95, 'goal_target_interviews': 10}},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        refetched = self.client.get('/users/api/profile/')
        self.assertEqual(refetched.json()['profile']['goal_target_score'], 95)
        self.assertEqual(refetched.json()['profile']['goal_target_interviews'], 10)


class EmailVerificationTests(APITestCase):
    def test_registration_sends_a_verification_email(self):
        payload = {
            'username': 'verifyme',
            'email': 'verifyme@example.com',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
        }
        response = self.client.post('/users/api/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('verify-email', mail.outbox[0].body)

        user = User.objects.get(username='verifyme')
        self.assertFalse(user.profile.email_verified)

    def test_verify_email_marks_profile_verified(self):
        user = User.objects.create_user(username='toverify', password='TestPass123!')
        self.assertFalse(user.profile.email_verified)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        response = self.client.post('/users/api/verify-email/', {'uid': uid, 'token': token}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.profile.refresh_from_db()
        self.assertTrue(user.profile.email_verified)

    def test_verify_email_rejects_bad_token(self):
        user = User.objects.create_user(username='badtoken', password='TestPass123!')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        response = self.client.post('/users/api/verify-email/', {'uid': uid, 'token': 'garbage'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        user.profile.refresh_from_db()
        self.assertFalse(user.profile.email_verified)

    def test_resend_requires_authentication(self):
        response = self.client.post('/users/api/resend-verification/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_resend_sends_another_email_when_unverified(self):
        user = User.objects.create_user(username='resenduser', email='resenduser@example.com', password='TestPass123!')
        self.client.force_authenticate(user=user)
        response = self.client.post('/users/api/resend-verification/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

    def test_resend_is_a_noop_once_verified(self):
        user = User.objects.create_user(username='alreadyverified', password='TestPass123!')
        user.profile.email_verified = True
        user.profile.save()
        self.client.force_authenticate(user=user)
        response = self.client.post('/users/api/resend-verification/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)
