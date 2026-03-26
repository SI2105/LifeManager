from django.db import models
from django.contrib.auth.models import User


class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)  # pdf, docx, jpeg, etc.
    file_size = models.BigIntegerField()  # Store in bytes
    tags = models.CharField(max_length=500, blank=True)  # Comma-separated tags
    description = models.TextField(blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-upload_date']
        indexes = [
            models.Index(fields=['user', '-upload_date']),
            models.Index(fields=['user', 'file_type']),
        ]
    
    def __str__(self):
        return self.original_filename
    
    @property
    def tags_list(self):
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
