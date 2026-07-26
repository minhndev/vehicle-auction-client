import { format, parseISO } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import i18n from '../i18n/config';

// Map i18next language tags to date-fns locale objects
const locales: Record<string, Locale> = {
  en: enUS,
  vi: vi,
};

/**
 * Robust date formatting utility supporting ISO strings, Date objects, and numeric timestamps.
 * Standard format: dd/MM/yyyy
 */
export const formatDate = (
  dateInput: string | number | Date | null | undefined,
  formatString: string = 'dd/MM/yyyy'
): string => {
  if (!dateInput) return '';

  try {
    const dateObj = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    
    // Fallback gracefully if parsing creates an invalid date
    if (isNaN(dateObj.getTime())) return '';

    const currentLang = i18n.language || 'vi'; // Fallback to explicitly 'vi'
    const locale = locales[currentLang.split('-')[0]] || vi;

    return format(dateObj, formatString, { locale });
  } catch (err) {
    console.error('Date parsing error: ', err);
    return ''; // Return an empty string or generic placeholder on crash
  }
};
