# Atlas

A personal daily dashboard — AI trending, movie picks, daily games, music, radio, and tools.

Rebuilt with React + Tailwind CSS + shadcn/ui featuring Apple Vibrancy design language.

## Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite |
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Animation | Framer Motion (spring, stagger, 3D tilt) |
| Router | React Router v7 |
| State | Zustand |
| Font | Inter (body), JetBrains Mono (code) |
| Deploy | Cloudflare Pages / Vercel |

## Setup

```bash
cp .env.example .env
# Add your API keys to .env
npm install
npm run dev
```

## API Keys

| Key | Service | Purpose |
|-----|---------|---------|
| `VITE_TMDB_KEY` | TMDB | Movies data |
| `VITE_GEMINI_KEY` | Google Gemini | AI journalist (Vietnamese rewrite) |
| `VITE_YT_KEY` | YouTube Data API | Playlist/video search |

## Pages

- **Home** — Clock, weather, search, quick notes, explore tiles
- **Radar** — GitHub trending, AI models, HackerNews, tech news
- **Movies** — TMDB trending, watchlist, detail dialog
- **Games** — Steam deals, gaming news, eSports, Wordle, movie quiz
- **Watchlist** — Saved movies
- **Media** — YouTube music player, radio browser
- **Tools** — QR code, password generator, text counter, Base64, JSON formatter, typing test, color converter
- **Settings** — Theme, locale, API keys

## Design

- **Apple Vibrancy** — Glassmorphism with `backdrop-filter: blur(40px)`
- **macOS-style sidebar** — Collapsible navigation with icons
- **3D tilt** — Cards respond to mouse movement with perspective transforms
- **Dark/Light mode** — System-aware with manual toggle
- **i18n** — Vietnamese + English
- **Framer Motion** — Page transitions, staggered entries, spring animations
