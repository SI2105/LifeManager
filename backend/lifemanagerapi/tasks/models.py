from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class TaskStatus(models.TextChoices):
	TODO = "TODO", "To Do"
	IN_PROGRESS = "IN_PROGRESS", "In Progress"
	DONE = "DONE", "Done"
	ARCHIVED = "ARCHIVED", "Archived"


class TaskPriority(models.TextChoices):
	LOW = "LOW", "Low"
	MEDIUM = "MEDIUM", "Medium"
	HIGH = "HIGH", "High"


class RecurrenceType(models.TextChoices):
	NONE = "NONE", "None"
	DAILY = "DAILY", "Daily"
	WEEKLY = "WEEKLY", "Weekly"
	MONTHLY = "MONTHLY", "Monthly"


class Category(models.Model):
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="categories",
	)
	name = models.CharField(max_length=120)
	color = models.CharField(max_length=20, blank=True)
	icon = models.CharField(max_length=64, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(
				fields=["user", "name"],
				name="unique_category_name_per_user",
			)
		]
		indexes = [
			models.Index(fields=["user", "name"]),
		]
		ordering = ["name"]

	def __str__(self):
		return self.name


class Task(models.Model):
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="tasks",
	)
	title = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	due_date = models.DateTimeField(null=True, blank=True)
	priority = models.CharField(
		max_length=20,
		choices=TaskPriority.choices,
		default=TaskPriority.MEDIUM, #MEDIUM default priority
	)
	status = models.CharField(
		max_length=20,
		choices=TaskStatus.choices,
		default=TaskStatus.TODO, #TODO default status
	)
	category = models.ForeignKey(
		Category,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="tasks",
	)
	parent = models.ForeignKey(
		"self",
		on_delete=models.CASCADE,
		null=True,
		blank=True,
		related_name="subtasks",
	)
	recurrence_type = models.CharField(
		max_length=20,
		choices=RecurrenceType.choices,
		default=RecurrenceType.NONE,
	)
	recurrence_interval = models.PositiveIntegerField(null=True, blank=True)
	completed_at = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		indexes = [
			models.Index(fields=["user", "status"]),
			models.Index(fields=["user", "due_date"]),
			models.Index(fields=["user", "updated_at"]),
		]
		ordering = ["-updated_at"]

	def clean(self):
		if self.parent:
			if self.parent_id == self.id:
				raise ValidationError("Task cannot be parent of itself.")
			if self.parent.user_id != self.user_id:
				raise ValidationError("Parent task must belong to the same user.")
			if self.parent.parent_id is not None:
				raise ValidationError("Only one level of subtasks is allowed.")

		if self.category and self.category.user_id != self.user_id:
			raise ValidationError("Category must belong to the same user.")

	def save(self, *args, **kwargs):
		self.full_clean()
		return super().save(*args, **kwargs)

	def __str__(self):
		return self.title
