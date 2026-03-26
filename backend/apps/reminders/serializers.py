from rest_framework import serializers
from apps.reminders.models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = [
            'id', 'title', 'description', 'reminder_date', 'trigger_time',
            'is_sent', 'associated_task', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
