# Atlas Redesign — Design Spec

**Date:** 2026-06-08
**Status:** Approved

## Overview

Complete rebuild of the Atlas daily dashboard from vanilla JS to React + Tailwind CSS with an Apple Vibrancy design language. Zero code retained from the original codebase.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Build | Vite |
| Framework | React 18 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (button, card, sidebar, tabs, dialog, input, etc.) |
| Animation | Framer Motion (spring, stagger, layout, 3D transforms) |
| Router | React Router v7 |
| State | Zustand |
| Font | Inter (body), JetBrains Mono (code) |
| Deploy | Cloudflare Pages / Vercel |

## Design Language: Apple Vibrancy

### Dark Mode Tokens

| Token | Value |
|-------|-------|
| `--bg` | `#000` |
| `--surface` | `#1c1c1e` |
| `--surface-2` | `#2c2c2e` |
| `--text` | `#f5f5f7` |
| `--text-2` | `#86868b` |
| `--accent` | `#0071e3` |
| `--border` | `rgba(255,255,255,0.1)` |

### Light Mode Tokens

| Token | Value |
|-------|-------|
| `--bg` | `#f5f5f7` |
| `--surface` | `#ffffff` |
| `--surface-2` | `#f2f2f7` |
| `--text` | `#1d1d1f` |
| `--text-2` | `#86868b` |
| `--accent` | `#0071e3` |
| `--border` | `rgba(0,0,0,0.1)` |

### Glass Effects

- Cards: `bg-white/5 backdrop-blur-2xl border border-white/10` (dark)
- Cards: `bg-white/50 backdrop-blur-2xl border border-white/80` (light)
- Sidebar: glass with right border 0.5px
- Buttons/pills: `bg-[color]/8 backdrop-blur-xl`

### Typography

- Body: Inter, 16px base, -apple-system fallback
- Code: JetBrains Mono
- Scale: 0.75 / 0.85 / 1 / 1.2 / 1.5 / 2 rem

### Border Radius

- Cards: 8px
- Sidebar: 12px
- Pills/buttons: 20px
- Dialogs: 14px

## Architecture

```
src/
├── App.tsx                    # Router + AnimatePresence
├── main.tsx                   # Entry
├── styles/
│   └── globals.css            # Tailwind + theme vars + glass utilities
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/
│   │   ├── Shell.tsx          # Sidebar + TopBar + Content
│   │   ├── Sidebar.tsx        # macOS-style sidebar
│   │   └── TopBar.tsx         # Search + theme + locale
│   └── shared/                # Entry, MovieCard, ToolTile, etc.
├── pages/
│   ├── Home.tsx               # Hero + clock + weather + search + notes + tiles
│   ├── Radar.tsx              # Tabs: GitHub / AI / HN / Tech News
│   ├── Movies.tsx             # Period pills + movie grid + detail modal
│   ├── Games.tsx              # Steam deals + eSports + gaming news + Wordle + Quiz
│   ├── Watchlist.tsx          # Saved movies list
│   ├── Media.tsx              # Music + Radio tabs
│   ├── Tools.tsx              # Grid + tool detail views
│   └── Settings.tsx           # Theme, locale, API keys, about
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
│   ├── theme.ts               # Zustand — theme + locale + time
│   ├── watchlist.ts           # Zustand — persisted
│   └── player.ts              # Zustand — music/radio player state
├── lib/
│   ├── api.ts                 # Fetch wrapper
│   ├── storage.ts             # localStorage adapter
│   └── utils.ts               # cn(), esc(), formatters
├── i18n/
│   ├── vi.ts
│   └── en.ts
└── types/
    └── index.ts
```

## Layout

```
┌─────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────────────┐ │
│  │ ◆ Atlas  │  │  🔍 Search...    🌙 VI  │ │
│  │          │  ├──────────────────────────┤ │
│  │ 📡 Radar │  │                          │ │
│  │ 🎬 Movies│  │    <AnimatePresence>     │ │
│  │ 🎮 Games │  │      Page Content        │ │
│  │ 🔖 Saved │  │    (glass cards)         │ │
│  │ 🎵 Media │  │                          │ │
│  │ 🧰 Tools │  │                          │ │
│  │ ⚙️ Sett. │  │                          │ │
│  │          │  │                          │ │
│  │ ☀️ 25°C  │  │                          │ │
│  └──────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────┘
```

- Sidebar: 240px, collapsible to 64px (icons only)
- Top bar: 48px, glass, sticky
- Content: flex-1, scrollable

## Animation & 3D Strategy

### Framer Motion Configuration

```ts
// Apple spring
const appleSpring = { type: "spring", stiffness: 200, damping: 24 }

// Page transitions
const pageVariants = {
  enter: { opacity: 1, y: 0, transition: appleSpring },
  exit:  { opacity: 0, y: -8, transition: { duration: 0.15 } }
}
```

### Interactive Effects

| Effect | Implementation |
|--------|---------------|
| Card 3D tilt | Mouse move → perspective + rotateX/Y + translateZ |
| Sidebar hover | translateZ(2px) + background tint |
| Hero depth | Layer separation with parallax offset |
| Stagger entries | Each child delays by index * 50ms |
| Button press | scale 1 → 0.97 spring |
| Search expand | Width animation on focus (Spotlight style) |
| Theme toggle | 360deg rotation, 300ms spring |
| Loading skeleton | Shimmer animation with gradient |

### Background Effects

- Dark mode: subtle radial gradients + noise-like repeating gradient
- Light mode: clean white/gray
- Stars: CSS-only animated (evening/night only)
- Weather effects: CSS keyframes driven by `data-weather` attribute

### Data Flow

1. Page mounts → custom hook fetches data via `lib/api.ts`
2. Loading state → shimmer skeleton
3. Error state → retry button with message
4. Data → rendered into glass cards
5. User interaction → Zustand store update → UI reacts
6. Persistence → Zustand middleware syncs to localStorage

## Implementation Phases

### Phase 1: Foundation
- Vite + React project setup
- Tailwind config + theme CSS variables
- shadcn/ui init + base components
- Layout Shell (Sidebar + TopBar + Content)
- React Router setup
- Framer Motion AnimatePresence

### Phase 2: Core Pages
- Home (hero, clock, weather, search, notes, tiles)
- Radar (GitHub, HuggingFace, HN, Reddit tech news)
- Movies (TMDB trending, period filter, detail modal)

### Phase 3: Remaining Pages
- Games (Steam deals, Wordle, Quiz, eSports, gaming news)
- Watchlist (saved movies CRUD)
- Media (Music + Radio player with bottom bar)
- Tools (all mini-tools: QR, password, JSON, typing, etc.)

### Phase 4: Polish
- Settings page (theme, locale, API keys)
- 3D tilt effects on all cards
- Micro-interactions polish
- Responsive refinements
- Performance optimization

## Do-Not Behaviors

- Do not keep any code from the original vanilla JS codebase (complete rewrite)
- Do not introduce server-side rendering (SPA only)
- Do not add security headers or CSP (handled by deployment)
- Do not hardcode API keys (use `.env`)

## Key Decisions

1. Zustand over Redux/Context — simpler, less boilerplate, built-in persistence
2. shadcn/ui over custom components — faster development, battle-tested accessibility
3. Framer Motion over CSS-only — spring physics, AnimatePresence, layout animations
4. Inter font over SF Pro — closest open-source alternative, Apple-like metrics
5. Vite over Next.js — SPA doesn't need SSR, simpler deploy
