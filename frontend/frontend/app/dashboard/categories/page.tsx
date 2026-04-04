/**
 * Categories Page
 * Manage task categories
 */

"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { useCategoryStore } from "@/store/categoryStore";
import { useToast } from "@/components/common/Toast";

export default function CategoriesPage() {
  const { categories, fetchCategories, deleteCategory, isLoading } = useCategoryStore();
  const { showToast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirl, setDeleteConfirm] = useState<number | null>(null);

  // Load categories on mount
  useEffect(() => {
    fetchCategories().catch((error) => {
      console.error("Failed to fetch categories:", error);
      showToast("Failed to load categories", "error");
    });
  }, [fetchCategories, showToast]);

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      showToast("Category deleted successfully", "success");
      setDeleteConfirm(null);
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || "Failed to delete category",
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
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-gray-600">
              Organize your tasks with custom categories
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            size="lg"
          >
            + New Category
          </Button>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <div className="text-5xl mb-4">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No categories yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first category to organize your tasks
            </p>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Category
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-6 w-6 rounded-full"
                      style={{ backgroundColor: category.color || "#3b82f6" }}
                    ></span>
                    <span className="text-2xl">{category.icon || "📋"}</span>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(category.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete category"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-2">
                  Created {new Date(category.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Category"
        size="md"
      >
        <CategoryForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchCategories().catch((error) => {
              console.error("Failed to refetch categories:", error);
            });
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirl !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={() => deleteConfirl && handleDeleteCategory(deleteConfirl)}
              className="flex-1"
              isLoading={isLoading}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete this category? Tasks in this category will no longer be associated with it.
        </p>
      </Modal>
    </AppLayout>
  );
}
