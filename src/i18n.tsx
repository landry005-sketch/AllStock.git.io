import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: {
          "settings": "Paramètres",
          "profile": "Mon Profil",
          "language": "Langue",
          "theme": "Apparence",
          "save": "Enregistrer les paramètres"
        }
      },
      en: {
        translation: {
          "settings": "Settings",
          "profile": "My Profile",
          "language": "Language",
          "theme": "Appearance",
          "save": "Save settings"
        }
      }
    },
    fallbackLng: "fr",
    interpolation: { escapeValue: false }
  });

export default i18n;