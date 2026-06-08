import { Sun, Moon } from 'lucide-react'
import { GlassCard } from '@/components/shared/GlassCard'
import { useThemeStore } from '@/stores/theme'

export default function Settings() {
  const { theme, locale, toggleTheme, setLocale } = useThemeStore()

  const apiKeys = [
    { label: 'TMDB', value: import.meta.env.VITE_TMDB_KEY },
    { label: 'Gemini', value: import.meta.env.VITE_GEMINI_KEY },
    { label: 'YouTube', value: import.meta.env.VITE_YT_KEY },
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
            <div key={k.label} className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-2)]">{k.label}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${k.value ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
                {k.value ? 'Configured' : 'Not set'}
              </span>
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
