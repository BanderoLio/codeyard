import type { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<{
      detail?: string;
      message?: string;
    }>;
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      if (typeof data === 'string') {
        return data;
      }
      if (data.detail) {
        return data.detail;
      }
      if (data.message) {
        return data.message;
      }
      if (typeof data === 'object' && 'error' in data) {
        return String(data.error);
      }
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}
