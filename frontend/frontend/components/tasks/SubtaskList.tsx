/**
 * SubtaskList Component
 * Displays subtasks for a parent task
 */

"use client";

import React from "react";
import { useTaskStore } from "@/store/taskStore";
import { TaskCard } from "./TaskCard";

interface SubtaskListProps {
  parentId: number;
  onTaskDelete?: (id: number) => void;
  onTaskUpdate?: () => void;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  parentId,
  onTaskDelete,
  onTaskUpdate,
}) => {
  const { getSubtasks } = useTaskStore();
  const subtasks = getSubtasks(parentId);

  if (subtasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">No subtasks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Subtasks ({subtasks.length})</h3>
      <div className="ml-4 border-l border-gray-300 pl-4 space-y-3">
        {subtasks.map((subtask) => (
          <TaskCard
            key={subtask.id}
            task={subtask}
            onDelete={onTaskDelete}
            onUpdate={onTaskUpdate}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );
};
