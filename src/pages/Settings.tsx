import { Sun, Moon } from 'lucide-react'
import { GlassCard } from '@/components/shared/GlassCard'
import { useThemeStore } from '@/stores/theme'

export default function Settings() {
  const { theme, locale, toggleTheme, setLocale } = useThemeStore()

  const apiKeys = [
    { label: 'VITE_TMDB_KEY', value: import.meta.env.VITE_TMDB_KEY || 'not set' },
    { label: 'VITE_GEMINI_KEY', value: import.meta.env.VITE_GEMINI_KEY || 'not set' },
    { label: 'VITE_YT_KEY', value: import.meta.env.VITE_YT_KEY || 'not set' },
  ]

  return (
    <div className="space-y-5">
      <GlassCard>
        <h2 className="font-mono text-xs text-[var(--text-3)] tracking-widest mb-4 uppercase">Theme</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-[var(--accent)]" />
            ) : (
              <Sun className="w-5 h-5 text-[var(--accent)]" />
            )}
            <span className="text-sm text-[var(--text)] font-medium">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white bg-[var(--accent)] hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            Toggle
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="font-mono text-xs text-[var(--text-3)] tracking-widest mb-4 uppercase">Language / Locale</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text)] font-medium">
            {locale === 'vi' ? 'Tiếng Việt' : 'English'}
          </span>
          <button
            onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white bg-[var(--accent)] hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            Toggle
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="font-mono text-xs text-[var(--text-3)] tracking-widest mb-4 uppercase">API Keys</h2>
        <div className="space-y-3">
          {apiKeys.map((k) => (
            <div key={k.label}>
              <div className="text-xs text-[var(--text-2)] mb-1">{k.label}</div>
              <input
                readOnly
                value={k.value}
                className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-mono text-[var(--text)] outline-none"
              />
              <div className="text-xs text-[var(--text-3)] mt-1">Set in .env file</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="font-mono text-xs text-[var(--text-3)] tracking-widest mb-4 uppercase">About</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text-2)]">App</span>
            <span className="text-sm text-[var(--text)] font-medium">Atlas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text-2)]">Version</span>
            <span className="text-sm text-[var(--text)] font-medium">2.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text-2)]">Tagline</span>
            <span className="text-sm text-[var(--text)] font-medium">Vanilla JS → React + Tailwind + shadcn/ui</span>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
