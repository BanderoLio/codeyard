import type {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import type { Endpoint } from './types';

type ApiClientOptions = {
  headers?: Record<string, string>;
  getAccessToken?: () => string | null;
  onTokenRefresh?: (accessToken: string) => void;
  onUnauthorized?: () => void;
};

class ApiResponse<T> {
  constructor(
    public data: T,
    public status: number,
    public statusText: string,
  ) {}
  static fromAxios<T>(res: AxiosResponse<T>): ApiResponse<T> {
    return new ApiResponse<T>(res.data, res.status, res.statusText);
  }
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  private getAccessToken?: () => string | null;
  private onTokenRefresh?: (accessToken: string) => void;
  private onUnauthorized?: () => void;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor(baseURL: string, options: ApiClientOptions = {}) {
    this.baseURL = baseURL;
    this.getAccessToken = options.getAccessToken;
    this.onTokenRefresh = options.onTokenRefresh;
    this.onUnauthorized = options.onUnauthorized;

    this.axiosInstance = axios.create({
      baseURL,
      headers: options.headers,
      withCredentials: true,
    });

    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken?.();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        const url = originalRequest?.url || '';
        const isAuthEndpoint =
          url.includes('/api/auth/login/') ||
          url.includes('/api/auth/register/') ||
          url.includes('/api/auth/refresh/');

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          // Only attempt refresh if we have an access token
          // If no access token, there's no refresh token in cookie either
          const hasAccessToken = this.getAccessToken?.();
          if (!hasAccessToken) {
            this.onUnauthorized?.();
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshResponse = await axios.post<{ access: string }>(
              `/api/auth/refresh/`,
              {},
              {
                baseURL: this.baseURL,
                withCredentials: true,
              },
            );

            const newAccessToken = refreshResponse.data.access;
            this.onTokenRefresh?.(newAccessToken);

            this.processQueue(null);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.onUnauthorized?.();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });
    this.failedQueue = [];
  }

  async get<T, E extends string>(
    endpoint: Endpoint<E>,
    params?: URLSearchParams,
  ) {
    let url = endpoint as string;
    if (params) {
      url += `?${params.toString()}`;
    }
    return ApiResponse.fromAxios(await this.axiosInstance.get<T>(url));
  }

  async post<T, E extends string, Body = unknown>(
    endpoint: Endpoint<E>,
    body?: Body,
  ) {
    return ApiResponse.fromAxios(
      await this.axiosInstance.post<T>(endpoint, body),
    );
  }

  async patch<T, E extends string, Body = unknown>(
    endpoint: Endpoint<E>,
    body?: Body,
  ) {
    return ApiResponse.fromAxios(
      await this.axiosInstance.patch<T>(endpoint, body),
    );
  }

  async delete<T, E extends string>(endpoint: Endpoint<E>) {
    return ApiResponse.fromAxios(await this.axiosInstance.delete<T>(endpoint));
  }
}

// Создаем экземпляр API client
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

let accessTokenGetter: (() => string | null) | null = null;
let tokenRefreshHandler: ((accessToken: string) => void) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const apiClient = new ApiClient(API_BASE_URL, {
  getAccessToken: () => accessTokenGetter?.() || null,
  onTokenRefresh: (accessToken) => tokenRefreshHandler?.(accessToken),
  onUnauthorized: () => unauthorizedHandler?.(),
});

// Функции для настройки API client из store
export function setAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter;
}

export function setTokenRefreshHandler(handler: (accessToken: string) => void) {
  tokenRefreshHandler = handler;
}

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}
