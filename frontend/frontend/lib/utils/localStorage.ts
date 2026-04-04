/**
 * LocalStorage Utilities
 * Token persistence and retrieval
 */

import { AuthTokens } from "@/lib/api/types";

const TOKENS_KEY = "lifemanager_tokens";

/**
 * Get tokens from localStorage
 */
export const getTokens = (): AuthTokens | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(TOKENS_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/**
 * Set tokens in localStorage
 */
export const setTokens = (tokens: AuthTokens): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
};

/**
 * Clear tokens from localStorage
 */
export const clearTokens = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKENS_KEY);
};

/**
 * Check if tokens exist
 */
export const hasTokens = (): boolean => {
  return getTokens() !== null;
};
