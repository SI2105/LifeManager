"""
ASGI config for lifemanager project with WebSocket support.
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lifemanager.settings')

django_asgi_app = get_asgi_application()

# Import routing after Django setup
from apps.reminders.consumers import RemindersConsumer
from django.urls import re_path

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                re_path(r'ws/reminders/$', RemindersConsumer.as_asgi()),
            ])
        )
    ),
})
