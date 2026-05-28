const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';

const Movies = {
  async load(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
    try {
      container.innerHTML = `<div class="section">
        <div class="section-header">
          <h2>Trending Movies</h2>
          <button id="watchlist-toggle" class="watchlist-toggle">Watchlist</button>
        </div>
        <div id="movies-grid"></div>
        <div id="movies-watchlist" style="display:none"></div>
      </div>`;
      const movies = await this.fetch();
      this.grid(container.querySelector('#movies-grid'), movies);
      this.wl(container.querySelector('#movies-watchlist'));

      document.getElementById('watchlist-toggle').addEventListener('click', () => {
        const g = document.getElementById('movies-grid');
        const w = document.getElementById('movies-watchlist');
        const b = document.getElementById('watchlist-toggle');
        const show = w.style.display !== 'none';
        g.style.display = show ? '' : 'none';
        w.style.display = show ? 'none' : '';
        b.textContent = show ? 'Watchlist' : 'Movies';
      });
    } catch (err) {
      container.innerHTML = `<div class="loading error">${err.message}. <button class="btn" onclick="Movies.load(this.parentElement.parentElement)">Retry</button></div>`;
    }
  },

  async fetch() {
    const r = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`);
    if (!r.ok) throw new Error('TMDB API error');
    const d = await r.json();
    return d.results.slice(0, 10).map(m => ({
      id: m.id, title: m.title, overview: m.overview,
      poster: m.poster_path, rating: m.vote_average,
      year: m.release_date ? m.release_date.slice(0, 4) : ''
    }));
  },

  grid(c, movies) {
    c.innerHTML = '';
    movies.forEach(m => {
      const e = document.createElement('div');
      e.className = 'movie-entry';
      e.innerHTML = `
        <div class="movie-icon">🎬</div>
        <div class="movie-info">
          <div class="movie-name">${this.eh(m.title)}</div>
          <div class="movie-sub">${m.year}${m.overview ? ' · ' + this.eh(m.overview.slice(0, 70)) + '...' : ''}</div>
        </div>
        <span class="movie-score">${m.rating ? m.rating.toFixed(1) : ''}</span>
        <button class="watchlist-btn" data-id="${m.id}" data-title="${this.ea(m.title)}" data-rating="${m.rating || 0}">Save</button>
      `;
      e.querySelector('.watchlist-btn').addEventListener('click', (ev) => {
        const b = ev.currentTarget;
        Storage.addToWatchlist({ id: m.id, title: m.title, poster_path: m.poster, vote_average: m.rating });
        b.textContent = 'Saved'; b.disabled = true;
      });
      c.appendChild(e);
    });
  },

  wl(c) {
    const items = Storage.getWatchlist();
    if (items.length === 0) { c.innerHTML = '<div class="empty" style="padding:24px 0">Nothing saved yet.</div>'; return; }
    c.innerHTML = '';
    items.forEach(m => {
      const e = document.createElement('div');
      e.className = 'movie-entry';
      e.innerHTML = `
        <div class="movie-icon">🎬</div>
        <div class="movie-info">
          <div class="movie-name">${this.eh(m.title)}</div>
          <div class="movie-sub">⭐ ${m.rating ? Number(m.rating).toFixed(1) : 'N/A'}</div>
        </div>
        <button class="remove-btn" data-id="${m.id}">Remove</button>
      `;
      e.querySelector('.remove-btn').addEventListener('click', () => {
        Storage.removeFromWatchlist(m.id);
        this.wl(c);
      });
      c.appendChild(e);
    });
  },

  eh(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },
  ea(s) { return String(s).replace(/"/g, '&quot;'); }
};
