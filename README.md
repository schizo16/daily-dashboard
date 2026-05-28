# Atlas

Personal hub — AI trends, movies, games, radio, music, and tools. Built with vanilla JS, no frameworks, no slop.

```
🏠 Home → ⏰ 🪟 🌤 🔍
🔴 Radar → GitHub trending + AI Models + HackerNews
🎬 Movies → TMDB trending + TV Series + time periods
🎮 Games → Steam deals with ratings & discounts
📋 Watchlist → saved movies
📻 Radio → stations from 16 countries
🎵 Music → YouTube / Spotify / SoundCloud + queue
🧰 Tools → QR, password, JSON, typing test, downloader
```

## Features

- **Home** — live clock, weather (auto-detect location), Google smart search, quick notes (auto-save), quick links
- **Radar** — GitHub trending repos (week/month/year), AI models from HuggingFace, HackerNews
- **Movies** — TMDB trending + TV series, period filters (week/month/year/top), movie details with poster/rating/cast, Movie News
- **Games** — Steam deals from CheapShark, 7 categories (top deals, popular, discounts, under $5/$10, top rated, new), ratings + discounts, pagination
- **Music** — YouTube (audio-only with YT Player API), Spotify embed, SoundCloud embed, direct audio URL, playlist support (YouTube Data API for queue), queue with prev/next, shuffle, loop (off/all/one), seek bar, volume, persistent player bar
- **Radio** — 16 countries (US, UK, Vietnam, Japan, Korea, China, etc.), browse real stations via Radio Browser API, persistent player bar, volume, now-playing metadata for SomaFM
- **Tools** — QR code generator, password generator, text counter, random number, Base64 encoder/decoder, JSON formatter/minifier, typing test, color converter, video downloader links
- **AI Hub** — quick links to ChatGPT, Gemini, Claude, DeepSeek, Groq, Perplexity
- **i18n** — Vietnamese + English
- **Auto theme** — light by day, dark by night (manual toggle available)
- **Dynamic background** — morning/afternoon/evening/night gradients, stars + shooting stars at night, clouds, rain, wind effects based on real weather
- **Responsive** — mobile hamburger menu, adaptive layouts

## Setup

1. Clone the repo
2. Open `index.html` in a browser (or serve with `python3 -m http.server 8080`)

### API Keys

Copy `js/config.example.js` to `js/config.js` and fill in:

```js
const CONFIG = {
  GEMINI_KEY: 'your_gemini_api_key',       // for AI features
  YT_KEY: 'your_youtube_data_api_v3_key',  // for playlist queue + search
  TMDB_KEY: 'your_tmdb_api_key',           // for movies (optional)
};
```

- **Gemini API key:** https://aistudio.google.com/apikey
- **YouTube Data API v3:** https://console.cloud.google.com/apis/library/youtube.googleapis.com
- **TMDB API key:** https://www.themoviedb.org/settings/api

`config.js` is in `.gitignore` and won't be committed.

## Tech

- Vanilla JS (ES6+)
- YouTube IFrame Player API
- YouTube Data API v3
- Spotify / SoundCloud embeds
- CheapShark API (games)
- TMDB API (movies)
- HuggingFace API (AI models)
- Radio Browser API (radio stations)
- Open-Meteo API (weather)
- GitHub Search API (trending repos)
- HackerNews Firebase API
- Reddit JSON API (news)
- LibreTranslate API (translation)
- Web Speech API (read aloud)
- CSS custom properties + animations
- CSS-only hamburger menu (checkbox hack)
- localStorage persistence

## Deploy

Any static host works — Cloudflare Pages, Vercel, Netlify:

```bash
npx wrangler pages deploy . --project-name=atlas
```
