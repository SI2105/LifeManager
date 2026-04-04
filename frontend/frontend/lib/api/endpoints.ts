/**
 * API Endpoints
 * Typed functions for all API endpoints
 */

import apiClient from "./client";
import {
  User,
  AuthSuccessResponse,
  LoginRequest,
  RegisterRequest,
  MeUpdateRequest,
  Task,
  TaskListResponse,
  TaskBase,
  Category,
  TaskFilterParams,
} from "./types";

const API_V1 = "/";

// ============================================
// Authentication Endpoints
// ============================================

/**
 * Register a new user
 */
export const authRegister = async (data: RegisterRequest): Promise<AuthSuccessResponse> => {
  const response = await apiClient.post<AuthSuccessResponse>(`${API_V1}auth/register/`, data);
  return response.data;
};

/**
 * Login user and get tokens
 */
export const authLogin = async (data: LoginRequest): Promise<AuthSuccessResponse> => {
  const response = await apiClient.post<AuthSuccessResponse>(`${API_V1}auth/login/`, data);
  return response.data;
};

/**
 * Get current user (me) profile
 */
export const authGetMe = async (): Promise<User> => {
  const response = await apiClient.get<User>(`${API_V1}auth/me/`);
  return response.data;
};

/**
 * Update current user (me) profile
 */
export const authUpdateMe = async (data: MeUpdateRequest): Promise<User> => {
  const response = await apiClient.patch<User>(`${API_V1}auth/me/`, data);
  return response.data;
};

/**
 * Logout and blacklist refresh token
 */
export const authLogout = async (): Promise<void> => {
  await apiClient.post(`${API_V1}auth/logout/`);
};

// ============================================
// Task Endpoints
// ============================================

/**
 * Get list of tasks with optional filtering
 */
export const getTasks = async (params?: TaskFilterParams): Promise<TaskListResponse> => {
  const response = await apiClient.get<TaskListResponse>(`${API_V1}tasks/`, {
    params: {
      limit: params?.limit || 20,
      offset: params?.page ? (params.page - 1) * (params.limit || 20) : 0,
      ...params,
    },
  });
  return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (data: TaskBase): Promise<Task> => {
  const response = await apiClient.post<Task>(`${API_V1}tasks/`, data);
  return response.data;
};

/**
 * Get a specific task by ID
 */
export const getTask = async (id: number): Promise<Task> => {
  const response = await apiClient.get<Task>(`${API_V1}tasks/${id}/`);
  return response.data;
};

/**
 * Update a task (full update)
 */
export const updateTask = async (id: number, data: Partial<TaskBase>): Promise<Task> => {
  const response = await apiClient.put<Task>(`${API_V1}tasks/${id}/`, data);
  return response.data;
};

/**
 * Partially update a task
 */
export const patchTask = async (id: number, data: Partial<TaskBase>): Promise<Task> => {
  const response = await apiClient.patch<Task>(`${API_V1}tasks/${id}/`, data);
  return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_V1}tasks/${id}/`);
};

// ============================================
// Category Endpoints
// ============================================

/**
 * Get list of categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(`${API_V1}categories/`);
  return response.data;
};

/**
 * Create a new category
 */
export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const response = await apiClient.post<Category>(`${API_V1}categories/`, data);
  return response.data;
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_V1}categories/${id}/`);
};
