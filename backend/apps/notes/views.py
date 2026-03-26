from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.notes.models import Note
from apps.notes.serializers import NoteSerializer


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def tags(self, request):
        """Get all unique tags"""
        notes = self.get_queryset()
        all_tags = set()
        for note in notes:
            all_tags.update(note.tags_list)
        return Response({'tags': sorted(list(all_tags))})
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recently updated notes"""
        notes = self.get_queryset().order_by('-updated_at')[:5]
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)
