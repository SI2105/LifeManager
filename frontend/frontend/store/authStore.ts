/**
 * Auth Store
 * Global authentication state management with Zustand
 */

import { create } from "zustand";
import { User, AuthSuccessResponse } from "@/lib/api/types";
import * as authApi from "@/lib/api/endpoints";
import { getTokens, setTokens, clearTokens, hasTokens } from "@/lib/utils/localStorage";

// ============================================
// Store State Type
// ============================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeAuth: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
  clearError: () => void;
}

// ============================================
// Store Definition
// ============================================

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  /**
   * Initialize auth state from localStorage and API
   * Called on app startup
   */
  initializeAuth: async () => {
    set({ isLoading: true, error: null });

    try {
      // Check if tokens exist in localStorage
      if (!hasTokens()) {
        set({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }

      // Fetch current user profile
      const user = await authApi.authGetMe();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      // Clear tokens if they're invalid
      clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.detail || "Failed to load user profile",
      });
    }
  },

  /**
   * Register a new user
   */
  register: async (email: string, password: string, firstName: string, lastName: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.authRegister({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      // Store tokens and update state
      setTokens(response.tokens);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.password?.[0] ||
        "Registration failed";

      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.authLogin({
        email,
        password,
      });

      // Store tokens and update state
      setTokens(response.tokens);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Login failed. Please check your credentials.";

      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await authApi.authLogout();
    } catch (error: any) {
      // Log error but still clear local state
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear tokens and reset state
      clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (firstName: string, lastName: string) => {
    set({ isLoading: true, error: null });

    try {
      const updatedUser = await authApi.authUpdateMe({
        first_name: firstName,
        last_name: lastName,
      });

      set({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to update profile";

      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
