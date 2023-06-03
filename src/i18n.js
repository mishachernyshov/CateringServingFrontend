import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import moment from 'moment';

import TRANSLATIONS_UK from './translations/uk';
import TRANSLATIONS_EN from './translations/en';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
          uk: {translation: TRANSLATIONS_UK},
          en: {translation: TRANSLATIONS_EN},
        },
        interpolation: {
            format: function(value, format, lng) {
                if (format === 'uppercase') return value.toUpperCase();
                if(value instanceof Date) return moment(value).format(format);
                return value;
            }
        }
    });

export default i18n;
