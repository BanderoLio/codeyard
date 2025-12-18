import { apiClient } from '@/lib/api-client';
import type { TAuthorization } from './types/authorization.type';
import type { TLogin } from './types/login.type';
import type { TRegister } from './types/register.type';
import type { TUser } from './types/user.type';

type LoginResponse = {
  access: string;
};

export const authApi = {
  login: async (data: TLogin): Promise<TAuthorization> => {
    const response = await apiClient.post<
      LoginResponse,
      '/api/auth/login/',
      TLogin
    >('/api/auth/login/', data);
    return {
      accessToken: response.data.access,
    };
  },

  register: async (data: TRegister): Promise<TAuthorization> => {
    const response = await apiClient.post<
      LoginResponse,
      '/api/auth/register/',
      TRegister
    >('/api/auth/register/', data);
    return {
      accessToken: response.data.access,
    };
  },

  logout: async (): Promise<void> => {
    await apiClient.post<void, '/api/auth/logout/'>('/api/auth/logout/');
  },

  refresh: async (): Promise<TAuthorization> => {
    const response = await apiClient.post<LoginResponse, '/api/auth/refresh/'>(
      '/api/auth/refresh/',
    );
    return {
      accessToken: response.data.access,
    };
  },

  getMe: async (): Promise<TUser> => {
    const response = await apiClient.get<TUser, '/api/users/me/'>(
      '/api/users/me/',
    );
    return response.data;
  },
};
