// i18n setup for Meridian — pt-BR as default language
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English locales
import enCommon from './locales/en/common.json';
import enPanels from './locales/en/panels.json';
import enOffice from './locales/en/office.json';
import enNav from './locales/en/nav.json';
import enKanban from './locales/en/kanban.json';
import enSettings from './locales/en/settings.json';

// Portuguese (Brazil) locales
import ptBRCommon from './locales/pt-BR/common.json';
import ptBRPanels from './locales/pt-BR/panels.json';
import ptBROffice from './locales/pt-BR/office.json';
import ptBRNav from './locales/pt-BR/nav.json';
import ptBRKanban from './locales/pt-BR/kanban.json';
import ptBRSettings from './locales/pt-BR/settings.json';

i18n.use(initReactI18next).init({
  lng: 'pt-BR',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'panels', 'office', 'nav', 'kanban', 'settings'],
  resources: {
    en: {
      common: enCommon,
      panels: enPanels,
      office: enOffice,
      nav: enNav,
      kanban: enKanban,
      settings: enSettings,
    },
    'pt-BR': {
      common: ptBRCommon,
      panels: ptBRPanels,
      office: ptBROffice,
      nav: ptBRNav,
      kanban: ptBRKanban,
      settings: ptBRSettings,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
