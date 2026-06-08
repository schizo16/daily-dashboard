import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlassCard } from '@/components/shared/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerStore } from '@/stores/player'

const SONG_DB = [
  { q: ['blackpink', 'bp'], vid: 'IO14CavZ4no', t: 'BLACKPINK - How You Like That' },
  { q: ['bts', 'bangtan'], vid: 'gdZLi9oWNZg', t: 'BTS - Dynamite' },
  { q: ['son tung', 'sontung', 'son tung mtp'], vid: 'dI3q-rW8bWY', t: 'Sơn Tùng M-TP - Chúng Ta Của Hiện Tại' },
  { q: ['hien ho', 'hienho'], vid: 'bUqVJHwOJgI', t: 'Hiền Hồ - Có Ai Thương Em Đâu' },
  { q: ['lofi', 'lo fi', 'chill'], vid: 'jfKfPfyJRdk', t: 'Lo-Fi Chill Mix' },
  { q: ['edm', 'electronic', 'dance'], vid: '4W6qY0fMk6k', t: 'EDM Dance Mix' },
  { q: ['kpop', 'k-pop', 'k pop'], vid: '4W6qY0fMk6k', t: 'K-Pop Mix' },
  { q: ['jpop', 'j-pop', 'j pop'], vid: 'sXwL65mzLvM', t: 'J-Pop Mix' },
  { q: ['vpop', 'v-pop', 'nhac viet'], vid: 'dI3q-rW8bWY', t: 'V-Pop Mix' },
  { q: ['taylor swift'], vid: 'JGwWNGJdvx8', t: 'Taylor Swift Mix' },
  { q: ['ed sheeran'], vid: 'JGwWNGJdvx8', t: 'Ed Sheeran Mix' },
  { q: ['michael jackson', 'mj'], vid: 'JGwWNGJdvx8', t: 'Michael Jackson Mix' },
]

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

function extractPlaylistId(url: string): string | null {
  const m = url.match(/[&?]list=([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

export default function Media() {
  const { videoId, title, setTrack, clear } = usePlayerStore()
  const [playlistId, setPlaylistId] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [country, setCountry] = useState('US')
  const [stations, setStations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStation, setCurrentStation] = useState('')

  async function searchAndPlay(query: string) {
    if (!query.trim()) return
    const lower = query.toLowerCase().trim()

    const playlist = extractPlaylistId(query)
    if (playlist) { playPlaylist(playlist); return }

    const vid = extractVideoId(query)
    if (vid) { playVideo(query); return }

    setSearching(true)
    const match = SONG_DB.find(s => s.q.some(k => lower.includes(k)))
    if (match) {
      setSearchQuery(match.t)
      setPlaylistId('')
      setTrack(match.vid, match.t)
      setSearching(false)
      return
    }

    const key = import.meta.env.VITE_YT_KEY
    if (key) {
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${key}`)
        if (res.ok) {
          const d = await res.json()
          const foundVid = d?.items?.[0]?.id?.videoId
          if (foundVid) { setPlaylistId(''); setTrack(foundVid, query); setSearching(false); return }
        }
      } catch {}
    }

    window.open('https://music.youtube.com/search?q=' + encodeURIComponent(query), '_blank')
    setSearching(false)
  }

  function playVideo(url: string) {
    const id = extractVideoId(url)
    if (id) { setTrack(id, url); setPlaylistId('') }
  }

  function playPlaylist(id: string) {
    setPlaylistId(id)
    clear()
  }

  useEffect(() => {
    if (!playlistId) return
    let cancelled = false
    const key = import.meta.env.VITE_YT_KEY
    if (!key) return
    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${key}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!cancelled && d?.items) {
          const first = d.items[0]?.snippet?.resourceId?.videoId
          if (first) setTrack(first, d.items[0]?.snippet?.title || 'Playlist')
        }
      })
      .catch(() => null)
    return () => { cancelled = true }
  }, [playlistId])

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
          {(videoId || playlistId) && (
            <div className="mb-4 flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)]">
              <span className="text-2xl">🎵</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text)] truncate">Now Playing</div>
                <div className="text-xs text-[var(--text-2)] truncate">{title || (playlistId ? 'Playlist' : '')}</div>
              </div>
              <button onClick={clear} className="text-xs text-[var(--text-3)] hover:text-[var(--text)]">✕</button>
            </div>
          )}
          <div className="flex gap-2 mb-3">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') searchAndPlay(searchQuery) }}
              placeholder="Search any song or artist..."
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-4 py-2 text-sm outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-3)]"
            />
            <button
              onClick={() => searchAndPlay(searchQuery)}
              disabled={searching}
              className="px-5 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-50"
            >
              {searching ? '...' : '🔍 Play'}
            </button>
          </div>
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
              placeholder="Or paste YouTube URL..."
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-4 py-1.5 text-sm outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-3)]"
              onKeyDown={e => { if (e.key === 'Enter') playVideo(inputUrl) }}
            />
            <button
              onClick={() => playVideo(inputUrl)}
              className="px-5 py-1.5 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-85 transition-opacity"
            >
              Play
            </button>
          </div>
          <div className="text-xs text-[var(--text-3)] mt-2">🔍 Search → auto match + play. Supports YouTube URLs, playlists, và keyword</div>
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
