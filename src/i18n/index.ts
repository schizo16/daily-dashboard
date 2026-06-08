import vi from './vi'
import en from './en'

const dictionaries = { vi, en }
let currentLocale: 'vi' | 'en' = 'vi'

export function _(key: string): string {
  return dictionaries[currentLocale]?.[key as keyof typeof vi] ?? key
}

export function setLocale(locale: 'vi' | 'en') {
  currentLocale = locale
}

export function getLocale() {
  return currentLocale
}
