from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import date
from apps.reminders.models import Reminder
from apps.reminders.serializers import ReminderSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'description']
    filterset_fields = ['is_sent', 'reminder_date']
    ordering_fields = ['reminder_date', 'trigger_time']
    ordering = ['reminder_date', 'trigger_time']
    
    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming reminders (not sent, future dates)"""
        reminders = self.get_queryset().filter(
            is_sent=False,
            reminder_date__gte=date.today()
        ).order_by('reminder_date', 'trigger_time')[:10]
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_sent(self, request, pk=None):
        reminder = self.get_object()
        reminder.is_sent = True
        reminder.save()
        serializer = self.get_serializer(reminder)
        return Response(serializer.data)
