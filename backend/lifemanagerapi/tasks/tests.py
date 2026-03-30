from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Task, TaskPriority, TaskStatus


User = get_user_model()


class TaskApiTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username="owner@example.com",
			email="owner@example.com",
			password="StrongPass123!",
		)
		self.other_user = User.objects.create_user(
			username="other@example.com",
			email="other@example.com",
			password="StrongPass123!",
		)
		self.client.force_authenticate(self.user)

		self.category = Category.objects.create(user=self.user, name="Work")
		self.other_category = Category.objects.create(user=self.other_user, name="Private")

	def test_create_task_success(self):
		url = reverse("task-list")
		payload = {
			"title": "Prepare report",
			"description": "Finish draft",
			"priority": TaskPriority.MEDIUM,
			"status": TaskStatus.TODO,
			"category": str(self.category.id),
		}
		response = self.client.post(url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Task.objects.count(), 1)
		self.assertEqual(Task.objects.first().user, self.user)

	def test_user_cannot_assign_foreign_category(self):
		url = reverse("task-list")
		payload = {
			"title": "Illegal task",
			"priority": TaskPriority.LOW,
			"status": TaskStatus.TODO,
			"category": str(self.other_category.id),
		}
		response = self.client.post(url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("category", response.data)

	def test_user_cannot_get_other_users_task(self):
		foreign_task = Task.objects.create(
			user=self.other_user,
			title="Other user's task",
			priority=TaskPriority.HIGH,
			status=TaskStatus.TODO,
		)
		url = reverse("task-detail", kwargs={"pk": foreign_task.id})
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

	def test_recurrence_requires_interval(self):
		url = reverse("task-list")
		payload = {
			"title": "Recurring",
			"status": TaskStatus.TODO,
			"priority": TaskPriority.MEDIUM,
			"recurrence_type": "DAILY",
		}

		response = self.client.post(url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("recurrence_interval", response.data)

	def test_done_to_todo_transition_is_blocked(self):
		task = Task.objects.create(
			user=self.user,
			title="Done task",
			status=TaskStatus.DONE,
			priority=TaskPriority.MEDIUM,
		)
		url = reverse("task-detail", kwargs={"pk": task.id})

		response = self.client.patch(url, {"status": TaskStatus.TODO}, format="json")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("status", response.data)

	def test_cannot_create_subtask_under_other_users_parent(self):
		foreign_parent = Task.objects.create(
			user=self.other_user,
			title="Foreign parent",
			status=TaskStatus.TODO,
			priority=TaskPriority.MEDIUM,
		)
		url = reverse("task-list")
		payload = {
			"title": "Bad subtask",
			"status": TaskStatus.TODO,
			"priority": TaskPriority.MEDIUM,
			"parent": str(foreign_parent.id),
		}

		response = self.client.post(url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("parent", response.data)

	def test_cannot_create_deep_subtask(self):
		parent = Task.objects.create(
			user=self.user,
			title="Parent",
			status=TaskStatus.TODO,
			priority=TaskPriority.MEDIUM,
		)
		child = Task.objects.create(
			user=self.user,
			title="Child",
			status=TaskStatus.TODO,
			priority=TaskPriority.MEDIUM,
			parent=parent,
		)
		url = reverse("task-list")
		payload = {
			"title": "Grandchild",
			"status": TaskStatus.TODO,
			"priority": TaskPriority.MEDIUM,
			"parent": str(child.id),
		}

		response = self.client.post(url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("parent", response.data)

	def test_filter_by_status_and_due_date_range(self):
		now = timezone.now()
		Task.objects.create(
			user=self.user,
			title="Included",
			status=TaskStatus.TODO,
			priority=TaskPriority.LOW,
			due_date=now,
		)
		Task.objects.create(
			user=self.user,
			title="Excluded status",
			status=TaskStatus.DONE,
			priority=TaskPriority.LOW,
			due_date=now,
		)
		Task.objects.create(
			user=self.user,
			title="Excluded due date",
			status=TaskStatus.TODO,
			priority=TaskPriority.LOW,
			due_date=now.replace(year=now.year + 1),
		)

		url = reverse("task-list")
		params = {
			"status": TaskStatus.TODO.value,
			"due_date_from": now.date().isoformat(),
			"due_date_to": now.date().isoformat(),
		}
		response = self.client.get(url, params)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["count"], 1)
		self.assertEqual(response.data["results"][0]["title"], "Included")

	def test_user_cannot_update_other_users_task(self):
		foreign_task = Task.objects.create(
			user=self.other_user,
			title="Other user's task",
			priority=TaskPriority.HIGH,
			status=TaskStatus.TODO,
		)
		url = reverse("task-detail", kwargs={"pk": foreign_task.id})

		response = self.client.patch(url, {"title": "Hacked"}, format="json")

		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

	def test_user_cannot_delete_other_users_task(self):
		foreign_task = Task.objects.create(
			user=self.other_user,
			title="Other user's task",
			priority=TaskPriority.HIGH,
			status=TaskStatus.TODO,
		)
		url = reverse("task-detail", kwargs={"pk": foreign_task.id})

		response = self.client.delete(url)

		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
		self.assertTrue(Task.objects.filter(id=foreign_task.id).exists())

	def test_search_and_ordering_work_for_task_list(self):
		Task.objects.create(
			user=self.user,
			title="Alpha task",
			description="Find me",
			status=TaskStatus.TODO,
			priority=TaskPriority.MEDIUM,
		)
		Task.objects.create(
			user=self.user,
			title="Zulu task",
			description="Other",
			status=TaskStatus.TODO,
			priority=TaskPriority.MEDIUM,
		)

		url = reverse("task-list")
		response = self.client.get(url, {"search": "find", "ordering": "title"})

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["count"], 1)
		self.assertEqual(response.data["results"][0]["title"], "Alpha task")

	def test_pagination_defaults_are_applied(self):
		for index in range(21):
			Task.objects.create(
				user=self.user,
				title=f"Task {index}",
				status=TaskStatus.TODO,
				priority=TaskPriority.MEDIUM,
			)

		url = reverse("task-list")
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["count"], 21)
		self.assertEqual(len(response.data["results"]), 20)
		self.assertIsNotNone(response.data["next"])

	def test_completed_status_sets_completed_at(self):
		url = reverse("task-list")
		payload = {
			"title": "Done on create",
			"status": TaskStatus.DONE,
			"priority": TaskPriority.MEDIUM,
		}
		response = self.client.post(url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertIsNotNone(response.data["completed_at"])

	def test_moving_from_done_clears_completed_at(self):
		task = Task.objects.create(
			user=self.user,
			title="Done task",
			status=TaskStatus.DONE,
			priority=TaskPriority.MEDIUM,
			completed_at=timezone.now(),
		)
		url = reverse("task-detail", kwargs={"pk": task.id})

		response = self.client.patch(url, {"status": TaskStatus.ARCHIVED}, format="json")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIsNone(response.data["completed_at"])


class CategoryApiTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username="catowner@example.com",
			email="catowner@example.com",
			password="StrongPass123!",
		)
		self.other_user = User.objects.create_user(
			username="catother@example.com",
			email="catother@example.com",
			password="StrongPass123!",
		)
		self.client.force_authenticate(self.user)

	def test_create_category_success(self):
		url = reverse("category-list")
		payload = {"name": "Personal", "color": "#22AA66", "icon": "leaf"}
		response = self.client.post(url, payload, format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Category.objects.filter(user=self.user).count(), 1)

	def test_category_list_is_owner_scoped(self):
		Category.objects.create(user=self.user, name="Mine")
		Category.objects.create(user=self.other_user, name="Theirs")

		url = reverse("category-list")
		response = self.client.get(url)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["count"], 1)
		self.assertEqual(len(response.data["results"]), 1)
		self.assertEqual(response.data["results"][0]["name"], "Mine")

	def test_category_delete_sets_task_category_to_null(self):
		category = Category.objects.create(user=self.user, name="ToDelete")
		task = Task.objects.create(
			user=self.user,
			title="Task with category",
			priority=TaskPriority.MEDIUM,
			status=TaskStatus.TODO,
			category=category,
		)

		url = reverse("category-detail", kwargs={"pk": category.id})
		response = self.client.delete(url)

		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		task.refresh_from_db()
		self.assertIsNone(task.category)

	def test_category_update_not_allowed(self):
		category = Category.objects.create(user=self.user, name="NoUpdate")
		url = reverse("category-detail", kwargs={"pk": category.id})

		response = self.client.patch(url, {"name": "Renamed"}, format="json")

		self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
