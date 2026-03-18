import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { logout, setCredentials } from '../store/slices/authSlice';
import { authService } from '../features/auth/api/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important if backend uses HttpOnly cookies for refresh token
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void; }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach access token from Redux store
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Access token from Redux store
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and Token Refresh logic
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and it's not the refresh token endpoint itself
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {

      if (isRefreshing) {
        // If already refreshing, queue the request until refresh completes
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the specific refresh-token Java endpoint using the RefreshTokenRequest schema
        const response = await authService.refreshToken({ refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response;

        // Update tokens in Redux and localStorage
        const user = store.getState().auth.user;
        if (user) {
          store.dispatch(setCredentials({
            user,
            tokens: {
              accessToken,
              refreshToken: newRefreshToken || refreshToken,
              tokenType: 'Bearer' // Assume Bearer since it's standard or extract if backend sends it varying
            }
          }));
        }

        // Process queued requests with the new token
        processQueue(null, accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as AxiosError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Pass through other errors
    return Promise.reject(error);
  }
);

export default axiosClient;
