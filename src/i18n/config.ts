import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all resources
import commonEN from './locales/en/common.json';
import authEN from './locales/en/auth.json';
import validationEN from './locales/en/validation.json';
import errorsEN from './locales/en/errors.json';

import commonVI from './locales/vi/common.json';
import authVI from './locales/vi/auth.json';
import validationVI from './locales/vi/validation.json';
import errorsVI from './locales/vi/errors.json';

const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    validation: validationEN,
    errors: errorsEN,
  },
  vi: {
    common: commonVI,
    auth: authVI,
    validation: validationVI,
    errors: errorsVI,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Vietnamese as default fallback
    supportedLngs: ['vi', 'en'],
    
    // Have a common namespace used around the full app
    ns: ['common', 'auth', 'validation', 'errors'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // persist language setting to localStorage
    }
  });

export default i18n;
