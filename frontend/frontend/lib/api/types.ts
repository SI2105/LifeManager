/**
 * API Type Definitions
 * These types correspond to the Django backend serializers and models
 */

// ============================================
// Authentication Types
// ============================================

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthSuccessResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface MeUpdateRequest {
  first_name?: string;
  last_name?: string;
}

// ============================================
// Task Types
// ============================================

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface Category {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface TaskBase {
  title: string;
  description?: string;
  due_date?: string | null; // ISO 8601 datetime
  status: TaskStatus;
  priority: TaskPriority;
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number | null;
  category?: number | null; // Category ID
  parent?: number | null; // Parent Task ID (for subtasks)
}

export interface Task extends TaskBase {
  id: number;
  user?: number;
  category_name?: string; // Read-only denormalized field
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

// ============================================
// API Error Types
// ============================================

export interface APIErrorResponse {
  detail?: string;
  [key: string]: any;
}

export interface ValidationError {
  [field: string]: string[];
}

// ============================================
// Request/Response Wrapper Types
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TaskFilterParams extends PaginationParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: number;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
  ordering?: "due_date" | "-due_date" | "priority" | "-priority" | "created_at" | "-created_at" | "updated_at" | "-updated_at";
}
