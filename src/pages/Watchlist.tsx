import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from '@/components/shared/GlassCard'
import { _ } from '@/i18n'

interface WatchlistItem {
  id: number
  title: string
  poster: string | null
  rating: number
  addedAt: number
  overview: string
}

function getWatchlist(): WatchlistItem[] {
  try {
    return JSON.parse(localStorage.getItem('dd_watchlist') || '[]')
  } catch {
    return []
  }
}

function removeFromWatchlist(id: number) {
  const list = JSON.parse(localStorage.getItem('dd_watchlist') || '[]')
  localStorage.setItem('dd_watchlist', JSON.stringify(list.filter((m: any) => m.id !== id)))
}

function formatDate(ts: number) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Watchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(getWatchlist)

  function handleRemove(id: number) {
    removeFromWatchlist(id)
    setItems(prev => prev.filter(m => m.id !== id))
  }

  if (items.length === 0) {
    return (
      <GlassCard className="text-center py-8">
        <p className="text-[var(--text-2)]">
          {_('nothingSavedBrowse')}{' '}
          <Link to="/movies" className="text-[var(--accent)] underline underline-offset-2">
            {_('movies')}
          </Link>
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-3">
      {items.map(movie => (
        <GlassCard key={movie.id} className="flex gap-4 p-4 items-start">
          {movie.poster ? (
            <img
              src={`https://image.tmdb.org/t/p/w92${movie.poster}`}
              alt={movie.title}
              className="w-16 h-24 rounded object-cover shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-24 rounded bg-[var(--surface-2)] shrink-0 flex items-center justify-center text-[var(--text-3)] text-xs">
              —
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-[var(--text)] truncate">{movie.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-[var(--accent)]">★ {movie.rating.toFixed(1)}</span>
              <span className="text-xs text-[var(--text-2)]">{formatDate(movie.addedAt)}</span>
            </div>
            {movie.overview && (
              <p className="text-xs text-[var(--text-2)] mt-1 line-clamp-2">{movie.overview}</p>
            )}
          </div>
          <button
            onClick={() => handleRemove(movie.id)}
            className="shrink-0 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer mt-1"
          >
            {_('remove')}
          </button>
        </GlassCard>
      ))}
    </div>
  )
}
