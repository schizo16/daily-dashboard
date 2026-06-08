import { useEffect, useState } from 'react'
import { _ } from '@/i18n'
import { GlassCard } from '@/components/shared/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { Movie } from '@/types'

interface MovieDetail extends Movie {
  genres: { id: number; name: string }[]
  runtime: number
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[]
  }
}

type Period = 'week' | 'month' | 'year' | 'top_rated'

const periods: Period[] = ['week', 'month', 'year', 'top_rated']
const API_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w185'

function apiKey() {
  return import.meta.env.VITE_TMDB_KEY || ''
}

function getUrl(period: Period): string {
  const key = apiKey()
  switch (period) {
    case 'week':
    case 'month':
      return `${API_BASE}/trending/movie/${period}?api_key=${key}&language=en-US`
    case 'year':
      return `${API_BASE}/discover/movie?sort_by=vote_average.desc&vote_count.gte=200&api_key=${key}&language=en-US`
    case 'top_rated':
      return `${API_BASE}/movie/top_rated?api_key=${key}&language=en-US`
  }
}

function getYear(date: string) {
  return date ? date.slice(0, 4) : ''
}

function isInWatchlist(id: number): boolean {
  return (storage.get<number[]>('watchlist', [])).includes(id)
}

export default function Movies() {
  const [period, setPeriod] = useState<Period>('week')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [detailMovie, setDetailMovie] = useState<MovieDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [, forceRender] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    async function load() {
      try {
        const res = await fetch(getUrl(period))
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!cancelled) {
          setMovies(json.results ?? [])
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [period, retryKey])

  function openDetail(movie: Movie) {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailMovie(null)

    fetch(`${API_BASE}/movie/${movie.id}?api_key=${apiKey()}&language=en-US&append_to_response=credits`)
      .then(res => res.json())
      .then(data => {
        setDetailMovie(data)
        setDetailLoading(false)
      })
      .catch(() => {
        setDetailLoading(false)
      })
  }

  function toggleWatchlist(id: number) {
    const list = storage.get<number[]>('watchlist', [])
    const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
    storage.set('watchlist', next)
    forceRender(n => n + 1)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {periods.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
              period === p
                ? 'bg-[var(--accent)] text-white'
                : 'bg-transparent border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--text-2)]'
            )}
          >
            {p === 'week' && _('week')}
            {p === 'month' && _('month')}
            {p === 'year' && _('year')}
            {p === 'top_rated' && _('topRated')}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <GlassCard key={i} className="p-0 overflow-hidden">
              <Skeleton className="aspect-[2/3] w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {error && !loading && (
        <GlassCard className="text-center py-8">
          <p className="text-[var(--text-2)] mb-3">{_('failed')}</p>
          <Button variant="outline" onClick={() => setRetryKey(k => k + 1)}>
            {_('retry')}
          </Button>
        </GlassCard>
      )}

      {!loading && !error && (
        <>
          {movies.length === 0 ? (
            <GlassCard className="text-center py-8">
              <p className="text-[var(--text-2)]">{_('nothingSaved')}</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {movies.map(movie => {
                const saved = isInWatchlist(movie.id)
                return (
                  <GlassCard
                    key={movie.id}
                    className="p-0 overflow-hidden cursor-pointer group"
                    onClick={() => openDetail(movie)}
                  >
                    <div className="relative">
                      {movie.poster_path ? (
                        <img
                          src={`${IMG_BASE}${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full aspect-[2/3] object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-3)] text-xs">
                          {_('noPoster')}
                        </div>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); toggleWatchlist(movie.id) }}
                        className={cn(
                          'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-200 cursor-pointer',
                          saved
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-black/40 text-white/80 hover:bg-black/60 opacity-0 group-hover:opacity-100'
                        )}
                      >
                        {saved ? '✓' : '+'}
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-[var(--text)] truncate">{movie.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-[var(--text-2)]">{getYear(movie.release_date)}</span>
                        <span className="text-xs text-[var(--accent)]">★ {movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {detailLoading ? (
            <div className="space-y-4 p-2">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="w-24 h-36 rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          ) : detailMovie ? (
            <>
              <DialogTitle className="text-lg font-semibold text-[var(--text)]">
                {detailMovie.title}
                <span className="text-[var(--text-2)] font-normal ml-1">
                  ({getYear(detailMovie.release_date)})
                </span>
              </DialogTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                {detailMovie.poster_path ? (
                  <img
                    src={`${IMG_BASE}${detailMovie.poster_path}`}
                    alt={detailMovie.title}
                    className="w-28 h-auto rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-28 h-42 bg-[var(--surface-2)] rounded flex items-center justify-center text-[var(--text-3)] text-xs shrink-0">
                    {_('noPoster')}
                  </div>
                )}
                <div className="space-y-2 text-sm flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[var(--accent)] font-medium">
                      ★ {detailMovie.vote_average.toFixed(1)}
                    </span>
                    {detailMovie.runtime > 0 && (
                      <span className="text-[var(--text-2)]">{detailMovie.runtime} {_('min')}</span>
                    )}
                  </div>
                  {detailMovie.genres && detailMovie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {detailMovie.genres.map(g => (
                        <span
                          key={g.id}
                          className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-2)]"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {detailMovie.overview && (
                    <p className="text-[var(--text-2)] leading-relaxed">{detailMovie.overview}</p>
                  )}
                  {detailMovie.credits?.cast && detailMovie.credits.cast.length > 0 && (
                    <div>
                      <p className="text-[var(--text-3)] text-xs font-medium mb-0.5">{_('cast')}</p>
                      <p className="text-[var(--text-2)] text-xs leading-relaxed">
                        {detailMovie.credits.cast.slice(0, 8).map(c => c.name).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  variant={isInWatchlist(detailMovie.id) ? 'outline' : 'default'}
                  onClick={() => toggleWatchlist(detailMovie.id)}
                >
                  {isInWatchlist(detailMovie.id) ? _('remove') : _('save')}
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
