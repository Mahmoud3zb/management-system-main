import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiErrorResponse {
  message: string;
  status?: number;
  errors?: any[];
  data?: any;
}

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig | undefined;

    // Trigger automatic refresh only on 401 Unauthorized for non-auth-refresh requests that haven't been retried yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh &&
      !originalRequest.url?.includes("/api/auth/refresh") &&
      !originalRequest.url?.includes("/api/auth/login")
    ) {
      if (isRefreshing) {
        // Queue concurrent requests while token refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Invoke backend refresh endpoint using HttpOnly cookie credentials
        await apiClient.post(
          "/api/auth/refresh",
          {},
          { _skipAuthRefresh: true } as CustomInternalAxiosRequestConfig
        );

        // Resolve queued requests
        processQueue(null);

        // Retry original failed request with exact preserved configuration (method, URL, params, body)
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, reject all queued requests
        processQueue(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Format error response as existing frontend components expect
    const formattedError: ApiErrorResponse = {
      message: error.response?.data?.message || error.message || "An unexpected error occurred",
      status: error.response?.status,
      errors: error.response?.data?.errors,
      data: error.response?.data,
    };

    if (!error.response) {
      formattedError.message = "Network error: Unable to connect to the backend server.";
    }

    return Promise.reject(formattedError);
  }
);

export default apiClient;
