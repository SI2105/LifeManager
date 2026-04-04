/**
 * Category Store
 * Global category state management with Zustand
 */

import { create } from "zustand";
import { Category } from "@/lib/api/types";
import * as categoryApi from "@/lib/api/endpoints";

// ============================================
// Store State Type
// ============================================

export interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (name: string, color?: string, icon?: string) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  clearError: () => void;
  getCategoryById: (id: number) => Category | undefined;
  getCategoryName: (id: number | null | undefined) => string | null;
}

// ============================================
// Store Definition
// ============================================

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  /**
   * Fetch all categories
   */
  fetchCategories: async () => {
    set({ isLoading: true, error: null });

    try {
      const categories = await categoryApi.getCategories();
      set({
        categories,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to fetch categories";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Create a new category
   */
  createCategory: async (name: string, color?: string, icon?: string) => {
    set({ isLoading: true, error: null });

    try {
      const category = await categoryApi.createCategory({
        name,
        color,
        icon,
      });

      set({
        categories: [...get().categories, category],
        isLoading: false,
      });

      return category;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.name?.[0] ||
        "Failed to create category";

      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      await categoryApi.deleteCategory(id);
      set({
        categories: get().categories.filter((c) => c.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to delete category";
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

  /**
   * Get category by ID
   */
  getCategoryById: (id: number) => {
    return get().categories.find((c) => c.id === id);
  },

  /**
   * Get category name by ID (returns null if not found)
   */
  getCategoryName: (id: number | null | undefined) => {
    if (!id) return null;
    const category = get().getCategoryById(id);
    return category?.name || null;
  },
}));
