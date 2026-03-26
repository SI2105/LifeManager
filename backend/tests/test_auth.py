import pytest
from django.contrib.auth.models import User


@pytest.mark.django_db
class TestAuthAPI:
    def test_user_registration(self, api_client):
        response = api_client.post(
            '/api/auth/register/',
            {
                'username': 'newuser',
                'email': 'newuser@example.com',
                'password': 'testpass123!',
                'password_confirm': 'testpass123!'
            },
            format='json'
        )
        assert response.status_code == 201
        assert response.data['username'] == 'newuser'
        assert User.objects.filter(username='newuser').exists()
    
    def test_user_login(self, api_client):
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        response = api_client.post(
            '/api/auth/token/',
            {
                'username': 'testuser',
                'password': 'testpass123'
            },
            format='json'
        )
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_get_current_user(self, authenticated_client, user):
        response = authenticated_client.get('/api/auth/users/me/')
        assert response.status_code == 200
        assert response.data['username'] == user.username
        assert response.data['email'] == user.email
