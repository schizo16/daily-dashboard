import { esc } from '@/lib/utils'

interface EntryProps {
  icon: string
  title: string
  url?: string
  meta?: string
  onRead?: () => void
}

export function Entry({ icon, title, url, meta, onRead }: EntryProps) {
  return (
    <div className="flex gap-3 items-start py-3.5 transition-all duration-200 hover:bg-[var(--surface-2)]/80 hover:-mx-2 hover:px-2 rounded-sm">
      <div className="w-10 h-10 rounded flex items-center justify-center bg-[var(--surface-2)] flex-shrink-0 text-sm mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold leading-snug">
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:text-[var(--accent)]">
              {esc(title)}
            </a>
          ) : (
            esc(title)
          )}
        </div>
        {meta && (
          <div className="font-mono text-xs text-[var(--text-3)] mt-1.5 flex gap-3.5">
            {meta}
          </div>
        )}
      </div>
      {onRead && (
        <button
          onClick={onRead}
          className="font-mono text-xs text-[var(--text-3)] bg-none border-none cursor-pointer hover:text-[var(--accent)] self-start mt-1 whitespace-nowrap"
        >
          📖 Đọc
        </button>
      )}
    </div>
  )
}
