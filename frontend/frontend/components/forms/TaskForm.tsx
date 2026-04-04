/**
 * TaskForm Component
 * Create and edit task form
 */

"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { Task, TaskBase, TaskStatus } from "@/lib/api/types";
import { useTaskStore } from "@/store/taskStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useToast } from "@/components/common/Toast";
import { TextInput } from "@/components/inputs/TextInput";
import { TextArea } from "@/components/inputs/TextArea";
import { Select } from "@/components/inputs/Select";
import { DatePicker } from "@/components/inputs/DatePicker";
import { Checkbox } from "@/components/inputs/Checkbox";
import { Button } from "@/components/common/Button";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  RECURRENCE_TYPES,
  ALLOWED_STATUS_TRANSITIONS,
} from "@/lib/utils/constants";
import { isValidTaskTitle } from "@/lib/utils/validation";

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess }) => {
  const { createTask, updateTask, isLoading, tasks } = useTaskStore();
  const { categories } = useCategoryStore();
  const { showToast } = useToast();

  const isEditing = !!task;

  const [formData, setFormData] = useState<TaskBase>({
    title: task?.title || "",
    description: task?.description || "",
    due_date: task?.due_date || null,
    status: task?.status || "TODO",
    priority: task?.priority || "MEDIUM",
    recurrence_type: task?.recurrence_type || "NONE",
    recurrence_interval: task?.recurrence_interval || undefined,
    category: task?.category || undefined,
    parent: task?.parent || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get allowable status transitions for editing
  const allowableStatuses = isEditing
    ? ALLOWED_STATUS_TRANSITIONS[task.status as TaskStatus]
    : Object.keys(TASK_STATUSES);

  // Get available parent tasks (only for creation or if not changing parent)
  const getAvailableParentTasks = () => {
    return tasks.filter(
      (t) =>
        t.parent === null && // Only tasks without parents
        (task?.id ? t.id !== task.id : true) // Exclude current task if editing
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidTaskTitle(formData.title)) {
      newErrors.title = "Title is required and must be less than 255 characters";
    }

    if (formData.recurrence_type !== "NONE" && !formData.recurrence_interval) {
      newErrors.recurrence_interval =
        "Recurrence interval is required when recurrence type is set";
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditing && task) {
        await updateTask(task.id, formData);
        showToast("Task updated successfully", "success");
      } else {
        await createTask(formData);
        showToast("Task created successfully", "success");
        setFormData({
          title: "",
          description: "",
          due_date: null,
          status: "TODO",
          priority: "MEDIUM",
          recurrence_type: "NONE",
          recurrence_interval: undefined,
          category: undefined,
          parent: undefined,
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || "Failed to save task",
        "error"
      );
    }
  };

  const parentTaskOptions = getAvailableParentTasks().map((t) => ({
    value: t.id,
    label: t.title,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const statusOptions = (isEditing ? allowableStatuses : Object.keys(TASK_STATUSES)).map(
    (status) => ({
      value: status,
      label: TASK_STATUSES[status as TaskStatus],
    })
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <TextInput
        label="Task Title"
        placeholder="What needs to be done?"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        required
      />

      {/* Description */}
      <TextArea
        label="Description"
        placeholder="Add more details about this task..."
        value={formData.description || ""}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        rows={4}
      />

      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as TaskStatus })
          }
          options={statusOptions}
        />

        <Select
          label="Priority"
          value={formData.priority}
          onChange={(e) =>
            setFormData({ ...formData, priority: e.target.value as any })
          }
          options={Object.entries(TASK_PRIORITIES).map(([key, label]) => ({
            value: key,
            label,
          }))}
        />
      </div>

      {/* Due Date */}
      <DatePicker
        label="Due Date"
        value={
          formData.due_date
            ? formData.due_date.replace("Z", "").slice(0, 16)
            : ""
        }
        onChange={(e) => {
          const dateValue = e.target.value
            ? new Date(e.target.value).toISOString()
            : null;
          setFormData({ ...formData, due_date: dateValue });
        }}
      />

      {/* Category and Parent Task */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          value={formData.category || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          options={[{ value: "", label: "No category" }, ...categoryOptions]}
        />

        <Select
          label="Parent Task"
          value={formData.parent || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              parent: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          options={[{ value: "", label: "No parent" }, ...parentTaskOptions]}
        />
      </div>

      {/* Recurrence */}
      <div className="space-y-3 border-t border-gray-200 pt-5">
        <h3 className="text-sm font-semibold text-gray-900">Recurrence</h3>

        <Select
          label="Recurrence Type"
          value={formData.recurrence_type || "NONE"}
          onChange={(e) =>
            setFormData({
              ...formData,
              recurrence_type: e.target.value as any,
              recurrence_interval:
                e.target.value === "NONE"
                  ? undefined
                  : formData.recurrence_interval || 1,
            })
          }
          options={Object.entries(RECURRENCE_TYPES).map(([key, label]) => ({
            value: key,
            label,
          }))}
        />

        {formData.recurrence_type !== "NONE" && (
          <TextInput
            label="Recurrence Interval (days/weeks/months)"
            type="number"
            min="1"
            value={formData.recurrence_interval || 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                recurrence_interval: parseInt(e.target.value) || 1,
              })
            }
            error={errors.recurrence_interval}
          />
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 border-t border-gray-200 pt-5">
        <Button
          type="submit"
          isLoading={isLoading}
          className="flex-1"
        >
          {isEditing ? "Update Task" : "Create Task"}
        </Button>
        {onSuccess && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onSuccess?.()}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
