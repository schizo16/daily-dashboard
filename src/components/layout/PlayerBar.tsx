import { cn } from '@/lib/utils'
import { usePlayerStore } from '@/stores/player'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function PlayerBar() {
  const { videoId, title, artist, playing, currentTime, duration, volume, loop, shuffle, setVolume, toggleLoop, toggleShuffle, next, prev, clear, queue } = usePlayerStore()
  const { play, pause, seek } = useYouTubePlayer('yt-player-bar')

  if (!videoId) return null

  return (
    <div className="fixed bottom-0 left-60 right-0 z-50 bg-[var(--surface)] border-t border-[var(--border)] px-4 py-3">
      <div id="yt-player-bar" className="hidden" />

      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[var(--text)] truncate">{title}</div>
          {artist && <div className="text-xs text-[var(--text-2)] truncate">{artist}</div>}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={toggleShuffle} className={cn('p-1.5 rounded text-xs transition-colors', shuffle ? 'text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]')}>🔀</button>
          <button onClick={prev} className="p-1.5 rounded text-sm text-[var(--text-2)] hover:text-[var(--text)]">⏮</button>
          <button onClick={() => playing ? pause() : play()} className="p-2 rounded text-lg text-[var(--text)] hover:bg-[var(--surface-2)]">{playing ? '⏸' : '▶'}</button>
          <button onClick={next} className="p-1.5 rounded text-sm text-[var(--text-2)] hover:text-[var(--text)]">⏭</button>
          <button onClick={toggleLoop} className={cn('p-1.5 rounded text-xs transition-colors', loop > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]')}>
            {loop === 2 ? '🔂' : '🔁'}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 min-w-0 flex-1 max-w-xs">
          <span className="text-xs text-[var(--text-3)] font-mono w-8 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={currentTime}
            onChange={e => seek(Number(e.target.value))}
            className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
          />
          <span className="text-xs text-[var(--text-3)] font-mono w-8">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-16 h-1 accent-[var(--accent)] cursor-pointer"
          />
          <span className="text-xs text-[var(--text-3)] font-mono w-8">{Math.round(volume * 100)}%</span>
        </div>

        <button onClick={clear} className="text-xs text-[var(--text-3)] hover:text-[var(--text)]">✕</button>
      </div>
    </div>
  )
}
