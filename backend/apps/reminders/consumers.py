import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class RemindersConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.user_group_name = f'reminders_{self.user.id}'
        
        # Join user's reminder group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave user's reminder group
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
    
    async def reminder_trigger(self, event):
        """Receive message from group and send to WebSocket"""
        message = event['message']
        
        await self.send(text_data=json.dumps({
            'type': 'reminder_notification',
            'data': message
        }))
    
    async def receive(self, text_data):
        """Receive message from WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
