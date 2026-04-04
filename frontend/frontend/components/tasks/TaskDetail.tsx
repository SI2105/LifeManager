/**
 * TaskDetail Component
 * Displays full task details
 */

"use client";

import React, { useState } from "react";
import { Task } from "@/lib/api/types";
import { useCategoryStore } from "@/store/categoryStore";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { TaskForm } from "@/components/forms/TaskForm";
import { SubtaskList } from "./SubtaskList";
import { RecurrenceDisplay } from "./RecurrenceDisplay";
import { TASK_STATUSES, TASK_PRIORITIES, PRIORITY_COLORS } from "@/lib/utils/constants";
import { format } from "date-fns";

interface TaskDetailProps {
  task: Task;
  onDelete?: (id: number) => void;
  onUpdate?: () => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  onDelete,
  onUpdate,
}) => {
  const { getCategoryName } = useCategoryStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const categoryName = getCategoryName(task.category);
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const completedDate = task.completed_at ? new Date(task.completed_at) : null;
  const createdDate = new Date(task.created_at);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
    setIsDeleteConfirmOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge
              label={TASK_STATUSES[task.status]}
              variant={
                task.status === "DONE"
                  ? "success"
                  : task.status === "IN_PROGRESS"
                  ? "primary"
                  : task.status === "ARCHIVED"
                  ? "default"
                  : "warning"
              }
            />
            <Badge
              label={TASK_PRIORITIES[task.priority]}
              color={PRIORITY_COLORS[task.priority]}
            />
            {categoryName && (
              <Badge label={categoryName} variant="primary" />
            )}
          </div>

          {task.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Due Date */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Due Date</h3>
            {dueDate ? (
              <p className="text-base text-gray-900">
                {format(dueDate, "PPP p")}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Not set</p>
            )}
          </div>

          {/* Completed Date */}
          {completedDate && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Completed</h3>
              <p className="text-base text-gray-900">
                {format(completedDate, "PPP p")}
              </p>
            </div>
          )}

          {/* Recurrence */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recurrence</h3>
            <RecurrenceDisplay
              recurrenceType={task.recurrence_type || "NONE"}
              recurrenceInterval={task.recurrence_interval}
            />
          </div>

          {/* Category */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
            {categoryName ? (
              <p className="text-base text-gray-900">{categoryName}</p>
            ) : (
              <p className="text-sm text-gray-500">Not assigned</p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Metadata</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-600">Created:</dt>
              <dd className="text-gray-900">{format(createdDate, "PPP p")}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Last Updated:</dt>
              <dd className="text-gray-900">
                {format(new Date(task.updated_at), "PPP p")}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">ID:</dt>
              <dd className="font-mono text-gray-600">{task.id}</dd>
            </div>
          </dl>
        </div>

        {/* Subtasks */}
        {!task.parent && (
          <div className="border-t border-gray-200 pt-6">
            <SubtaskList
              parentId={task.id}
              onTaskDelete={onDelete}
              onTaskUpdate={onUpdate}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-6">
          <Button
            variant="primary"
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1"
          >
            Edit Task
          </Button>
          <Button
            variant="danger"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="flex-1"
          >
            Delete Task
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
        size="lg"
      >
        <TaskForm
          task={task}
          onSuccess={() => {
            setIsEditModalOpen(false);
            if (onUpdate) {
              onUpdate();
            }
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete Task"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{task.title}"? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};
