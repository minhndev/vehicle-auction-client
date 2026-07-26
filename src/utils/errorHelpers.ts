import { AxiosError } from 'axios';
import i18n from '../i18n/config';

export const getErrorMessage = (error: unknown, defaultMessage: string = i18n.t('errors:fallback')): string => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // 1. Check for specific backend error code mapping (e.g., 1001, 1002)
    if (data?.code && i18n.exists(`errors:${data.code}`)) {
      return i18n.t(`errors:${data.code}`);
    }

    // 2. Map known database constraint or substring patterns (before general status)
    const rawData = typeof data === 'string' ? data : JSON.stringify(data || '');
    const msg = (rawData + (error.message || '')).toLowerCase();
    
    if (
      msg.includes('accounts_email_key') ||
      msg.includes('duplicate key value violates unique constraint') ||
      (msg.includes('email') && msg.includes('already exists'))
    ) {
      return i18n.t('errors:1001'); // "Email already exists"
    }

    // 3. Fallback to HTTP status mapping if defined in i18n
    if (status !== undefined && i18n.exists(`errors:status.${status}`)) {
      return i18n.t(`errors:status.${status}`);
    }

    // 4. Default user-friendly messages for standard status codes if not explicitly in i18n status object
    if (status === 401) return i18n.t('errors:status.401');
    if (status === 403) return i18n.t('errors:status.403');
    if (status && status >= 500) return i18n.t('errors:status.500');
  }

  if (error instanceof Error) {
    // We generally don't want to show raw Error.message to end-users as it might be technical
    // but we can log it for devs if needed. For the UI, we'll use the defaultMessage.
    console.error('Handled Error mapping:', error);
  }

  return defaultMessage;
};

// Type guard
function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}
