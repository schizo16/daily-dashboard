import { create } from 'zustand'

type Theme = 'light' | 'dark'
type Locale = 'vi' | 'en'
type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night'

interface ThemeState {
  theme: Theme
  locale: Locale
  timePeriod: TimePeriod
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setLocale: (l: Locale) => void
  setTimePeriod: (p: TimePeriod) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  locale: 'vi',
  timePeriod: 'night',
  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },
  toggleTheme: () => {
    const isDark = document.documentElement.classList.contains('dark')
    const next = isDark ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', next === 'dark')
    set({ theme: next })
  },
  setLocale: (locale) => set({ locale }),
  setTimePeriod: (timePeriod) => set({ timePeriod }),
}))
