from django.contrib.auth.models import User
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
