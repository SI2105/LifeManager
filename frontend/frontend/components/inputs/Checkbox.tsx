/**
 * Checkbox Component
 * Checkbox input field
 */

import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <input
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${
              className || ""
            }`}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              {label}
              {props.required && <span className="text-red-600 ml-1">*</span>}
            </label>
          )}
        </div>
        {error && <p className="text-sm text-red-600 ml-7">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
