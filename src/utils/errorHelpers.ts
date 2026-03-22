// Helper utility to extract standard Java Spring Boot AppException error codes / messages
import { AxiosError } from 'axios';
import type { AppExceptionResponse } from '../types/auth.types';
import i18n from '../i18n/config';

export const getErrorMessage = (error: unknown, defaultMessage: string = i18n.t('errors:fallback')): string => {
  if (isAxiosError(error) && error.response?.data) {
    const raw = typeof error.response.data === 'string'
      ? error.response.data
      : JSON.stringify(error.response.data);
    const normalizedRaw = raw.toLowerCase();

    if (
      normalizedRaw.includes('accounts_email_key') ||
      normalizedRaw.includes('duplicate key value violates unique constraint') ||
      (normalizedRaw.includes('email') && normalizedRaw.includes('already exists'))
    ) {
      return 'Email đã tồn tại. Vui lòng dùng email khác hoặc đăng nhập.';
    }

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

  if (isAxiosError(error)) {
    const msg = String(error.message || '').toLowerCase();
    if (
      msg.includes('accounts_email_key') ||
      msg.includes('duplicate key value violates unique constraint') ||
      (msg.includes('email') && msg.includes('already exists'))
    ) {
      return 'Email đã tồn tại. Vui lòng dùng email khác hoặc đăng nhập.';
    }
  }

  if (isAxiosError(error) && error.response?.status) {
    if (error.response.status === 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }

    if (error.response.status === 403) {
      return 'Bạn không có quyền truy cập tài nguyên này (thiếu authority phù hợp).';
    }

    if (error.response.status >= 500) {
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
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
