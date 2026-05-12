import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import hi from './locales/hi.json'
import kn from './locales/kn.json'
import te from './locales/te.json'
import ta from './locales/ta.json'
import mr from './locales/mr.json'

const savedLang = localStorage.getItem('healix-lang') || 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    kn: { translation: kn },
    te: { translation: te },
    ta: { translation: ta },
    mr: { translation: mr },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'hi', native: 'हिन्दी' },
  { code: 'kn', native: 'ಕನ್ನಡ' },
  { code: 'te', native: 'తెలుగు' },
  { code: 'ta', native: 'தமிழ்' },
  { code: 'mr', native: 'मराठी' },
]

export default i18n
