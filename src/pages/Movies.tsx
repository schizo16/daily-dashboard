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

type Period = 'week' | 'month' | 'top_rated'

const periods: Period[] = ['week', 'month', 'top_rated']
const API_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w185'

function apiKey() {
  return import.meta.env.VITE_TMDB_KEY || ''
}

function getUrl(period: Period, type: 'movie' | 'tv' = 'movie', page = 1): string {
  const key = apiKey()
  switch (period) {
    case 'week':
      return `${API_BASE}/trending/${type}/week?api_key=${key}&language=en-US&page=${page}`
    case 'month': {
      const d = new Date()
      const from = new Date(d.getFullYear(), d.getMonth() - 1, d.getDate()).toISOString().slice(0, 10)
      const to = d.toISOString().slice(0, 10)
      const dateField = type === 'tv' ? 'first_air_date' : 'release_date'
      return `${API_BASE}/discover/${type}?api_key=${key}&language=en-US&sort_by=popularity.desc&${dateField}.gte=${from}&${dateField}.lte=${to}&vote_count.gte=50&page=${page}`
    }
    case 'top_rated':
      return `${API_BASE}/${type}/top_rated?api_key=${key}&language=en-US&page=${page}`
  }
}

function getYear(date: string) {
  return date ? date.slice(0, 4) : ''
}

function normalizeItem(item: any, type: 'movie' | 'tv'): Movie {
  return {
    id: item.id,
    title: type === 'tv' ? item.name : item.title,
    poster_path: item.poster_path,
    vote_average: item.vote_average,
    overview: item.overview,
    release_date: type === 'tv' ? item.first_air_date : item.release_date,
    genre_ids: item.genre_ids || [],
  }
}

interface WatchlistItem { id: number; title: string; poster: string; rating: number; addedAt: number; overview: string }

function getWatchlist(): WatchlistItem[] {
  return storage.get<WatchlistItem[]>('watchlist', [])
}
function setWatchlist(list: WatchlistItem[]) {
  storage.set('watchlist', list)
}
function isInWatchlist(id: number): boolean {
  return getWatchlist().some(m => m.id === id)
}

export default function Movies() {
  const [period, setPeriod] = useState<Period>('week')
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [page, setPage] = useState(1)
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
        const res = await fetch(getUrl(period, mediaType, page))
        if (!res.ok) throw new Error()
        const json = await res.json()
        if (!cancelled) {
          setMovies((json.results ?? []).map((r: any) => normalizeItem(r, mediaType)))
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
  }, [period, mediaType, page, retryKey])

  function openDetail(movie: Movie, type: 'movie' | 'tv') {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailMovie(null)

    fetch(`${API_BASE}/${type}/${movie.id}?api_key=${apiKey()}&language=en-US&append_to_response=credits`)
      .then(res => res.json())
      .then(data => setDetailMovie(data))
      .catch(() => null)
      .finally(() => setDetailLoading(false))
  }

  function toggleWatchlist(movie: Movie) {
    const list = getWatchlist()
    if (list.some(m => m.id === movie.id)) {
      setWatchlist(list.filter(m => m.id !== movie.id))
    } else {
      setWatchlist([...list, { id: movie.id, title: movie.title, poster: movie.poster_path, rating: movie.vote_average, addedAt: Date.now(), overview: movie.overview }])
    }
    forceRender(n => n + 1)
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMediaType('movie')} className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-all', mediaType === 'movie' ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>Movies</button>
        <button onClick={() => setMediaType('tv')} className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-all', mediaType === 'tv' ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] text-[var(--text-2)]')}>TV Series</button>
      </div>
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
            {p === 'top_rated' && _('topRated')}
          </button>
        ))}
      </div>

      {loading && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {movies.map(movie => {
                const saved = isInWatchlist(movie.id)
                return (
                  <GlassCard
                    key={movie.id}
                    className="p-0 overflow-hidden cursor-pointer group"
                    onClick={() => openDetail(movie, mediaType)}
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
                        onClick={e => { e.stopPropagation(); toggleWatchlist(movie) }}
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
                    <div className="bg-[var(--surface)]/95 p-2">
                      <h3 className="text-xs font-medium text-[var(--text)] truncate">{movie.title}</h3>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-[var(--text-2)]">{getYear(movie.release_date)}</span>
                        <span className="text-[10px] text-[var(--accent)]">★ {movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded text-xs font-mono border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:cursor-default transition-all">←</button>
            <span className="text-xs text-[var(--text-3)] font-mono">{page}</span>
            <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded text-xs font-mono border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-all">→</button>
          </div>
        </>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-[var(--surface)]">
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
                  onClick={() => toggleWatchlist({ id: detailMovie.id, title: detailMovie.title, poster_path: detailMovie.poster_path, vote_average: detailMovie.vote_average, overview: detailMovie.overview, release_date: detailMovie.release_date, genre_ids: detailMovie.genres?.map(g => g.id) || [] } as Movie)}
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
