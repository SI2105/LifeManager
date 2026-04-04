/**
 * Dashboard Page
 * Main task list view
 */

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layouts/AppLayout";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/filters/TaskFilters";
import { SearchBar } from "@/components/filters/SearchBar";
import { SortOptions } from "@/components/filters/SortOptions";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { TaskForm } from "@/components/forms/TaskForm";
import { useTaskStore } from "@/store/taskStore";
import { useToast } from "@/components/common/Toast";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { fetchTasks, filteredTasks, isLoading, deleteTask } = useTaskStore();
  const { showToast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    searchParams.get("new") === "task"
  );

  // Initial fetch
  useEffect(() => {
    const category = searchParams.get("category");
    fetchTasks({
      category: category ? parseInt(category) : undefined,
    }).catch((error) => {
      console.error("Failed to fetch tasks:", error);
      showToast("Failed to load tasks", "error");
    });
  }, [fetchTasks, searchParams, showToast]);

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      showToast("Task deleted successfully", "success");
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || "Failed to delete task",
        "error"
      );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="mt-1 text-gray-600">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}{" "}
              {filteredTasks.length > 0 ? "to manage" : ""}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            size="lg"
          >
            + New Task
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <SearchBar />
          <div className="flex gap-4">
            <div className="flex-1">
              <TaskFilters />
            </div>
            <div>
              <SortOptions />
            </div>
          </div>
        </div>

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          isEmpty={filteredTasks.length === 0}
          onTaskDelete={handleDeleteTask}
        />
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchTasks().catch((error) => {
              console.error("Failed to refetch tasks:", error);
            });
          }}
        />
      </Modal>
    </AppLayout>
  );
}
