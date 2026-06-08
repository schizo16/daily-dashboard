import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', icon: '📡', label: 'Radar' },
  { to: '/movies', icon: '🎬', label: 'Movies' },
  { to: '/games', icon: '🎮', label: 'Games' },
  { to: '/watchlist', icon: '🔖', label: 'Saved' },
  { to: '/media', icon: '🎵', label: 'Media' },
  { to: '/tools', icon: '🧰', label: 'Tools' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-2xl">
      <div className="flex items-center gap-2 px-5 pt-5 pb-6">
        <span className="text-lg">◆</span>
        <span className="font-semibold tracking-tight">Atlas</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map(({ to, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
              'hover:bg-[var(--surface-2)]/80',
              isActive
                ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium'
                : 'text-[var(--text-2)]'
            )}
          >
            <span className="text-base">{icon}</span>
            <span>{to === '/' ? 'Radar' : links.find(l => l.to === to)?.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--border)] px-3 py-4">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
            'hover:bg-[var(--surface-2)]/80',
            isActive ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium' : 'text-[var(--text-2)]'
          )}
        >
          <span>⚙️</span>
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}
