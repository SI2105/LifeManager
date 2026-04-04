/**
 * CategoryForm Component
 * Create and edit category form
 */

"use client";

import React, { useState, FormEvent } from "react";
import { useCategoryStore } from "@/store/categoryStore";
import { useToast } from "@/components/common/Toast";
import { TextInput } from "@/components/inputs/TextInput";
import { Select } from "@/components/inputs/Select";
import { Button } from "@/components/common/Button";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/utils/constants";
import { isValidCategoryName } from "@/lib/utils/validation";

interface CategoryFormProps {
  onSuccess?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ onSuccess }) => {
  const { createCategory, isLoading } = useCategoryStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    color: CATEGORY_COLORS[0].hex,
    icon: CATEGORY_ICONS[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidCategoryName(formData.name)) {
      newErrors.name = "Category name is required and must be less than 120 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createCategory(formData.name, formData.color, formData.icon);
      showToast("Category created successfully", "success");

      // Reset form
      setFormData({
        name: "",
        color: CATEGORY_COLORS[0].hex,
        icon: CATEGORY_ICONS[0],
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.name?.[0] || "Failed to create category";
      showToast(errorMessage, "error");
      setErrors({ detail: errorMessage });
    }
  };

  const colorOptions = CATEGORY_COLORS.map((color) => ({
    value: color.hex,
    label: color.name,
  }));

  const iconOptions = CATEGORY_ICONS.map((icon) => ({
    value: icon,
    label: icon,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <TextInput
        label="Category Name"
        placeholder="Work, Personal, Shopping..."
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      {/* Color and Icon */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          options={colorOptions}
        />

        <Select
          label="Icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          options={iconOptions}
        />
      </div>

      {/* Preview */}
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">Preview</p>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded-full"
            style={{ backgroundColor: formData.color }}
          ></span>
          <span className="text-2xl">{formData.icon}</span>
          <span className="text-sm font-medium text-gray-900">{formData.name || "Category Name"}</span>
        </div>
      </div>

      {/* API Error */}
      {errors.detail && (
        <div className="rounded-lg bg-red-50 border border-red-300 px-4 py-3">
          <p className="text-sm text-red-800">{errors.detail}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Create Category
      </Button>
    </form>
  );
};
