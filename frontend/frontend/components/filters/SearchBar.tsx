/**
 * SearchBar Component
 * Real-time task search
 */

"use client";

import React, { useState, useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { DEBOUNCE_SEARCH } from "@/lib/utils/constants";

export const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useTaskStore();
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, DEBOUNCE_SEARCH);

    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery]);

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
  };

  return (
    <div className="relative">
      <input
        type="search"
        placeholder="Search tasks by title or description..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Search Icon */}
      <svg
        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Clear Button */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
