/**
 * Sidebar Component
 * Navigation sidebar with category list
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCategoryStore } from "@/store/categoryStore";
import { Button } from "./Button";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { categories } = useCategoryStore();
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/categories", label: "Categories", icon: "🏷️" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="h-full flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Categories Section */}
          <div className="space-y-3 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Categories
              </h3>
              <button
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-gray-400 hover:text-gray-600"
                title="Add category"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Category List */}
            {categories.length > 0 ? (
              <div className="space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/dashboard?category=${category.id}`}
                    className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                    {category.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="px-4 text-xs text-gray-500 italic">No categories yet</p>
            )}

            {isAddingCategory && (
              <div className="px-4">
                <p className="text-xs text-gray-500">Add category from Categories page</p>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-4">
          <p className="text-xs text-gray-500">LifeManager v1.0</p>
        </div>
      </div>
    </aside>
  );
};
