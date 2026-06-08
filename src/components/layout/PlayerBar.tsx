import { usePlayerStore } from '@/stores/player'

export function PlayerBar() {
  const { videoId, title, clear } = usePlayerStore()

  if (!videoId) return null

  return (
    <div className="fixed bottom-0 left-60 right-0 z-50 glass border-t border-[var(--border)] p-2 flex items-center gap-3">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0`}
        className="w-16 h-10 rounded shrink-0"
      />
      <span className="text-sm text-[var(--text)] truncate flex-1">{title}</span>
      <button onClick={clear} className="text-[var(--text-3)] hover:text-[var(--text)] text-xs px-2">✕</button>
    </div>
  )
}
