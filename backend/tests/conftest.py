import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Fixture to provide an API client"""
    return APIClient()


@pytest.fixture
def user(db):
    """Fixture to create a test user"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Fixture to provide an authenticated API client"""
    api_client.force_authenticate(user=user)
    return api_client
