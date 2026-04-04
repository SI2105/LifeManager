/**
 * Settings Page
 * User profile and account settings
 */

"use client";

import React, { useState, FormEvent } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { TextInput } from "@/components/inputs/TextInput";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/common/Toast";

export default function SettingsPage() {
  const { user, updateProfile, logout, isLoading } = useAuthStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!formData.firstName.trim()) {
      setErrors({ firstName: "First name is required" });
      return;
    }

    if (!formData.lastName.trim()) {
      setErrors({ lastName: "Last name is required" });
      return;
    }

    try {
      await updateProfile(formData.firstName, formData.lastName);
      showToast("Profile updated successfully", "success");
    } catch (error: any) {
      showToast(
        error.response?.data?.detail || "Failed to update profile",
        "error"
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out successfully", "success");
    } catch (error: any) {
      showToast("Logout failed", "error");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* First Name */}
            <TextInput
              label="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              error={errors.firstName}
              required
            />

            {/* Last Name */}
            <TextInput
              label="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              error={errors.lastName}
              required
            />

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                isLoading={isLoading}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-300 bg-red-50 p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-red-900 mb-1">Logout</h3>
              <p className="text-sm text-red-700 mb-4">
                Sign out of your account. You'll be able to sign back in anytime.
              </p>
              <Button
                variant="danger"
                onClick={handleLogout}
                isLoading={isLoading}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-600">User ID:</dt>
              <dd className="font-mono text-gray-900">{user?.id}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Account Created:</dt>
              <dd className="text-gray-900">
                {user ? new Date().toLocaleDateString() : "N/A"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </AppLayout>
  );
}
