import { useThemeStore } from '@/stores/theme'

export function TopBar() {
  const { theme, toggleTheme, locale, setLocale } = useThemeStore()

  return (
    <header className="fixed left-60 right-0 top-0 z-20 flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/60 backdrop-blur-2xl px-6">
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            placeholder={locale === 'vi' ? 'Tìm kiếm...' : 'Search...'}
            className="w-64 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-4 py-1.5 text-sm outline-none transition-all duration-200 placeholder:text-[var(--text-3)] focus:w-80 focus:border-[var(--accent)]"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-[var(--text-2)] transition-all duration-200 hover:bg-[var(--surface-2)]/80 hover:rotate-12"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
          className="rounded-full px-3 py-1 text-xs font-mono text-[var(--text-2)] transition-all duration-200 hover:bg-[var(--surface-2)]/80"
        >
          {locale === 'vi' ? 'EN' : 'VI'}
        </button>
      </div>
    </header>
  )
}
