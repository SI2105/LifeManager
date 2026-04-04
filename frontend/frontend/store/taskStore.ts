/**
 * Task Store
 * Global task state management with Zustand
 */

import { create } from "zustand";
import { Task, TaskBase, TaskStatus, TaskFilterParams, TaskListResponse } from "@/lib/api/types";
import * as taskApi from "@/lib/api/endpoints";
import { ALLOWED_STATUS_TRANSITIONS } from "@/lib/utils/constants";

// ============================================
// Store State Type
// ============================================

export interface TaskFilter {
  status?: TaskStatus;
  priority?: string;
  category?: number;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
  ordering?: string;
}

export interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  filters: TaskFilter;
  searchQuery: string;

  // Actions
  fetchTasks: (filterParams?: TaskFilterParams) => Promise<void>;
  createTask: (task: TaskBase) => Promise<Task>;
  updateTask: (id: number, task: Partial<TaskBase>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  markTaskDone: (id: number) => Promise<Task>;
  setFilters: (filters: TaskFilter) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  clearError: () => void;
  applyFiltersAndSearch: () => void;
  getTaskById: (id: number) => Task | undefined;
  getSubtasks: (parentId: number) => Task[];
  canTransitionTo: (currentStatus: TaskStatus, newStatus: TaskStatus) => boolean;
}

// ============================================
// Store Definition
// ============================================

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filteredTasks: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 20,
  totalCount: 0,
  filters: {},
  searchQuery: "",

  /**
   * Fetch tasks with optional filters
   */
  fetchTasks: async (filterParams?: TaskFilterParams) => {
    set({ isLoading: true, error: null });

    try {
      const response = await taskApi.getTasks(filterParams);
      set({
        tasks: response.results,
        totalCount: response.count,
        isLoading: false,
        currentPage: filterParams?.page || 1,
        pageSize: filterParams?.limit || 20,
      });

      // Apply local filters and search
      get().applyFiltersAndSearch();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to fetch tasks";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Create a new task
   */
  createTask: async (task: TaskBase) => {
    set({ isLoading: true, error: null });

    try {
      const newTask = await taskApi.createTask(task);
      set({
        tasks: [newTask, ...get().tasks],
        isLoading: false,
      });

      // Reapply filters and search
      get().applyFiltersAndSearch();

      return newTask;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to create task";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Update a task
   */
  updateTask: async (id: number, task: Partial<TaskBase>) => {
    set({ isLoading: true, error: null });

    try {
      const updatedTask = await taskApi.patchTask(id, task);
      set({
        tasks: get().tasks.map((t) => (t.id === id ? updatedTask : t)),
        isLoading: false,
      });

      // Reapply filters and search
      get().applyFiltersAndSearch();

      return updatedTask;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to update task";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      await taskApi.deleteTask(id);
      set({
        tasks: get().tasks.filter((t) => t.id !== id),
        isLoading: false,
      });

      // Reapply filters and search
      get().applyFiltersAndSearch();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to delete task";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Mark a task as done
   */
  markTaskDone: async (id: number) => {
    const task = get().getTaskById(id);
    if (!task) throw new Error("Task not found");

    // Validate transition is allowed
    if (!get().canTransitionTo(task.status, "DONE")) {
      throw new Error(`Cannot transition from ${task.status} to DONE`);
    }

    return get().updateTask(id, {
      status: "DONE",
    });
  },

  /**
   * Set filters
   */
  setFilters: (filters: TaskFilter) => {
    set({ filters });
    get().applyFiltersAndSearch();
  },

  /**
   * Set search query
   */
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().applyFiltersAndSearch();
  },

  /**
   * Reset all filters and search
   */
  resetFilters: () => {
    set({ filters: {}, searchQuery: "" });
    get().applyFiltersAndSearch();
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Apply filters and search to tasks (client-side filtering)
   */
  applyFiltersAndSearch: () => {
    const { tasks, filters, searchQuery } = get();

    let filtered = tasks;

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    // Apply category filter
    if (filters.category !== undefined && filters.category !== null) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    // Apply due date range filters
    if (filters.due_date_from) {
      filtered = filtered.filter((t) => {
        if (!t.due_date) return false;
        return new Date(t.due_date) >= new Date(filters.due_date_from!);
      });
    }

    if (filters.due_date_to) {
      filtered = filtered.filter((t) => {
        if (!t.due_date) return false;
        return new Date(t.due_date) <= new Date(filters.due_date_to!);
      });
    }

    // Apply search filter (title and description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // Apply ordering
    if (filters.ordering) {
      const isAscending = !filters.ordering.startsWith("-");
      const field = filters.ordering.replace(/^-/, "");

      filtered.sort((a, b) => {
        let aValue: any = (a as any)[field];
        let bValue: any = (b as any)[field];

        if (aValue === null || aValue === undefined) return isAscending ? 1 : -1;
        if (bValue === null || bValue === undefined) return isAscending ? -1 : 1;

        if (typeof aValue === "string") {
          aValue = aValue.localeCompare(bValue);
          bValue = 0;
        }

        if (isAscending) {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    set({ filteredTasks: filtered });
  },

  /**
   * Get task by ID
   */
  getTaskById: (id: number) => {
    return get().tasks.find((t) => t.id === id);
  },

  /**
   * Get all subtasks for a parent task
   */
  getSubtasks: (parentId: number) => {
    return get().tasks.filter((t) => t.parent === parentId);
  },

  /**
   * Check if a status transition is allowed
   */
  canTransitionTo: (currentStatus: TaskStatus, newStatus: TaskStatus) => {
    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
  },
}));
