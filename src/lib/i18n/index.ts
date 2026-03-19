// i18n setup for Meridian office/analytics components
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enPanels from './locales/en/panels.json';
import enOffice from './locales/en/office.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  resources: {
    en: {
      common: enCommon,
      panels: enPanels,
      office: enOffice,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
