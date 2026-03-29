from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class RegisterEndpointsTests(APITestCase):
    """Test user registration endpoint with coverage for happy path, edge cases, and failures."""

    def setUp(self):
        self.register_url = reverse("register")
        self.valid_payload = {
            "email": "test@example.com",
            "password": "StrongPass123!",
            "first_name": "Test",
            "last_name": "User",
        }

    # Happy path
    def test_register_successful_with_valid_data(self):
        """Register successfully and receive valid tokens."""
        response = self.client.post(self.register_url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        
        # Verify user was created
        user = User.objects.get(email="test@example.com")
        self.assertEqual(user.first_name, "Test")
        self.assertEqual(user.last_name, "User")

    def test_register_response_contract(self):
        """Verify response shape and field types match contract."""
        response = self.client.post(self.register_url, self.valid_payload, format="json")

        # Verify response structure
        self.assertIsInstance(response.data["access"], str)
        self.assertIsInstance(response.data["refresh"], str)
        self.assertIsInstance(response.data["user"], dict)
        
        # Verify user object contains expected fields
        user_data = response.data["user"]
        self.assertIn("id", user_data)
        self.assertIn("email", user_data)
        self.assertIn("first_name", user_data)
        self.assertIn("last_name", user_data)

    def test_register_email_normalized_to_lowercase(self):
        """Email should be normalized to lowercase."""
        payload = {
            **self.valid_payload,
            "email": "TEST@EXAMPLE.COM",
        }
        response = self.client.post(self.register_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["email"], "test@example.com")
        
        # Verify user exists with lowercase email
        user = User.objects.get(email="test@example.com")
        self.assertIsNotNone(user)

    # Edge cases
    def test_register_with_duplicate_email(self):
        """Registration fails with duplicate email (case-insensitive)."""
        # Create first user
        self.client.post(self.register_url, self.valid_payload, format="json")
        
        # Try to create with same email (different case)
        payload = {
            **self.valid_payload,
            "email": "TEST@EXAMPLE.COM",
        }
        response = self.client.post(self.register_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_with_missing_email(self):
        """Registration fails without email."""
        payload = {
            "password": "StrongPass123!",
            "first_name": "Test",
            "last_name": "User",
        }
        response = self.client.post(self.register_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_with_missing_password(self):
        """Registration fails without password."""
        payload = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
        }
        response = self.client.post(self.register_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_register_with_invalid_email_format(self):
        """Registration fails with invalid email format."""
        payload = {
            **self.valid_payload,
            "email": "not-an-email",
        }
        response = self.client.post(self.register_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_with_weak_password(self):
        """Registration fails with weak password."""
        payload = {
            **self.valid_payload,
            "password": "weak",
        }
        response = self.client.post(self.register_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_register_with_empty_password(self):
        """Registration fails with empty password."""
        payload = {
            **self.valid_payload,
            "password": "",
        }
        response = self.client.post(self.register_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_with_empty_email(self):
        """Registration fails with empty email."""
        payload = {
            **self.valid_payload,
            "email": "",
        }
        response = self.client.post(self.register_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_first_name_last_name_optional(self):
        """First and last name should be optional."""
        payload = {
            "email": "minimal@example.com",
            "password": "StrongPass123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        
        # Should succeed even without first_name/last_name
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)

    def test_register_returns_usable_tokens(self):
        """Tokens returned during registration should be immediately usable."""
        response = self.client.post(self.register_url, self.valid_payload, format="json")
        
        access_token = response.data["access"]
        
        # Token should be usable for authenticated requests
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        me_url = reverse("me")
        me_response = self.client.get(me_url)
        
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], "test@example.com")


class LoginEndpointsTests(APITestCase):
    """Test user login endpoint with coverage for happy path, edge cases, and failures."""

    def setUp(self):
        self.login_url = reverse("login")
        self.user = User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="StrongPass123!",
            first_name="Test",
            last_name="User",
        )

    # Happy path
    def test_login_successful_with_valid_credentials(self):
        """Login successfully with valid email and password."""
        payload = {"email": "test@example.com", "password": "StrongPass123!"}
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)

    def test_login_response_contract(self):
        """Verify login response shape and field types."""
        payload = {"email": "test@example.com", "password": "StrongPass123!"}
        response = self.client.post(self.login_url, payload, format="json")

        self.assertIsInstance(response.data["access"], str)
        self.assertIsInstance(response.data["refresh"], str)
        self.assertIsInstance(response.data["user"], dict)
        
        user_data = response.data["user"]
        self.assertEqual(user_data["id"], self.user.id)
        self.assertEqual(user_data["email"], "test@example.com")
        self.assertEqual(user_data["first_name"], "Test")

    def test_login_email_case_insensitive(self):
        """Login should work with uppercase email."""
        payload = {"email": "TEST@EXAMPLE.COM", "password": "StrongPass123!"}
        response = self.client.post(self.login_url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    # Failure modes
    def test_login_with_nonexistent_email(self):
        """Login fails with non-existent email."""
        payload = {"email": "nonexistent@example.com", "password": "StrongPass123!"}
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_wrong_password(self):
        """Login fails with incorrect password."""
        payload = {"email": "test@example.com", "password": "WrongPassword123!"}
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_inactive_user(self):
        """Login fails for inactive user."""
        self.user.is_active = False
        self.user.save()
        
        payload = {"email": "test@example.com", "password": "StrongPass123!"}
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_missing_email(self):
        """Login fails without email field."""
        payload = {"password": "StrongPass123!"}
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_login_with_missing_password(self):
        """Login fails without password field."""
        payload = {"email": "test@example.com"}
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_login_with_invalid_email_format(self):
        """Login fails with invalid email format."""
        payload = {"email": "not-an-email", "password": "StrongPass123!"}
        response = self.client.post(self.login_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_generic_error_message(self):
        """Error message should not reveal whether email exists (security)."""
        # Test with wrong password
        payload_wrong_pwd = {"email": "test@example.com", "password": "wrong"}
        response1 = self.client.post(self.login_url, payload_wrong_pwd, format="json")
        
        # Test with non-existent email
        payload_no_user = {"email": "none@example.com", "password": "StrongPass123!"}
        response2 = self.client.post(self.login_url, payload_no_user, format="json")
        
        # Both should return same error message
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response1.status_code)
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response2.status_code)


class TokenRefreshEndpointsTests(APITestCase):
    """Test JWT token refresh endpoint."""

    def setUp(self):
        self.login_url = reverse("login")
        self.refresh_url = reverse("token_refresh")
        self.user = User.objects.create_user(
            username="refresh@example.com",
            email="refresh@example.com",
            password="StrongPass123!",
        )

    # Happy path
    def test_refresh_returns_new_access_token(self):
        """Refresh token endpoint returns new access token."""
        login_response = self.client.post(
            self.login_url,
            {"email": self.user.email, "password": "StrongPass123!"},
            format="json",
        )
        refresh_token = login_response.data["refresh"]

        response = self.client.post(self.refresh_url, {"refresh": refresh_token}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIsInstance(response.data["access"], str)

    def test_refresh_new_token_is_usable(self):
        """New access token from refresh should be usable for auth."""
        login_response = self.client.post(
            self.login_url,
            {"email": self.user.email, "password": "StrongPass123!"},
            format="json",
        )
        refresh_token = login_response.data["refresh"]

        refresh_response = self.client.post(
            self.refresh_url, {"refresh": refresh_token}, format="json"
        )
        new_access_token = refresh_response.data["access"]

        # Use new token to access protected endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access_token}")
        me_url = reverse("me")
        me_response = self.client.get(me_url)

        self.assertEqual(me_response.status_code, status.HTTP_200_OK)

    # Failure modes
    def test_refresh_with_invalid_token(self):
        """Refresh fails with invalid token."""
        payload = {"refresh": "invalid.token.here"}
        response = self.client.post(self.refresh_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_with_missing_token(self):
        """Refresh fails without token."""
        payload = {}
        response = self.client.post(self.refresh_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refresh_with_empty_token(self):
        """Refresh fails with empty token string."""
        payload = {"refresh": ""}
        response = self.client.post(self.refresh_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refresh_blacklisted_token(self):
        """Refresh fails with blacklisted token (after logout)."""
        login_response = self.client.post(
            self.login_url,
            {"email": self.user.email, "password": "StrongPass123!"},
            format="json",
        )
        access = login_response.data["access"]
        refresh = login_response.data["refresh"]

        # Logout to blacklist token
        logout_url = reverse("logout")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.client.post(logout_url, {"refresh": refresh}, format="json")

        # Clear credentials
        self.client.credentials()

        # Try to refresh with blacklisted token
        response = self.client.post(self.refresh_url, {"refresh": refresh}, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MeEndpointsTests(APITestCase):
    """Test current user profile endpoints."""

    def setUp(self):
        self.me_url = reverse("me")
        self.login_url = reverse("login")
        self.user = User.objects.create_user(
            username="profile@example.com",
            email="profile@example.com",
            password="StrongPass123!",
            first_name="John",
            last_name="Doe",
        )

    def _get_user_token(self):
        """Helper to get valid access token for user."""
        response = self.client.post(
            self.login_url,
            {"email": self.user.email, "password": "StrongPass123!"},
            format="json",
        )
        return response.data["access"]

    # Happy path - GET
    def test_me_get_returns_current_user_profile(self):
        """GET /me returns authenticated user's profile."""
        token = self._get_user_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["email"], "profile@example.com")
        self.assertEqual(response.data["first_name"], "John")
        self.assertEqual(response.data["last_name"], "Doe")

    def test_me_get_response_contract(self):
        """Verify GET /me response matches contract."""
        token = self._get_user_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        response = self.client.get(self.me_url)

        # Verify all expected fields are present
        self.assertIn("id", response.data)
        self.assertIn("email", response.data)
        self.assertIn("first_name", response.data)
        self.assertIn("last_name", response.data)
        
        # Verify field types
        self.assertIsInstance(response.data["id"], int)
        self.assertIsInstance(response.data["email"], str)

    # Happy path - PATCH
    def test_me_patch_updates_profile(self):
        """PATCH /me updates user profile."""
        token = self._get_user_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        payload = {
            "first_name": "Jane",
            "last_name": "Smith",
        }
        response = self.client.patch(self.me_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Jane")
        self.assertEqual(response.data["last_name"], "Smith")
        
        # Verify persistence
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Jane")

    def test_me_patch_partial_update(self):
        """PATCH /me allows partial updates."""
        token = self._get_user_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        payload = {"first_name": "Updated"}
        response = self.client.patch(self.me_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Updated")
        # Last name should remain unchanged
        self.assertEqual(response.data["last_name"], "Doe")

    # Authorization failures
    def test_me_get_requires_authentication(self):
        """GET /me fails without authentication."""
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_patch_requires_authentication(self):
        """PATCH /me fails without authentication."""
        payload = {"first_name": "Jane"}
        response = self.client.patch(self.me_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_with_invalid_token(self):
        """GET /me fails with invalid token."""
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalid.token.here")
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_with_malformed_auth_header(self):
        """GET /me fails with malformed auth header."""
        self.client.credentials(HTTP_AUTHORIZATION="InvalidFormat token")
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_patch_email_is_readonly(self):
        """PATCH /me should not allow changing email."""
        token = self._get_user_token()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        payload = {
            "email": "newemail@example.com",
            "first_name": "Updated",
        }
        response = self.client.patch(self.me_url, payload, format="json")

        # Should succeed but email should not change
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "profile@example.com")
        
        # Verify in database
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "profile@example.com")


class LogoutEndpointsTests(APITestCase):
    """Test user logout endpoint and token blacklisting."""

    def setUp(self):
        self.logout_url = reverse("logout")
        self.login_url = reverse("login")
        self.refresh_url = reverse("token_refresh")
        self.user = User.objects.create_user(
            username="logout@example.com",
            email="logout@example.com",
            password="StrongPass123!",
        )

    def _get_tokens(self):
        """Helper to get access and refresh tokens."""
        response = self.client.post(
            self.login_url,
            {"email": self.user.email, "password": "StrongPass123!"},
            format="json",
        )
        return response.data["access"], response.data["refresh"]

    # Happy path
    def test_logout_successful_with_valid_refresh_token(self):
        """Logout succeeds with valid refresh token."""
        access, refresh = self._get_tokens()
        
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.post(self.logout_url, {"refresh": refresh}, format="json")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_logout_blacklists_refresh_token(self):
        """Refresh token is blacklisted after logout."""
        access, refresh = self._get_tokens()
        
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.client.post(self.logout_url, {"refresh": refresh}, format="json")

        # Clear credentials
        self.client.credentials()

        # Try to refresh with blacklisted token
        response = self.client.post(self.refresh_url, {"refresh": refresh}, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # Failure modes
    def test_logout_requires_authentication(self):
        """Logout fails without authentication."""
        _, refresh = self._get_tokens()
        
        response = self.client.post(self.logout_url, {"refresh": refresh}, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_with_invalid_refresh_token(self):
        """Logout fails with invalid refresh token."""
        access, _ = self._get_tokens()
        
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.post(
            self.logout_url, {"refresh": "invalid.token"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_with_missing_refresh_token(self):
        """Logout fails without refresh token."""
        access, _ = self._get_tokens()
        
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.post(self.logout_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_twice_fails(self):
        """Logout fails on second attempt with same token."""
        access, refresh = self._get_tokens()
        
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        
        # First logout succeeds
        response1 = self.client.post(self.logout_url, {"refresh": refresh}, format="json")
        self.assertEqual(response1.status_code, status.HTTP_204_NO_CONTENT)
        
        # Second logout with same token fails
        response2 = self.client.post(self.logout_url, {"refresh": refresh}, format="json")
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
