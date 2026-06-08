# Atlas Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete rebuild of Atlas dashboard from vanilla JS to React + Tailwind + shadcn/ui with Apple Vibrancy design language.

**Architecture:** Vite + React 18 SPA with React Router v7, shadcn/ui component library, Framer Motion animations, Zustand state management. Layout: macOS-style glass sidebar + top bar + AnimatePresence page transitions.

**Tech Stack:** Vite · React 18 · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · React Router v7 · Zustand · Inter font

---

## File Structure

```
src/
├── main.tsx
├── App.tsx
├── styles/
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn/ui components (copied, not edited)
│   ├── layout/
│   │   ├── Shell.tsx          # Sidebar + TopBar + <main>
│   │   ├── Sidebar.tsx        # macOS-style sidebar nav
│   │   └── TopBar.tsx         # Search + theme + locale toggle
│   └── shared/
│       ├── GlassCard.tsx      # Reusable glass card wrapper
│       ├── Entry.tsx          # Feed entry (icon + title + meta + read btn)
│       ├── MovieCard.tsx      # Movie grid card
│       ├── GameCard.tsx       # Steam deal card
│       ├── ToolTile.tsx       # Tool grid tile
│       ├── LoadingSkeleton.tsx # Shimmer loading
│       ├── PeriodPicker.tsx   # Week/Month/Year pill buttons
│       └── PageTransition.tsx # Framer Motion wrapper
├── pages/
│   ├── Home.tsx
│   ├── Radar.tsx
│   ├── Movies.tsx
│   ├── Games.tsx
│   ├── Watchlist.tsx
│   ├── Media.tsx
│   ├── Tools.tsx
│   └── Settings.tsx
├── hooks/
│   ├── useWeather.ts
│   ├── useGitHub.ts
│   ├── useTMDB.ts
│   ├── useHackerNews.ts
│   ├── useReddit.ts
│   ├── useCheapShark.ts
│   ├── useRadio.ts
│   └── useYouTube.ts
├── stores/
│   ├── theme.ts               # Zustand — theme + locale + time period
│   ├── watchlist.ts           # Zustand + persist middleware
│   └── player.ts              # Zustand — music/radio player
├── lib/
│   ├── api.ts                 # Fetch wrapper with error handling
│   ├── storage.ts             # localStorage persistence
│   └── utils.ts               # cn(), esc(), formatDate(), etc.
├── i18n/
│   ├── index.ts               # _() function + setLocale
│   ├── vi.ts
│   └── en.ts
└── types/
    └── index.ts               # Shared TypeScript types
```

---

## Phase 1: Foundation

### Task 1: Scaffold Vite + React + TypeScript Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `postcss.config.js`
- Create: `.env.example`

- [ ] **Step 1: Create Vite project**

Run:
```bash
cd /home/schizo16/daily-dashboard
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: Install core dependencies**

```bash
npm install react-router-dom framer-motion zustand @tabler/icons-react
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Create `.env.example`**

```
VITE_GEMINI_KEY=
VITE_YT_KEY=
VITE_TMDB_KEY=
```

- [ ] **Step 4: Verify setup builds**

```bash
npm run build
```
Expected: exits 0, `dist/` directory created.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Tailwind + Design Tokens + Global Styles

**Files:**
- Modify: `vite.config.ts` (add Tailwind plugin)
- Create: `src/styles/globals.css`

- [ ] **Step 1: Configure Vite with Tailwind**

Modify `vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 2: Create global CSS with design tokens**

Write `src/styles/globals.css`:
```css
@import "tailwindcss";

@theme {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
}

@layer base {
  :root {
    --bg: #f5f5f7;
    --surface: #ffffff;
    --surface-2: #f2f2f7;
    --text: #1d1d1f;
    --text-2: #86868b;
    --text-3: #aeaeb2;
    --accent: #0071e3;
    --border: rgba(0, 0, 0, 0.1);
    --border-2: rgba(0, 0, 0, 0.18);
    --radius: 8px;
  }
  .dark {
    --bg: #000000;
    --surface: #1c1c1e;
    --surface-2: #2c2c2e;
    --text: #f5f5f7;
    --text-2: #86868b;
    --text-3: #636366;
    --accent: #0a84ff;
    --border: rgba(255, 255, 255, 0.1);
    --border-2: rgba(255, 255, 255, 0.18);
  }
  * {
    @apply border-[var(--border)];
  }
  body {
    @apply bg-[var(--bg)] text-[var(--text)] font-sans antialiased;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
}

@layer utilities {
  .glass {
    @apply bg-[var(--surface)]/70 backdrop-blur-2xl border border-[var(--border)];
  }
  .glass-strong {
    @apply bg-[var(--surface)]/80 backdrop-blur-2xl border border-[var(--border)];
  }
  .glass-hover {
    @apply hover:bg-[var(--surface-2)]/80 transition-colors duration-200;
  }
}
```

- [ ] **Step 3: Verify Tailwind works**

Run: `npm run build`
Expected: exits 0

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: configure Tailwind v4 with design tokens"
```

---

### Task 3: shadcn/ui Init + Base Components

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts` (add `cn()`)
- Create: `src/components/ui/` (button, card, dialog, input, tabs, select, sheet, tooltip, badge, separator)

- [ ] **Step 1: Init shadcn/ui**

```bash
npx shadcn@latest init
```
Accept defaults (Tailwind v4, CSS variables, `src/components/ui`, `@/` alias).

- [ ] **Step 2: Add base components**

```bash
npx shadcn@latest add button card dialog input tabs select sheet tooltip badge separator skeleton
```

- [ ] **Step 3: Verify components build**

Run: `npm run build`
Expected: exits 0

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: init shadcn/ui with core components"
```

---

### Task 4: Layout Shell (Sidebar + TopBar)

**Files:**
- Create: `src/components/layout/Shell.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/stores/theme.ts`

- [ ] **Step 1: Create theme store**

Write `src/stores/theme.ts`:
```ts
import { create } from 'zustand'

type Theme = 'light' | 'dark'
type Locale = 'vi' | 'en'
type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night'

interface ThemeState {
  theme: Theme
  locale: Locale
  timePeriod: TimePeriod
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setLocale: (l: Locale) => void
  setTimePeriod: (p: TimePeriod) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  locale: 'vi',
  timePeriod: 'night',
  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },
  toggleTheme: () => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', next === 'dark')
    set({ theme: next })
  },
  setLocale: (locale) => set({ locale }),
  setTimePeriod: (timePeriod) => set({ timePeriod }),
}))
```

- [ ] **Step 2: Create Sidebar**

Write `src/components/layout/Sidebar.tsx`:
```tsx
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  IconRadar, IconMovie, IconDeviceGamepad, IconBookmark,
  IconMusic, IconTools, IconSettings, IconWeatherCloudy
} from '@tabler/icons-react'

const links = [
  { to: '/', icon: IconRadar, label: 'Radar' },
  { to: '/movies', icon: IconMovie, label: 'Movies' },
  { to: '/games', icon: IconDeviceGamepad, label: 'Games' },
  { to: '/watchlist', icon: IconBookmark, label: 'Saved' },
  { to: '/media', icon: IconMusic, label: 'Media' },
  { to: '/tools', icon: IconTools, label: 'Tools' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-60 flex-col border-r border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-2xl">
      <div className="flex items-center gap-2 px-5 pt-5 pb-6">
        <span className="text-lg">◆</span>
        <span className="font-semibold tracking-tight">Atlas</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
              'hover:bg-[var(--surface-2)]/80 hover:translate-z-0.5',
              isActive ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium' : 'text-[var(--text-2)]'
            )}
          >
            <Icon size={18} stroke={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--border)] px-3 py-4">
        <NavLink to="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)]/80">
          <IconSettings size={18} stroke={1.5} />
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Create TopBar**

Write `src/components/layout/TopBar.tsx`:
```tsx
import { useThemeStore } from '@/stores/theme'

export function TopBar() {
  const { theme, toggleTheme, locale, setLocale } = useThemeStore()

  return (
    <header className="fixed left-60 right-0 top-0 z-20 flex h-12 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/60 backdrop-blur-2xl px-6">
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            placeholder="Search..."
            className="w-64 rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-4 py-1.5 text-sm outline-none transition-all duration-200 placeholder:text-[var(--text-3)] focus:w-80 focus:border-[var(--accent)]"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-[var(--text-2)] transition-all duration-200 hover:bg-[var(--surface-2)]/80 hover:rotate-12"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
          className="rounded-full px-3 py-1 text-xs font-mono text-[var(--text-2)] transition-all duration-200 hover:bg-[var(--surface-2)]/80"
        >
          {locale === 'vi' ? 'EN' : 'VI'}
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Create Shell (layout wrapper)**

Write `src/components/layout/Shell.tsx`:
```tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function Shell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-60 flex flex-1 flex-col">
        <TopBar />
        <main className="mt-12 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exits 0

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add layout Shell with Sidebar and TopBar"
```

---

### Task 5: Router + App Shell + Page Stubs

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Create: `src/components/shared/PageTransition.tsx`
- Create: `src/pages/Home.tsx`
- Create: `src/pages/Radar.tsx`
- Create: `src/pages/Movies.tsx`
- Create: `src/pages/Games.tsx`
- Create: `src/pages/Watchlist.tsx`
- Create: `src/pages/Media.tsx`
- Create: `src/pages/Tools.tsx`
- Create: `src/pages/Settings.tsx`

- [ ] **Step 1: Create PageTransition wrapper**

Write `src/components/shared/PageTransition.tsx`:
```tsx
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const variants = {
  enter: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={variants} initial="exit" animate="enter" exit="exit">
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Update App.tsx with router**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Shell } from './components/layout/Shell'
import { PageTransition } from './components/shared/PageTransition'
import Home from './pages/Home'
import Radar from './pages/Radar'
import Movies from './pages/Movies'
import Games from './pages/Games'
import Watchlist from './pages/Watchlist'
import Media from './pages/Media'
import Tools from './pages/Tools'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<PageTransition><Home /></PageTransition>} />
          <Route path="radar" element={<PageTransition><Radar /></PageTransition>} />
          <Route path="movies" element={<PageTransition><Movies /></PageTransition>} />
          <Route path="games" element={<PageTransition><Games /></PageTransition>} />
          <Route path="watchlist" element={<PageTransition><Watchlist /></PageTransition>} />
          <Route path="media" element={<PageTransition><Media /></PageTransition>} />
          <Route path="tools" element={<PageTransition><Tools /></PageTransition>} />
          <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Update main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
)
```

- [ ] **Step 4: Create page stubs (all return a placeholder div)**

Each page file exports a default function returning:
```tsx
export default function PageName() {
  return <div>PageName</div>
}
```

- [ ] **Step 5: Test routing**

Run: `npm run dev` and verify each route renders its page name.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add React Router with page stubs"
```

---

## Phase 2: Core Pages

### Task 6: Shared Components + i18n + Types + Utils

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/api.ts`
- Create: `src/lib/storage.ts`
- Create: `src/types/index.ts`
- Create: `src/i18n/index.ts`
- Create: `src/i18n/vi.ts`
- Create: `src/i18n/en.ts`
- Create: `src/components/shared/GlassCard.tsx`
- Create: `src/components/shared/Entry.tsx`
- Create: `src/components/shared/LoadingSkeleton.tsx`

- [ ] **Step 1: Write `src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

export function formatDate(date: Date, locale = 'vi'): string {
  return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}
```

- [ ] **Step 2: Write `src/types/index.ts`**

```ts
export interface GitHubRepo {
  id: number; name: string; description: string; stars: number; url: string; language: string
}
export interface HackerNewsStory {
  id: number; title: string; url: string; score: number; by: string
}
export interface Movie {
  id: number; title: string; poster_path: string; vote_average: number; overview: string
  release_date: string; genre_ids: number[]
}
export interface SteamDeal {
  title: string; salePrice: string; normalPrice: string; savings: string; steamRating: string
  thumb: string; dealID: string
}
export interface RadioStation {
  name: string; url: string; votes: number; country: string
}
export interface RedditPost {
  title: string; url: string; score: number; comments: number
}
```

- [ ] **Step 3: Write i18n dictionaries**

`src/i18n/vi.ts`:
```ts
const vi = {
  loading: 'Đang tải...',
  failed: 'Tải thất bại.',
  retry: 'Thử lại',
  save: 'Lưu',
  saved: 'Đã lưu',
  remove: 'Xóa',
  nothingSaved: 'Chưa có gì.',
  // ... full dictionary from original i18n.js
}
export default vi
```

`src/i18n/en.ts`:
```ts
const en = {
  loading: 'Loading...',
  failed: 'Failed to load.',
  retry: 'Retry',
  save: 'Save',
  saved: 'Saved',
  remove: 'Remove',
  nothingSaved: 'Nothing saved.',
  // ... full dictionary from original i18n.js
}
export default en
```

`src/i18n/index.ts`:
```ts
import vi from './vi'
import en from './en'

const dictionaries = { vi, en }
let currentLocale: 'vi' | 'en' = 'vi'

export function _(key: string): string {
  return dictionaries[currentLocale]?.[key as keyof typeof dictionaries['vi']] ?? key
}

export function setLocale(locale: 'vi' | 'en') {
  currentLocale = locale
}
```

- [ ] **Step 4: Write `src/lib/api.ts`**

```ts
export async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
```

- [ ] **Step 5: Write `src/lib/storage.ts`**

```ts
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const val = localStorage.getItem('dd_' + key)
      return val !== null ? JSON.parse(val) : fallback
    } catch { return fallback }
  },
  set(key: string, val: unknown) {
    localStorage.setItem('dd_' + key, JSON.stringify(val))
  },
  remove(key: string) {
    localStorage.removeItem('dd_' + key)
  },
}
```

- [ ] **Step 6: Write GlassCard**

```tsx
import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export function GlassCard({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <div
      className={cn(
        'glass rounded-[var(--radius)] p-5 transition-all duration-300',
        'hover:shadow-[var(--elevation-3)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 7: Write Entry component**

```tsx
import { esc } from '@/lib/utils'

interface EntryProps {
  icon: string; title: string; url?: string; meta?: string; onRead?: () => void
}
export function Entry({ icon, title, url, meta, onRead }: EntryProps) {
  return (
    <div className="entry flex gap-3 items-start py-3.5 transition-all duration-200 hover:bg-[var(--surface-2)]/80 hover:-mx-2 hover:px-2 rounded-sm">
      <div className="w-10 h-10 rounded flex items-center justify-center bg-[var(--surface-2)] flex-shrink-0 text-sm mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold leading-snug">
          {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:text-[var(--accent)]">{esc(title)}</a> : esc(title)}
        </div>
        {meta && <div className="font-mono text-xs text-[var(--text-3)] mt-1.5 flex gap-3.5">{meta}</div>}
      </div>
      {onRead && <button onClick={onRead} className="font-mono text-xs text-[var(--text-3)] bg-none border-none cursor-pointer hover:text-[var(--accent)] self-start mt-1">📖 Đọc</button>}
    </div>
  )
}
```

- [ ] **Step 8: Write LoadingSkeleton**

```tsx
import { cn } from '@/lib/utils'
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded bg-[var(--surface-2)]', className)} />
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: add shared components, i18n, types, and utilities"
```

---

### Task 7: Home Page

**Files:**
- Modify: `src/pages/Home.tsx`
- Create: `src/hooks/useWeather.ts`

- [ ] **Step 1: Create weather hook**

`src/hooks/useWeather.ts`:
```ts
import { useState, useEffect } from 'react'
import { fetchJSON } from '@/lib/api'

interface WeatherData { temp: number; icon: string; condition: string }

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let lat = 21.0285, lon = 105.8542
        const res = await fetchJSON<{ current_weather: { temperature: number; weathercode: number; windspeed: number } }>(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        )
        if (!cancelled) {
          const cw = res.current_weather
          const icons = ['☀️','🌤','⛅','🌥','☁️','🌧','🌦','⛈','🌨','🌫']
          setData({
            temp: Math.round(cw.temperature),
            icon: icons[cw.weathercode <= 1 ? 0 : cw.weathercode <= 2 ? 1 : cw.weathercode <= 3 ? 2 : cw.weathercode <= 4 ? 3 : cw.weathercode <= 10 ? 5 : cw.weathercode <= 20 ? 6 : cw.weathercode <= 30 ? 7 : cw.weathercode <= 40 ? 8 : 9],
            condition: cw.weathercode <= 1 ? 'clear' : cw.weathercode <= 4 ? 'cloudy' : 'rain',
          })
        }
      } catch {} finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { data, loading }
}
```

- [ ] **Step 2: Build full Home page**

`src/pages/Home.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/shared/GlassCard'
import { useWeather } from '@/hooks/useWeather'
import { useThemeStore } from '@/stores/theme'
import { formatDate, formatTime } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { _ } from '@/i18n'

export default function Home() {
  const { data: weather } = useWeather()
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

      {/* Search */}
      <GlassCard className="text-center">
        <input
          placeholder={locale === 'vi' ? 'Tìm kiếm Google...' : 'Search Google...'}
          className="w-full max-w-sm rounded-full border border-[var(--border)] bg-[var(--surface)]/50 px-5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-[var(--text-3)] focus:border-[var(--accent)] focus:w-80 text-center"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val) window.open('https://www.google.com/search?q=' + encodeURIComponent(val), '_blank')
            }
          }}
        />
      </GlassCard>

      {/* Quick Notes */}
      <GlassCard>
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-xs text-[var(--text-3)]">{_('quickNotes')}</span>
          <button onClick={() => { setNotes(''); storage.remove('notes') }} className="font-mono text-xs text-[var(--text-3)] bg-none border-none cursor-pointer hover:text-[var(--text-2)]">{_('clear')}</button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-y rounded border border-[var(--border)] bg-[var(--surface)] p-2.5 text-sm text-[var(--text-2)] outline-none transition-colors focus:border-[var(--accent)] focus:text-[var(--text)] font-mono"
          rows={4}
          placeholder={locale === 'vi' ? 'Ghi chú nhanh...' : 'Quick notes...'}
        />
      </GlassCard>

      {/* Explore tiles */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: '/radar', icon: '📡', title: _('tileRadarTitle'), desc: _('tileRadarDesc') },
          { to: '/movies', icon: '🎬', title: _('tileMoviesTitle'), desc: _('tileMoviesDesc') },
          { to: '/games', icon: '🎮', title: _('tileGamesTitle'), desc: _('tileGamesDesc') },
          { to: '/watchlist', icon: '🔖', title: _('tileWatchlistTitle'), desc: _('tileWatchlistDesc') },
        ].map((tile, i) => (
          <motion.div key={tile.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 200, damping: 24 }}>
            <Link to={tile.to} className="block glass rounded-[var(--radius)] p-5 no-underline transition-all duration-300 hover:bg-[var(--surface-2)]/80 hover:-translate-y-0.5 hover:shadow-lg group">
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Home page with weather, clock, search, notes, tiles"
```

---

### Task 8: Radar Page (GitHub + AI + HN + Tech News)

**Files:**
- Modify: `src/pages/Radar.tsx`
- Create: `src/hooks/useGitHub.ts`
- Create: `src/hooks/useHackerNews.ts`
- Create: `src/hooks/useReddit.ts`
- Create: `src/components/shared/PeriodPicker.tsx`

- [ ] **Step 1: Create hooks**

Write `src/hooks/useGitHub.ts`, `src/hooks/useHackerNews.ts`, `src/hooks/useReddit.ts` — each fetches data via `fetchJSON` and returns `{ data, loading, error, retry }`.

- [ ] **Step 2: Build Radar page with tabs**

`src/pages/Radar.tsx` uses shadcn `Tabs` component:
- Tab "GitHub" → repos list with stars/language
- Tab "AI Models" → HuggingFace models by downloads
- Tab "HN" → HackerNews stories
- Tab "Tech News" → Reddit r/artificial + r/congnghe

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Radar page with GitHub, AI, HN, Tech News tabs"
```

---

### Task 9: Movies Page (TMDB + Watchlist Integration)

**Files:**
- Modify: `src/pages/Movies.tsx`
- Create: `src/hooks/useTMDB.ts`
- Create: `src/components/shared/MovieCard.tsx`
- Create: `src/stores/watchlist.ts`

- [ ] **Step 1: Create watchlist store**

`src/stores/watchlist.ts` — Zustand with `persist` middleware for localStorage.

- [ ] **Step 2: Create TMDB hook**

`src/hooks/useTMDB.ts` — fetch trending movies/TV with period filter.

- [ ] **Step 3: Build Movies page**

Grid of `MovieCard` components + period picker pills + detail dialog.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Movies page with TMDB integration"
```

---

## Phase 3: Remaining Pages

### Task 10: Games Page (Steam + Wordle + Quiz + News)

**Files:**
- Modify: `src/pages/Games.tsx`
- Create: `src/hooks/useCheapShark.ts`
- Create: `src/components/shared/GameCard.tsx`

Games page with:
- Tabs: Steam Deals / eSports / Gaming News
- Steam deals grid with cheapshark API
- Wordle + Quiz as inline game cards
- Reddit r/esports + r/gaming feeds

---

### Task 11: Watchlist Page

**Files:**
- Modify: `src/pages/Watchlist.tsx`

Reads from `watchlist` store, displays saved movies with remove button.

---

### Task 12: Media Page (Music + Radio)

**Files:**
- Modify: `src/pages/Media.tsx`
- Create: `src/hooks/useRadio.ts`
- Create: `src/hooks/useYouTube.ts`
- Create: `src/stores/player.ts`

Media page with shadcn `Tabs`:
- Tab "Music" — YouTube player, playlist, featured channels
- Tab "Radio" — country selector + station list
- Persistent bottom player bar

---

### Task 13: Tools Page

**Files:**
- Modify: `src/pages/Tools.tsx`
- Create: `src/components/shared/ToolTile.tsx`

Tools grid → detail view per tool:
- QR Code, Password, Text Counter, Random, Base64, JSON, Typing Test, Color Converter, Downloader

---

## Phase 4: Polish

### Task 14: Settings Page

**Files:**
- Modify: `src/pages/Settings.tsx`

Settings with glass cards:
- Theme toggle (light/dark/system)
- Locale toggle
- API keys (placeholder inputs)
- About section

---

### Task 15: 3D Tilt + Micro-interactions

**Files:**
- Create: `src/hooks/useTilt.ts`

Custom hook for 3D perspective tilt on mouse move:
```ts
import { useCallback, useRef } from 'react'

export function useTilt(maxDeg = 6, maxZ = 12) {
  const ref = useRef<HTMLDivElement>(null)
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(600px) rotateX(${y * -maxDeg}deg) rotateY(${x * maxDeg}deg) translateZ(${maxZ}px)`
  }, [maxDeg, maxZ])
  const onMouseLeave = useCallback(() => {
    if (!ref.current) ref.current.style.transform = ''
  }, [])
  return { ref, onMouseMove, onMouseLeave }
}
```

Apply to GlassCard, MovieCard, GameCard, tiles.

---

### Task 16: Background Effects + Responsive

- CSS-only animated stars for evening/night
- Weather effects (rain, wind, clouds) via `data-weather` attribute
- Responsive sidebar (collapses to icon-only on mobile)
- `prefers-reduced-motion` support

---

### Task 17: Update README + Deploy Config

- Update `README.md` with new stack info
- Add Cloudflare Pages deploy config (`_headers`, `_redirects` for SPA)
- Remove old vanilla JS files

---

## Self-Review Checklist

- [ ] **Spec coverage:** Every section in the design spec maps to a task phase
- [ ] **Placeholder scan:** No TBD/TODO — steps with "..." are marked for the engineer to fill from the original codebase
- [ ] **Type consistency:** Type names are consistent across tasks (Movie, GitHubRepo, etc.)
- [ ] **i18n completeness:** Both vi and en dictionaries referenced
- [ ] **All APIs covered:** Weather, GitHub, HuggingFace, HN, Reddit, TMDB, CheapShark, Radio, YouTube
