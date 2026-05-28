const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';

const Movies = {
  async load(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
    try {
      container.innerHTML = `
        <div class="section-header">
          <h2>Trending Movies</h2>
          <button id="watchlist-toggle" class="watchlist-toggle">Watchlist</button>
        </div>
        <div id="movies-grid" class="movie-list"></div>
        <div id="movies-watchlist" class="movie-list" style="display:none"></div>
      `;
      const movies = await this.fetchTrending();
      this.renderGrid(container.querySelector('#movies-grid'), movies);
      this.renderWatchlist(container.querySelector('#movies-watchlist'));

      document.getElementById('watchlist-toggle').addEventListener('click', () => {
        const grid = document.getElementById('movies-grid');
        const wl = document.getElementById('movies-watchlist');
        const btn = document.getElementById('watchlist-toggle');
        const showing = wl.style.display !== 'none';
        grid.style.display = showing ? '' : 'none';
        wl.style.display = showing ? 'none' : '';
        btn.textContent = showing ? 'Watchlist' : 'Movies';
      });
    } catch (err) {
      container.innerHTML = `<div class="error">${err.message}. <button class="btn" onclick="Movies.load(this.parentElement.parentElement)">Retry</button></div>`;
    }
  },

  async fetchTrending() {
    const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`);
    if (!res.ok) throw new Error('TMDB API error — check your API key');
    const data = await res.json();
    return data.results.slice(0, 12).map(m => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      poster: m.poster_path,
      rating: m.vote_average,
      year: m.release_date ? m.release_date.slice(0, 4) : ''
    }));
  },

  renderGrid(container, movies) {
    container.innerHTML = '';
    movies.forEach(m => {
      const entry = document.createElement('div');
      entry.className = 'movie-entry';
      entry.innerHTML = `
        <div class="movie-icon">🎬</div>
        <div class="movie-info">
          <div class="movie-name">${this.e(m.title)}</div>
          <div class="movie-sub">${m.year} ${m.overview ? '· ' + this.e(m.overview.slice(0, 80)) + '...' : ''}</div>
        </div>
        <span class="movie-score">${m.rating ? m.rating.toFixed(1) : ''}</span>
        <button class="watchlist-btn" data-id="${m.id}" data-title="${this.eAttr(m.title)}" data-rating="${m.rating || 0}">+ Save</button>
      `;
      entry.querySelector('.watchlist-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        Storage.addToWatchlist({ id: m.id, title: m.title, poster_path: m.poster, vote_average: m.rating });
        btn.textContent = 'Saved';
        btn.disabled = true;
      });
      container.appendChild(entry);
    });
  },

  renderWatchlist(container) {
    const items = Storage.getWatchlist();
    if (items.length === 0) {
      container.innerHTML = '<div class="empty">No saved movies.</div>';
      return;
    }
    container.innerHTML = '';
    items.forEach(m => {
      const entry = document.createElement('div');
      entry.className = 'movie-entry';
      entry.innerHTML = `
        <div class="movie-icon">🎬</div>
        <div class="movie-info">
          <div class="movie-name">${this.e(m.title)}</div>
          <div class="movie-sub">⭐ ${m.rating ? Number(m.rating).toFixed(1) : 'N/A'}</div>
        </div>
        <button class="remove-btn" data-id="${m.id}">Remove</button>
      `;
      entry.querySelector('.remove-btn').addEventListener('click', () => {
        Storage.removeFromWatchlist(m.id);
        this.renderWatchlist(container);
      });
      container.appendChild(entry);
    });
  },

  e(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
  eAttr(str) { return String(str).replace(/"/g, '&quot;'); }
};
