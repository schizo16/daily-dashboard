import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { GlassCard } from '@/components/shared/GlassCard'
import { useThemeStore } from '@/stores/theme'
import { formatDate, formatTime } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { _ } from '@/i18n'

function useWeather() {
  const [data, setData] = useState<{ temp: number; icon: string } | null>(null)
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current_weather=true')
        if (!res.ok) throw new Error()
        const d = await res.json()
        const cw = d.current_weather
        if (!cancelled) {
          const icons = ['☀️','🌤','⛅','🌥','☁️','🌧','🌦','⛈','🌨','🌫']
          setData({ temp: Math.round(cw.temperature), icon: icons[cw.weathercode <= 1 ? 0 : cw.weathercode <= 2 ? 1 : cw.weathercode <= 3 ? 2 : cw.weathercode <= 4 ? 3 : cw.weathercode <= 10 ? 5 : cw.weathercode <= 20 ? 6 : cw.weathercode <= 30 ? 7 : cw.weathercode <= 40 ? 8 : 9] })
        }
      } catch { if (!cancelled) setData(null) }
    }
    load()
    return () => { cancelled = true }
  }, [])
  return data
}

export default function Home() {
  const weather = useWeather()
  const { locale } = useThemeStore()
  const [time, setTime] = useState(new Date())
  const [notes, setNotes] = useState(storage.get('notes', ''))


  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => { storage.set('notes', notes) }, [notes])

  const hour = time.getHours()
  const greeting = locale === 'vi'
    ? hour < 12 ? 'Chào buổi sáng. ☀️' : hour < 18 ? 'Chào buổi chiều. 🌤' : 'Chào buổi tối. 🌙'
    : hour < 12 ? 'Good morning. ☀️' : hour < 18 ? 'Good afternoon. 🌤' : 'Good evening. 🌙'

  const colors = ['#1c1c1e', '#2c2c2e', '#3a3a3c', '#0a84ff', '#636366']

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 24 }}>
        <div className="text-center py-12">
          <div className="font-mono text-xs text-[var(--text-3)] tracking-[0.4em] mb-4">✦</div>
          <div className="font-mono text-5xl font-medium text-[var(--text)] tracking-wide mb-1">{formatTime(time)}</div>
          <div className="text-sm text-[var(--text-2)] mb-1">{formatDate(time, locale)}</div>
          {weather && <div className="text-sm text-[var(--text-2)] flex items-center justify-center gap-1.5">{weather.icon} <span className="font-medium text-[var(--text)]">{weather.temp}°C</span></div>}
          <p className="text-base text-[var(--text-2)] mt-4">{greeting}</p>
          <p className="text-sm text-[var(--text-2)] max-w-md mx-auto mt-2">{_('heroDesc')}</p>
        </div>
      </motion.div>

      <GlassCard className="text-center">
        <input placeholder={locale === 'vi' ? 'Tìm kiếm Google...' : 'Search Google...'}
          className="w-full max-w-sm rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-[var(--text-3)] focus:border-[var(--accent)] focus:w-80 text-center"
          onKeyDown={(e) => { if (e.key === 'Enter') { const val = (e.target as HTMLInputElement).value.trim(); if (val) window.open('https://www.google.com/search?q=' + encodeURIComponent(val), '_blank') } }}
        />
      </GlassCard>

      <GlassCard>
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-xs text-[var(--text-3)]">{_('quickNotes')}</span>
          <button onClick={() => { setNotes(''); storage.remove('notes') }} className="font-mono text-xs text-[var(--text-3)] bg-none border-none cursor-pointer hover:text-[var(--text-2)]">{_('clear')}</button>
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-y rounded border border-[var(--border)] bg-[var(--surface)] p-2.5 text-sm text-[var(--text-2)] outline-none transition-colors focus:border-[var(--accent)] focus:text-[var(--text)] font-mono" rows={4}
          placeholder={locale === 'vi' ? 'Ghi chú nhanh...' : 'Quick notes...'}
        />
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        {[
          { to: '/radar', icon: '📡', title: _('tileRadarTitle'), desc: _('tileRadarDesc') },
          { to: '/movies', icon: '🎬', title: _('tileMoviesTitle'), desc: _('tileMoviesDesc') },
          { to: '/games', icon: '🎮', title: _('tileGamesTitle'), desc: _('tileGamesDesc') },
          { to: '/watchlist', icon: '🔖', title: _('tileWatchlistTitle'), desc: _('tileWatchlistDesc') },
        ].map((tile, i) => (
          <motion.div key={tile.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 200, damping: 24 }}>
            <Link to={tile.to}
              className="block glass rounded-[var(--radius)] p-5 no-underline transition-all duration-300 hover:bg-[var(--surface-2)]/80 hover:-translate-y-0.5 hover:shadow-lg group">
              <div className="text-lg mb-2.5">{tile.icon}</div>
              <div className="text-sm font-semibold text-[var(--text)] mb-1.5">{tile.title}</div>
              <div className="font-mono text-xs text-[var(--text-2)] leading-relaxed">{tile.desc}</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
