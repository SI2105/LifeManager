from datetime import datetime, time

from django.utils.dateparse import parse_date, parse_datetime
from django.utils import timezone
from rest_framework import mixins, permissions, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Category, Task
from .serializers import CategorySerializer, TaskDetailSerializer, TaskListSerializer


class CategoryViewSet(
	mixins.ListModelMixin,
	mixins.CreateModelMixin,
	mixins.DestroyModelMixin,
	viewsets.GenericViewSet,
):
	queryset = Category.objects.all()
	serializer_class = CategorySerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		if getattr(self, "swagger_fake_view", False):
			return Category.objects.none()
		return Category.objects.filter(user=self.request.user)

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
	queryset = Task.objects.all()
	permission_classes = [permissions.IsAuthenticated]
	filter_backends = [SearchFilter, OrderingFilter]
	search_fields = ["title", "description"]
	ordering_fields = ["due_date", "priority", "created_at", "updated_at"]
	ordering = ["-updated_at"]

	@staticmethod
	def _parse_filter_datetime(raw_value, end_of_day=False):
		parsed_date = parse_date(raw_value)
		# Treat plain dates as day boundaries for range filters.
		if parsed_date and len(raw_value) <= 10:
			combined = datetime.combine(parsed_date, time.max if end_of_day else time.min)
			return timezone.make_aware(combined, timezone.get_current_timezone())

		parsed = parse_datetime(raw_value)
		if parsed:
			if timezone.is_naive(parsed):
				return timezone.make_aware(parsed, timezone.get_current_timezone())
			return parsed

		if not parsed_date:
			return None

		combined = datetime.combine(parsed_date, time.max if end_of_day else time.min)
		return timezone.make_aware(combined, timezone.get_current_timezone())

	def get_queryset(self):
		if getattr(self, "swagger_fake_view", False):
			return Task.objects.none()

		queryset = (
			Task.objects.select_related("category", "parent")
			.filter(user=self.request.user)
			.order_by("-updated_at")
		)
		params = self.request.query_params

		status_value = params.get("status")
		if status_value:
			queryset = queryset.filter(status=status_value)

		priority_value = params.get("priority")
		if priority_value:
			queryset = queryset.filter(priority=priority_value)

		category_value = params.get("category")
		if category_value:
			queryset = queryset.filter(category_id=category_value)

		due_from = params.get("due_date_from")
		if due_from:
			parsed = self._parse_filter_datetime(due_from)
			if parsed:
				queryset = queryset.filter(due_date__gte=parsed)

		due_to = params.get("due_date_to")
		if due_to:
			parsed = self._parse_filter_datetime(due_to, end_of_day=True)
			if parsed:
				queryset = queryset.filter(due_date__lte=parsed)

		return queryset

	def get_serializer_class(self):
		if self.action == "list":
			return TaskListSerializer
		return TaskDetailSerializer

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)
