from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.auth.views import register, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('register/', register, name='register'),
    path('', include(router.urls)),
]
