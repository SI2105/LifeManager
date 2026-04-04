/**
 * TaskFilters Component
 * Multi-select filtering for tasks
 */

"use client";

import React from "react";
import { useTaskStore, TaskFilter } from "@/store/taskStore";
import { useCategoryStore } from "@/store/categoryStore";
import { Select } from "@/components/inputs/Select";
import { Button } from "@/components/common/Button";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/utils/constants";

export const TaskFilters: React.FC = () => {
  const { filters, setFilters, resetFilters } = useTaskStore();
  const { categories } = useCategoryStore();

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    setFilters({
      ...filters,
      [key]: value || undefined,
    });
  };

  const statusOptions = Object.entries(TASK_STATUSES).map(([key, label]) => ({
    value: key,
    label,
  }));

  const priorityOptions = Object.entries(TASK_PRIORITIES).map(([key, label]) => ({
    value: key,
    label,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-gray-900">Filters</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {/* Status Filter */}
        <Select
          label="Status"
          value={filters.status || ""}
          onChange={(e) =>
            handleFilterChange("status", e.target.value || undefined)
          }
          options={[{ value: "", label: "All statuses" }, ...statusOptions]}
        />

        {/* Priority Filter */}
        <Select
          label="Priority"
          value={filters.priority || ""}
          onChange={(e) =>
            handleFilterChange("priority", e.target.value || undefined)
          }
          options={[{ value: "", label: "All priorities" }, ...priorityOptions]}
        />

        {/* Category Filter */}
        <Select
          label="Category"
          value={filters.category ? filters.category.toString() : ""}
          onChange={(e) =>
            handleFilterChange(
              "category",
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
          options={[{ value: "", label: "All categories" }, ...categoryOptions]}
        />

        {/* Reset Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => resetFilters()}
              className="w-full"
              size="sm"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Date Range Filters */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700">Due Date Range</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="date"
            value={filters.due_date_from || ""}
            onChange={(e) =>
              handleFilterChange("due_date_from", e.target.value || undefined)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="From date"
          />
          <input
            type="date"
            value={filters.due_date_to || ""}
            onChange={(e) =>
              handleFilterChange("due_date_to", e.target.value || undefined)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="To date"
          />
        </div>
      </div>
    </div>
  );
};
