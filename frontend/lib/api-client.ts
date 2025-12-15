import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';

type Endpoint<S extends string> = S extends `/${infer _}` ? S : `/${S}`;

type ApiClientOptions = {
  headers?: Record<string, string>;
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

// Possible to add configs
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  constructor(baseURL: string, options: ApiClientOptions) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      headers: options.headers,
    });
  }
  async get<T, E extends string>(
    endpoint: Endpoint<E>,
    params?: URLSearchParams,
  ) {
    let url = `${this.baseURL}${endpoint}`;
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
