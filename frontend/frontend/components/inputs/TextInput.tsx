/**
 * TextInput Component
 * Standard text input field
 */

import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border px-4 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 focus:border-blue-500"
          } ${className || ""}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
