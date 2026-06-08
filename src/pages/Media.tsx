import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlassCard } from '@/components/shared/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { _ } from '@/i18n'

const COUNTRIES = ['US', 'UK', 'Vietnam', 'Japan', 'Korea', 'France', 'Germany', 'Spain', 'Italy', 'Brazil', 'India', 'Australia', 'Canada', 'Russia', 'Thailand', 'China']

const FEATURED = [
  { name: 'US Top Hits', id: 'PL5B692fm6--sk3U4rxgSpnIRzamq8rMJu' },
  { name: 'Lo-Fi', id: 'OLAK5uy_m5Kqtn0kIJx5o4sTzMKnblzAmF9WdqLIw' },
  { name: 'Nhạc Việt', id: 'PLlC3TKS5xHZmf5B9OdKZJqn7Q9HYYPmxB' },
  { name: 'K-Pop', id: 'OLAK5uy_noq0P1qEZbqUMqednKf5TVCw6BNWFe4Cw' },
]

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function Media() {
  const [videoId, setVideoId] = useState('')
  const [playlistId, setPlaylistId] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [country, setCountry] = useState('US')
  const [stations, setStations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStation, setCurrentStation] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<{id: string; title: string; author: string}[]>([])
  const [searching, setSearching] = useState(false)

  async function searchMusic(query: string) {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`https://inv.nadeko.net/api/v1/search?q=${encodeURIComponent(query)}&type=video&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.map((v: any) => ({ id: v.videoId, title: v.title, author: v.author })))
      } else {
        const res2 = await fetch(`https://yewtu.be/api/v1/search?q=${encodeURIComponent(query)}&type=video&limit=5`)
        if (res2.ok) {
          const data = await res2.json()
          setResults(data.map((v: any) => ({ id: v.videoId, title: v.title, author: v.author })))
        }
      }
    } catch {} finally { setSearching(false) }
  }

  function playVideo(url: string) {
    const id = extractVideoId(url)
    if (id) { setVideoId(id); setPlaylistId('') }
  }

  function playPlaylist(id: string) {
    setPlaylistId(id)
    setVideoId('')
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`https://de1.api.radio-browser.info/json/stations/bycountry/${encodeURIComponent(country)}?limit=20`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          const sorted = (data as any[]).sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 20)
          setStations(sorted)
        }
      })
      .catch(() => { if (!cancelled) setStations([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [country])

  return (
    <Tabs defaultValue="music" className="w-full">
      <TabsList className="glass mb-4">
        <TabsTrigger value="music">🎵 Music</TabsTrigger>
        <TabsTrigger value="radio">📻 Radio</TabsTrigger>
      </TabsList>

      <TabsContent value="music">
        <GlassCard>
          {videoId && (
            <div className="mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`}
                allow="autoplay"
                className="w-full aspect-video rounded-lg"
              />
            </div>
          )}
          {playlistId && (
            <div className="mb-4">
              <iframe
                src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&controls=1`}
                allow="autoplay"
                className="w-full aspect-video rounded-lg"
              />
            </div>
          )}
          <div className="flex gap-2 mb-3">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchMusic(searchQuery)}
              placeholder="Search song name..."
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-4 py-2 text-sm outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-3)]"
            />
            <button
              onClick={() => searchMusic(searchQuery)}
              disabled={searching}
              className="px-5 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>
          {results.length > 0 && (
            <div className="space-y-1 mb-4">
              {results.map(v => (
                <button
                  key={v.id}
                  onClick={() => playVideo(`https://youtube.com/watch?v=${v.id}`)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-2)] hover:bg-[var(--surface-2)]/80 transition-colors"
                >
                  <span className="text-[var(--text)] font-medium">{v.title}</span>
                  {v.author && <span className="text-[var(--text-3)] ml-2">— {v.author}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 flex-wrap mb-4">
            {FEATURED.map(f => (
              <button
                key={f.id}
                onClick={() => playPlaylist(f.id)}
                className="px-4 py-1.5 rounded-full border border-[var(--border)] text-sm text-[var(--text-2)] transition-all hover:bg-[var(--surface-2)]/80 hover:text-[var(--text)]"
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="Paste YouTube URL..."
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-4 py-1.5 text-sm outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-3)]"
              onKeyDown={e => e.key === 'Enter' && playVideo(inputUrl)}
            />
            <button
              onClick={() => playVideo(inputUrl)}
              className="px-5 py-1.5 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-85 transition-opacity"
            >
              Play
            </button>
          </div>
        </GlassCard>
      </TabsContent>

      <TabsContent value="radio">
        <GlassCard>
          <div className="flex gap-2 flex-wrap mb-4">
            {COUNTRIES.map(c => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  c === country
                    ? 'bg-[var(--accent)] text-white'
                    : 'border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)]/80'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full rounded" />)}</div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {stations.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStation(s.url)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    currentStation === s.url ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]/80'
                  }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-[var(--text-3)] ml-2">★ {s.votes || 0}</span>
                </button>
              ))}
            </div>
          )}
          {currentStation && (
            <audio controls src={currentStation} autoPlay className="w-full mt-4 rounded-lg" />
          )}
        </GlassCard>
      </TabsContent>
    </Tabs>
  )
}
