/**
 * Badge Component
 * Display tags, labels, and statuses
 */

import React from "react";

interface BadgeProps {
  label: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  color?: string; // Custom Tailwind class
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  size = "md",
  color,
  className,
}) => {
  const variantClasses: Record<string, string> = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  const sizeClasses: Record<string, string> = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  const baseClasses = "inline-flex items-center font-medium rounded-full";

  return (
    <span
      className={`${baseClasses} ${color || variantClasses[variant]} ${sizeClasses[size]} ${
        className || ""
      }`}
    >
      {label}
    </span>
  );
};
