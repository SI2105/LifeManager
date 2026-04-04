/**
 * Task Detail Page
 * View and edit a specific task
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/layouts/AppLayout";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useTaskStore } from "@/store/taskStore";
import { useToast } from "@/components/common/Toast";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { getTaskById, fetchTasks, deleteTask } = useTaskStore();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState(getTaskById(parseInt(taskId)));

  // Load task on mount
  useEffect(() => {
    const loadTask = async () => {
      try {
        // First check if task is already loaded
        let currentTask = getTaskById(parseInt(taskId));

        // If not, fetch all tasks
        if (!currentTask) {
          await fetchTasks();
          currentTask = getTaskById(parseInt(taskId));
        }

        if (currentTask) {
          setTask(currentTask);
        } else {
          showToast("Task not found", "error");
          router.push("/dashboard");
        }
      } catch (error: any) {
        console.error("Failed to load task:", error);
        showToast("Failed to load task", "error");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [taskId, getTaskById, fetchTasks, showToast, router]);

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      showToast("Task deleted successfully", "success");
      router.push("/dashboard");
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || "Failed to delete task",
        "error"
      );
    }
  };

  const handleUpdateTask = async () => {
    try {
      await fetchTasks();
      const updatedTask = getTaskById(parseInt(taskId));
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (error: any) {
      console.error("Failed to refresh task:", error);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner fullscreen message="Loading task..." />
      </AppLayout>
    );
  }

  if (!task) {
    return (
      <AppLayout>
        <div className="rounded-lg border border-red-300 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">Task not found</h2>
          <p className="mt-2 text-red-700">This task doesn't exist or has been deleted.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TaskDetail
        task={task}
        onDelete={handleDeleteTask}
        onUpdate={handleUpdateTask}
      />
    </AppLayout>
  );
}
