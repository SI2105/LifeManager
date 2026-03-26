from rest_framework import serializers
from apps.documents.models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id', 'file', 'original_filename', 'file_type', 'file_size',
            'tags', 'description', 'upload_date', 'updated_at'
        ]
        read_only_fields = ['id', 'upload_date', 'updated_at']
    
    def create(self, validated_data):
        file_obj = validated_data.get('file')
        document = Document(**validated_data)
        document.file_size = file_obj.size if file_obj else 0
        document.save()
        return document
