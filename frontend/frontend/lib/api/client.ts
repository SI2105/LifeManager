/**
 * API Client
 * Axios instance with JWT interceptors for authentication
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getTokens, setTokens, clearTokens } from "@/lib/utils/localStorage";
import { AuthTokens, RefreshTokenRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track token refresh to avoid multiple simultaneous requests
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

/**
 * Request Interceptor
 * Adds authorization header with access token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getTokens();
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles token refresh on 401 and other error cases
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 (Unauthorized) and not a refresh attempt
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request to retry after token refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            clearTokens();
            // Redirect to login - will be handled by middleware
            window.location.href = "/auth";
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = getTokens();
        if (!tokens?.refresh) {
          clearTokens();
          window.location.href = "/auth";
          return Promise.reject(error);
        }

        // Attempt token refresh
        const refreshRequest: RefreshTokenRequest = {
          refresh: tokens.refresh,
        };

        const response = await axios.post<AuthTokens>(`${API_BASE_URL}/auth/refresh/`, refreshRequest);

        const newTokens = response.data;
        setTokens(newTokens);

        // Update header with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        }

        processQueue(null, newTokens.access);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
