from django.utils import timezone
from rest_framework import serializers

from .models import Category, RecurrenceType, Task, TaskStatus


ALLOWED_STATUS_TRANSITIONS = {
    TaskStatus.TODO: {TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.ARCHIVED},
    TaskStatus.IN_PROGRESS: {TaskStatus.DONE, TaskStatus.ARCHIVED},
    TaskStatus.DONE: {TaskStatus.ARCHIVED},
    TaskStatus.ARCHIVED: set(),
}


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "color", "icon", "created_at"]
        read_only_fields = ["id", "created_at"]


class TaskListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "due_date",
            "priority",
            "status",
            "category",
            "category_name",
            "parent",
            "completed_at",
            "updated_at",
        ]
        read_only_fields = ["id", "completed_at", "updated_at"]


class TaskDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "due_date",
            "priority",
            "status",
            "category",
            "category_name",
            "parent",
            "recurrence_type",
            "recurrence_interval",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "completed_at", "created_at", "updated_at"]

    def _require_owned_relation(self, relation, field_name):
        request = self.context.get("request")
        if relation and request and relation.user_id != request.user.id:
            raise serializers.ValidationError(
                {field_name: "This object does not belong to the authenticated user."}
            )

    def validate(self, attrs):
        request = self.context.get("request")
        instance = self.instance

        category = attrs.get("category")
        if category is not None:
            self._require_owned_relation(category, "category")

        parent = attrs.get("parent")
        if parent is not None:
            self._require_owned_relation(parent, "parent")
            if parent.parent_id is not None:
                raise serializers.ValidationError(
                    {"parent": "Only one level of subtasks is allowed."}
                )
            if instance and parent.id == instance.id:
                raise serializers.ValidationError(
                    {"parent": "Task cannot be parent of itself."}
                )

        recurrence_type = attrs.get(
            "recurrence_type",
            instance.recurrence_type if instance else RecurrenceType.NONE,
        )
        recurrence_interval = attrs.get(
            "recurrence_interval",
            instance.recurrence_interval if instance else None,
        )

        if recurrence_type == RecurrenceType.NONE and recurrence_interval:
            raise serializers.ValidationError(
                {"recurrence_interval": "Must be empty when recurrence_type is NONE."}
            )

        if recurrence_type != RecurrenceType.NONE and not recurrence_interval:
            raise serializers.ValidationError(
                {"recurrence_interval": "Required when recurrence_type is not NONE."}
            )

        if instance and "status" in attrs:
            old_status = instance.status
            new_status = attrs["status"]
            if new_status != old_status and new_status not in ALLOWED_STATUS_TRANSITIONS[old_status]:
                raise serializers.ValidationError(
                    {
                        "status": (
                            f"Invalid transition from {old_status} to {new_status}."
                        )
                    }
                )

        if request and parent and parent.user_id != request.user.id:
            raise serializers.ValidationError({"parent": "Parent must belong to current user."})

        return attrs

    def create(self, validated_data):
        if validated_data.get("status") == TaskStatus.DONE:
            validated_data["completed_at"] = timezone.now()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "status" in validated_data:
            if validated_data["status"] == TaskStatus.DONE:
                validated_data["completed_at"] = timezone.now()
            elif instance.status == TaskStatus.DONE and validated_data["status"] != TaskStatus.DONE:
                validated_data["completed_at"] = None
        return super().update(instance, validated_data)
