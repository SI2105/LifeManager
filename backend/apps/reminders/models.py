from django.db import models
from django.contrib.auth.models import User


class Reminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    reminder_date = models.DateField()
    trigger_time = models.TimeField()  # Time of day to send reminder
    is_sent = models.BooleanField(default=False)
    associated_task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reminders'
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['reminder_date', 'trigger_time']
        indexes = [
            models.Index(fields=['user', 'reminder_date']),
            models.Index(fields=['user', 'is_sent']),
        ]
    
    def __str__(self):
        return self.title
