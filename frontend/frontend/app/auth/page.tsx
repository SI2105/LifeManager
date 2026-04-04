/**
 * Auth Page
 * Login and Register page
 */

"use client";

import React, { useState } from "react";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AuthForm } from "@/components/forms/AuthForm";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <AuthLayout
      title={mode === "login" ? "Welcome Back" : "Get Started"}
      description={
        mode === "login"
          ? "Sign in to your LifeManager account"
          : "Create a new LifeManager account"
      }
    >
      <AuthForm
        mode={mode}
        onSuccess={() => {
          // The store will handle redirect
        }}
      />

      <div className="mt-6 border-t border-gray-200 pt-6 text-center">
        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {mode === "login"
            ? "Don't have an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </AuthLayout>
  );
}
