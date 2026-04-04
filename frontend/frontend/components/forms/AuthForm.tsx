/**
 * AuthForm Component
 * Login and Register form component
 */

"use client";

import React, { useState, FormEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/common/Toast";
import { TextInput } from "@/components/inputs/TextInput";
import { Button } from "@/components/common/Button";
import { isValidEmail, isValidPassword, parseValidationErrors } from "@/lib/utils/validation";

interface AuthFormProps {
  mode: "login" | "register";
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess }) => {
  const { login, register, isLoading } = useAuthStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isValidPassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (mode === "register") {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }
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
      if (mode === "login") {
        await login(formData.email, formData.password);
        showToast("Login successful!", "success");
      } else {
        await register(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );
        showToast("Registration successful!", "success");
      }

      // Reset form
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const apiErrors = parseValidationErrors(error);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      } else {
        showToast(
          error.response?.data?.detail || "An error occurred",
          "error"
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <TextInput
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        required
      />

      {/* Password */}
      <TextInput
        type="password"
        label="Password"
        placeholder={mode === "login" ? "••••••••" : "At least 8 characters"}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={errors.password}
        hint={mode === "register" ? "Minimum 8 characters" : undefined}
        required
      />

      {/* Register-only fields */}
      {mode === "register" && (
        <>
          <TextInput
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            error={errors.firstName}
            required
          />

          <TextInput
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            error={errors.lastName}
            required
          />
        </>
      )}

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
        size="lg"
      >
        {mode === "login" ? "Sign in" : "Create Account"}
      </Button>

      {/* Footer */}
      <p className="text-center text-sm text-gray-600">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <a href="/auth" className="font-medium text-blue-600 hover:text-blue-700">
              Create one
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="/auth" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </a>
          </>
        )}
      </p>
    </form>
  );
};
