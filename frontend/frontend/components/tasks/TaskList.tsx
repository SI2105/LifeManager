/**
 * TaskList Component
 * Displays a list of tasks with pagination
 */

"use client";

import React from "react";
import { Task } from "@/lib/api/types";
import { TaskCard } from "./TaskCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/common/Button";

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  isEmpty?: boolean;
  onTaskDelete?: (id: number) => void;
  onTaskUpdate?: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading = false,
  isEmpty = false,
  onTaskDelete,
  onTaskUpdate,
}) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  if (isEmpty || tasks.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600 mb-6">
          Create your first task to get started, or adjust your filters.
        </p>
        <Button variant="primary" href="/dashboard?new=task">
          Create a Task
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onTaskDelete}
          onUpdate={onTaskUpdate}
          showActions={true}
        />
      ))}
    </div>
  );
};
