// Helper utility to extract standard Java Spring Boot AppException error codes / messages
import { AxiosError } from 'axios';
import type { AppExceptionResponse } from '../types/auth.types';
import i18n from '../i18n/config';

export const getErrorMessage = (error: unknown, defaultMessage: string = i18n.t('errors:fallback')): string => {
  if (isAxiosError(error) && error.response?.data) {
    const appException = error.response.data as AppExceptionResponse;

    // Check if the backend sent a recognizable code/message shape
    if (appException.code && appException.message) {
      // We can map specific codes to user-friendly overrides via i18n if needed
      if (i18n.exists(`errors:${appException.code}`)) {
         return i18n.t(`errors:${appException.code}`);
      }
      return appException.message; // Fall back to the backend's default message if not tracked
    }

    if (
      typeof error.response.data === 'object' &&
      error.response.data !== null &&
      'message' in error.response.data &&
      typeof (error.response.data as Record<string, unknown>).message === 'string'
    ) {
      return (error.response.data as Record<string, string>).message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};

// Type guard
function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}
