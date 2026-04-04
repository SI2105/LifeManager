/**
 * Constants
 * Enums and constants for the application
 */

import { TaskStatus, TaskPriority, RecurrenceType } from "@/lib/api/types";

// ============================================
// Task Status
// ============================================

export const TASK_STATUSES: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  ARCHIVED: "Archived",
};

export const TASK_STATUS_VALUES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"];

// Status transition rules
export const ALLOWED_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ["IN_PROGRESS", "DONE", "ARCHIVED"],
  IN_PROGRESS: ["DONE", "ARCHIVED"],
  DONE: ["ARCHIVED"],
  ARCHIVED: [],
};

// ============================================
// Task Priority
// ============================================

export const TASK_PRIORITIES: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const TASK_PRIORITY_VALUES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

// Priority color mapping for UI
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

export const PRIORITY_BORDER_COLORS: Record<TaskPriority, string> = {
  LOW: "border-blue-300",
  MEDIUM: "border-yellow-300",
  HIGH: "border-red-300",
};

// ============================================
// Recurrence Type
// ============================================

export const RECURRENCE_TYPES: Record<RecurrenceType, string> = {
  NONE: "None",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

export const RECURRENCE_TYPE_VALUES: RecurrenceType[] = ["NONE", "DAILY", "WEEKLY", "MONTHLY"];

// ============================================
// Color Palette for Categories
// ============================================

export const CATEGORY_COLORS = [
  { name: "Red", value: "bg-red-500", hex: "#ef4444" },
  { name: "Orange", value: "bg-orange-500", hex: "#f97316" },
  { name: "Yellow", value: "bg-yellow-500", hex: "#eab308" },
  { name: "Green", value: "bg-green-500", hex: "#22c55e" },
  { name: "Blue", value: "bg-blue-500", hex: "#3b82f6" },
  { name: "Indigo", value: "bg-indigo-500", hex: "#6366f1" },
  { name: "Purple", value: "bg-purple-500", hex: "#a855f7" },
  { name: "Pink", value: "bg-pink-500", hex: "#ec4899" },
  { name: "Slate", value: "bg-slate-500", hex: "#64748b" },
  { name: "Gray", value: "bg-gray-500", hex: "#6b7280" },
];

// ============================================
// Common Icons (emoji icons as fallback)
// ============================================

export const CATEGORY_ICONS = [
  "📋",
  "🎯",
  "💼",
  "🏠",
  "🚀",
  "📚",
  "🎨",
  "🏃",
  "🍔",
  "🎬",
  "🌍",
  "💰",
];

// ============================================
// API Routes
// ============================================

export const API_ROUTES = {
  AUTH: {
    REGISTER: "/auth/register/",
    LOGIN: "/auth/login/",
    ME: "/auth/me/",
    LOGOUT: "/auth/logout/",
  },
  TASKS: {
    LIST: "/tasks/",
    CREATE: "/tasks/",
    DETAIL: (id: number) => `/tasks/${id}/`,
    UPDATE: (id: number) => `/tasks/${id}/`,
    DELETE: (id: number) => `/tasks/${id}/`,
  },
  CATEGORIES: {
    LIST: "/categories/",
    CREATE: "/categories/",
    DELETE: (id: number) => `/categories/${id}/`,
  },
};

// ============================================
// Pagination
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================
// Debounce Delays (ms)
// ============================================

export const DEBOUNCE_SEARCH = 300;
export const DEBOUNCE_FILTER = 200;

// ============================================
// Toast Messages
// ============================================

export const TOAST_DURATIONS = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
};
