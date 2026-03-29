from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthEndpointsTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.refresh_url = reverse("token_refresh")
        self.me_url = reverse("me")
        self.logout_url = reverse("logout")

    def test_register_returns_tokens(self):
        payload = {
            "email": "test@example.com",
            "password": "StrongPass123!",
            "first_name": "Test",
            "last_name": "User",
        }
        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "test@example.com")

    def test_login_returns_tokens(self):
        User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="StrongPass123!",
        )
        payload = {"email": "test@example.com", "password": "StrongPass123!"}
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_returns_access_token(self):
        user = User.objects.create_user(
            username="refresh@example.com",
            email="refresh@example.com",
            password="StrongPass123!",
        )
        login_response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "StrongPass123!"},
            format="json",
        )
        refresh = login_response.data["refresh"]

        response = self.client.post(self.refresh_url, {"refresh": refresh}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_me_requires_auth(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_refresh_token(self):
        user = User.objects.create_user(
            username="logout@example.com",
            email="logout@example.com",
            password="StrongPass123!",
        )

        login_response = self.client.post(
            self.login_url,
            {"email": user.email, "password": "StrongPass123!"},
            format="json",
        )
        access = login_response.data["access"]
        refresh = login_response.data["refresh"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        logout_response = self.client.post(
            self.logout_url,
            {"refresh": refresh},
            format="json",
        )

        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)

        refresh_response = self.client.post(
            self.refresh_url,
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
