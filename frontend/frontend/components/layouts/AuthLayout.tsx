/**
 * AuthLayout Component
 * Layout for authentication pages (login, register)
 */

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingSpinner fullscreen message="Loading..." />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">LifeManager</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-2 text-gray-600">{description}</p>}
        </div>

        {/* Content */}
        <div className="rounded-lg bg-white shadow-lg px-6 py-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>© 2026 LifeManager. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
