from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Category",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("color", models.CharField(blank=True, max_length=20)),
                ("icon", models.CharField(blank=True, max_length=64)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="categories",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="Task",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("due_date", models.DateTimeField(blank=True, null=True)),
                (
                    "priority",
                    models.CharField(
                        choices=[("LOW", "Low"), ("MEDIUM", "Medium"), ("HIGH", "High")],
                        default="MEDIUM",
                        max_length=20,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("TODO", "To Do"),
                            ("IN_PROGRESS", "In Progress"),
                            ("DONE", "Done"),
                            ("ARCHIVED", "Archived"),
                        ],
                        default="TODO",
                        max_length=20,
                    ),
                ),
                (
                    "recurrence_type",
                    models.CharField(
                        choices=[
                            ("NONE", "None"),
                            ("DAILY", "Daily"),
                            ("WEEKLY", "Weekly"),
                            ("MONTHLY", "Monthly"),
                        ],
                        default="NONE",
                        max_length=20,
                    ),
                ),
                ("recurrence_interval", models.PositiveIntegerField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "category",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="tasks",
                        to="tasks.category",
                    ),
                ),
                (
                    "parent",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="subtasks",
                        to="tasks.task",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="tasks",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-updated_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="category",
            constraint=models.UniqueConstraint(fields=("user", "name"), name="unique_category_name_per_user"),
        ),
        migrations.AddIndex(
            model_name="category",
            index=models.Index(fields=["user", "name"], name="tasks_categ_user_id_0b4f8c_idx"),
        ),
        migrations.AddIndex(
            model_name="task",
            index=models.Index(fields=["user", "status"], name="tasks_task_user_id_8ffd9e_idx"),
        ),
        migrations.AddIndex(
            model_name="task",
            index=models.Index(fields=["user", "due_date"], name="tasks_task_user_id_d4424d_idx"),
        ),
        migrations.AddIndex(
            model_name="task",
            index=models.Index(fields=["user", "updated_at"], name="tasks_task_user_id_4fbca6_idx"),
        ),
    ]
