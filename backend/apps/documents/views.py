from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.documents.models import Document
from apps.documents.serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['original_filename', 'tags', 'description']
    filterset_fields = ['file_type']
    ordering_fields = ['upload_date', 'file_type']
    ordering = ['-upload_date']
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def file_types(self, request):
        """Get all unique file types"""
        file_types = self.get_queryset().values_list('file_type', flat=True).distinct()
        return Response({'file_types': list(file_types)})
    
    @action(detail=False, methods=['get'])
    def tags(self, request):
        """Get all unique tags"""
        docs = self.get_queryset()
        all_tags = set()
        for doc in docs:
            all_tags.update(doc.tags_list)
        return Response({'tags': sorted(list(all_tags))})
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download document file"""
        document = self.get_object()
        return Response({
            'download_url': document.file.url if document.file else None
        })
