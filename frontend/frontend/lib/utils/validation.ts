/**
 * Validation Utilities
 * Form and data validation helpers
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requires at least 8 characters
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Get password strength message
 */
export const getPasswordStrengthMessage = (password: string): {
  isValid: boolean;
  message: string;
} => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters" };
  }
  return { isValid: true, message: "Password is strong" };
};

/**
 * Validate task title
 */
export const isValidTaskTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.length <= 255;
};

/**
 * Validate category name
 */
export const isValidCategoryName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= 120;
};

/**
 * Validate user name
 */
export const isValidUserName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= 150;
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date > new Date();
};

/**
 * Check if date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date < new Date();
};

/**
 * Parse API validation errors
 */
export const parseValidationErrors = (
  error: any
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (error.response?.data) {
    const data = error.response.data;

    // Handle field-specific errors
    if (typeof data === "object") {
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          errors[key] = (value as string[])[0];
        } else if (typeof value === "string") {
          errors[key] = value;
        }
      }
    }

    // Handle generic detail message
    if (data.detail && !errors.detail) {
      errors.detail = data.detail;
    }
  }

  return errors;
};

/**
 * Format validation error message for display
 */
export const formatValidationError = (field: string, error: string): string => {
  return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${error}`;
};
