import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';

import enTranslation from './locales/en.json';
import frTranslation from './locales/fr.json';
import arTranslation from './locales/ar.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

const savedLanguage = localStorage.getItem('language') || Cookies.get('language') || 'fr';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie'],
    },
  });

export default i18n;
