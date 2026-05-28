# dashboard

Personal dashboard — AI trending, movie picks, and daily games.

Built with vanilla JavaScript. No frameworks, no build steps, no slop.

```
┌─ Navigation ─────────────────────────┐
│  Home  │  Radar  │  Movies  │  Games │
├──────────────────────────────────────┤
│                                      │
│  🔴 GitHub trending repos + HN       │
│  🎬 TMDB trending movies             │
│  🎮 Wordle + Movie Quiz              │
│  🌐 VI / EN                          │
│  🌙 Dark / Light                     │
│                                      │
└──────────────────────────────────────┘
```

## Pages

- **Home** — landing with quick links
- **Radar** — top GitHub repos (past 7 days) + HackerNews stories
- **Movies** — trending movies from TMDB + personal watchlist
- **Games** — Wordle (daily persistent) + Movie Quiz (5 random questions)
- **Watchlist** — saved movies

## Setup

1. Clone or download
2. Open `index.html` in a browser (or serve with `python3 -m http.server 8080`)

### TMDB API key (optional)

Movies tab needs a TMDB API key:

1. Register at https://www.themoviedb.org/settings/api
2. Open `js/movies.js` — API key is already set

## Tech

- Vanilla JS (ES6)
- Playfair Display + JetBrains Mono (Google Fonts)
- CSS custom properties (dark/light theme)
- Hash-based routing
- localStorage for persistence (theme, locale, watchlist, game state)
- i18n: Vietnamese + English

## Deploy

Any static host works — Cloudflare Pages, Vercel, Netlify:

```bash
# Using Cloudflare Pages CLI (wrangler)
npx wrangler pages deploy . --project-name=daily-dashboard
```

Or just push to GitHub and connect via Cloudflare Dashboard → Pages → Connect Git.
