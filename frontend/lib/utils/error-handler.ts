import type { AxiosError } from 'axios';

/**
 * Extracts error message from various error types.
 * Note: For translated error messages, use this function within a component
 * that has access to translations, or pass the default message through translations.
 */
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
  // This default message should be translated at the call site
  return 'An unexpected error occurred';
}
