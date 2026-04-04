/**
 * SortOptions Component
 * Sort tasks by different criteria
 */

"use client";

import React from "react";
import { useTaskStore, TaskFilter } from "@/store/taskStore";
import { Select } from "@/components/inputs/Select";

export const SortOptions: React.FC = () => {
  const { filters, setFilters } = useTaskStore();

  const sortOptions = [
    { value: "", label: "Default" },
    { value: "priority", label: "Priority (Low to High)" },
    { value: "-priority", label: "Priority (High to Low)" },
    { value: "due_date", label: "Due Date (Earliest First)" },
    { value: "-due_date", label: "Due Date (Latest First)" },
    { value: "created_at", label: "Created (Oldest First)" },
    { value: "-created_at", label: "Created (Newest First)" },
    { value: "updated_at", label: "Updated (Oldest First)" },
    { value: "-updated_at", label: "Updated (Newest First)" },
  ];

  const handleSortChange = (value: string) => {
    setFilters({
      ...filters,
      ordering: value || undefined,
    });
  };

  return (
    <div className="w-full md:w-64">
      <Select
        label="Sort By"
        value={filters.ordering || ""}
        onChange={(e) => handleSortChange(e.target.value)}
        options={sortOptions}
      />
    </div>
  );
};
