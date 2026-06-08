---
name: atlas-architecture-patterns
description: Use when working on the Atlas daily dashboard — a vanilla JS SPA with hash routing, page objects, i18n dictionary, localStorage wrapper, CSS custom properties theming, and external API integrations
---

# Atlas Architecture Patterns

## Overview

Atlas is a vanilla JavaScript single-page application with zero framework dependencies. It uses a hash router dispatching to page objects, dictionary-based i18n, a localStorage wrapper, CSS custom properties for theming, and `data-` attributes for dynamic styling.

## Core Patterns

### 1. Page Object Pattern

Every page is a plain JS object with a `load(container)` method. Pages are defined as const objects (not classes).

```
const PageName = {
  load(container) {
    container.innerHTML = '';
    // build UI elements, attach handlers
  }
};
```

Route dispatch in `app.js`:
```
if (page === 'radar') AiRadar.load(el);
else if (page === 'movies') Movies.load(el);
```

Pages used: `AiRadar`, `Movies`, `GamesPage`, `WatchlistPage`, `MediaPage`, `RadioPage`, `MusicPage`, `ToolsPage`

### 2. Hash Router

Hash changes trigger `route()` via `window.addEventListener('hashchange', route)`. The `show()` function activates the matching page div and calls the page's `load()`.

```
function route() {
  const page = location.hash.slice(1) || 'home';
  show(page);
}
```

### 3. i18n (Dictionary-Based)

```
// In template: _(key)
// In i18n.js, both vi and en entries:
vi: { key: 'Giá trị' },
en: { key: 'Value' }

// Usage:
el.innerHTML = `<h2>${_('trendingMovies')}</h2>`;

// data-i18n attribute for static elements:
<span data-i18n="navHome"></span>
applyI18n() // called on DOMContentLoaded
```

### 4. Storage Wrapper

```
Storage.get(key, defaultVal)    // reads 'dd_' + key
Storage.set(key, val)           // writes 'dd_' + key
Storage.remove(key)
Storage.getWatchlist()
Storage.addToWatchlist(movie)
Storage.removeFromWatchlist(id)
Storage.getTheme() / setTheme()
Storage.getGameState(id) / setGameState(id, state)
```

### 5. API Integration Pattern

```
async function fetchData() {
  try {
    const r = await fetch(url);
    if (!r.ok) throw Error();
    const d = await r.json();
    // render d into DOM
  } catch {
    // render error state
  }
}
```

### 6. CSS Theming (Custom Properties)

```
:root { --bg, --surface, --text, --accent, --border }
[data-theme="light"] { /* override values */ }
[data-theme="dark"] { /* default dark values */ }

// Dynamic attributes:
data-time  = morning | afternoon | evening | night
data-weather = clear | cloudy | rain | wind | ...
```

### 7. XSS Safety

All user-provided or API-provided text must be wrapped with `esc()`:

```
function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')
          .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

## Common Mistakes

- Forgetting `esc()` on dynamic content (XSS vector)
- Using string concatenation for API URLs instead of template literals
- Mixing direct `localStorage` calls instead of `Storage` wrapper
- Adding framework imports (this project is intentionally framework-free)
- Hardcoding strings instead of using `_('key')` + adding to i18n dictionary

## Quick Reference

| Concern | Tool/Pattern | Location |
|---------|-------------|----------|
| Page creation | Object with `load(container)` | `app.js` or new file |
| Navigation | `show('page-name')` | `app.js` |
| Text translation | `_('key')` + LOCALE entry | `i18n.js` |
| Persistent data | `Storage.get/set` | `storage.js` |
| API calls | `fetch` + try/catch | In page file |
| HTML sanitization | `esc(string)` | `app.js` |
| Theming | CSS vars + `data-theme` attr | `style.css` |
| Dynamic styling | `data-time`, `data-weather` | `style.css` |
| API keys | `CONFIG.KEY_NAME` in `config.js` | `config.js` |
