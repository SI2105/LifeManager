import pytest
from django.contrib.auth.models import User
from apps.tasks.models import Task
from datetime import datetime, timezone


@pytest.mark.django_db
class TestTaskModel:
    def test_create_task(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        task = Task.objects.create(
            user=user,
            title='Test Task',
            description='Test Description',
            priority='high',
            category='Work'
        )
        assert task.title == 'Test Task'
        assert task.user == user
        assert task.is_completed is False
    
    def test_task_str(self):
        user = User.objects.create_user(username='testuser')
        task = Task.objects.create(user=user, title='Test Task')
        assert str(task) == 'Test Task'


@pytest.mark.django_db
class TestTaskAPI:
    def test_create_task_authenticated(self, authenticated_client, user):
        response = authenticated_client.post(
            '/api/tasks/',
            {
                'title': 'New Task',
                'description': 'Task description',
                'priority': 'high',
                'category': 'Work'
            },
            format='json'
        )
        assert response.status_code == 201
        assert response.data['title'] == 'New Task'
    
    def test_list_tasks_authenticated(self, authenticated_client, user):
        Task.objects.create(user=user, title='Task 1')
        Task.objects.create(user=user, title='Task 2')
        
        response = authenticated_client.get('/api/tasks/')
        assert response.status_code == 200
        assert len(response.data['results']) == 2
    
    def test_list_tasks_unauthenticated(self, api_client):
        response = api_client.get('/api/tasks/')
        assert response.status_code == 401
