/**
 * TaskCard Component
 * Displays a single task in list view
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Task } from "@/lib/api/types";
import { useCategoryStore } from "@/store/categoryStore";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { TASK_STATUSES, TASK_PRIORITIES, PRIORITY_COLORS } from "@/lib/utils/constants";
import { formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdate,
  onDelete,
  showActions = true,
}) => {
  const { getCategoryName } = useCategoryStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categoryName = getCategoryName(task.category);
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== "DONE" && task.status !== "ARCHIVED";
  const isCompleted = task.status === "DONE" || task.status === "ARCHIVED";

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(task.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className={`rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
          isCompleted
            ? "border-gray-200 bg-gray-50 opacity-75"
            : isOverdue
            ? "border-red-300 bg-red-50"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <Link href={`/dashboard/tasks/${task.id}`}>
              <h3
                className={`text-base font-semibold cursor-pointer hover:text-blue-600 ${
                  isCompleted ? "line-through text-gray-500" : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>
            </Link>

            {/* Description preview */}
            {task.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta information */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Status Badge */}
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
                size="sm"
              />

              {/* Priority Badge */}
              <Badge
                label={TASK_PRIORITIES[task.priority]}
                color={PRIORITY_COLORS[task.priority]}
                size="sm"
              />

              {/* Category Badge */}
              {categoryName && (
                <Badge
                  label={categoryName}
                  variant="primary"
                  size="sm"
                />
              )}

              {/* Due Date */}
              {dueDate && (
                <span
                  className={`text-xs font-medium ${
                    isOverdue
                      ? "text-red-600"
                      : isCompleted
                      ? "text-gray-500"
                      : "text-gray-600"
                  }`}
                >
                  {formatDistanceToNow(dueDate, { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Link href={`/dashboard/tasks/${task.id}`}>
                <Button variant="ghost" size="sm" title="View details">
                  →
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete task"
              >
                🗑️
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
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
              onClick={() => setShowDeleteConfirm(false)}
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
