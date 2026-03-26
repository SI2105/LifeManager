from rest_framework import serializers
from apps.tasks.models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'due_date', 'priority',
            'category', 'is_completed', 'recurrence_rule', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskDetailSerializer(TaskSerializer):
    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields
