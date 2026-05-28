const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w200';

const Movies = {
  async load(container) {
    container.innerHTML = '<div class="loading">Loading Movies...</div>';
    try {
      const html = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h2 class="section-title" style="margin-top:0">🎬 Trending Movies</h2>
          <button id="watchlist-toggle" class="tab" style="flex:0;padding:6px 12px">📋 Watchlist</button>
        </div>
        <div id="movies-grid"></div>
        <div id="movies-watchlist" style="display:none"></div>
      `;
      container.innerHTML = html;
      const movies = await this.fetchTrending();
      this.renderGrid(container.querySelector('#movies-grid'), movies);
      this.renderWatchlist(container.querySelector('#movies-watchlist'));

      document.getElementById('watchlist-toggle').addEventListener('click', () => {
        const grid = document.getElementById('movies-grid');
        const wl = document.getElementById('movies-watchlist');
        const btn = document.getElementById('watchlist-toggle');
        const showingWatchlist = wl.style.display !== 'none';
        grid.style.display = showingWatchlist ? '' : 'none';
        wl.style.display = showingWatchlist ? 'none' : '';
        btn.textContent = showingWatchlist ? '📋 Watchlist' : '🎬 Movies';
      });
    } catch (err) {
      container.innerHTML = `<div class="error">Failed to load movies. ${err.message}. <button onclick="Movies.load(this.parentElement.parentElement)" style="background:none;border:1px solid var(--border);border-radius:6px;padding:4px 12px;cursor:pointer;color:var(--accent)">Retry</button></div>`;
    }
  },

  async fetchTrending() {
    const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`);
    if (!res.ok) throw new Error('TMDB API error');
    const data = await res.json();
    return data.results.slice(0, 12).map(m => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      poster_path: m.poster_path,
      vote_average: m.vote_average,
      release_date: m.release_date,
      genre_ids: m.genre_ids
    }));
  },

  renderGrid(container, movies) {
    container.innerHTML = '';
    movies.forEach(m => {
      const card = document.createElement('div');
      card.className = 'card';
      const poster = m.poster_path
        ? `<img src="${TMDB_IMG_BASE}${m.poster_path}" alt="${this.escapeHtml(m.title)}" style="width:80px;border-radius:8px;float:left;margin-right:12px">`
        : '';
      card.innerHTML = `
        <div style="min-height:120px">
          ${poster}
          <h3>${this.escapeHtml(m.title)}</h3>
          <p>${m.overview ? this.escapeHtml(m.overview.slice(0, 150) + '...') : 'No overview'}</p>
          <div class="meta">
            <span>⭐ ${m.vote_average ? m.vote_average.toFixed(1) : 'N/A'}</span>
            <span>📅 ${m.release_date || 'Unknown'}</span>
            <button class="watchlist-btn" data-id="${m.id}" data-title="${this.escapeAttr(m.title)}" data-poster="${m.poster_path || ''}" data-rating="${m.vote_average || 0}" style="background:none;border:1px solid var(--border);border-radius:6px;padding:2px 8px;cursor:pointer;float:right">+ Watchlist</button>
          </div>
        </div>`;
      card.querySelector('.watchlist-btn').addEventListener('click', () => {
        const btn = card.querySelector('.watchlist-btn');
        Storage.addToWatchlist({ id: m.id, title: m.title, poster_path: m.poster_path, vote_average: m.vote_average });
        btn.textContent = '✓ Added';
        btn.disabled = true;
      });
      container.appendChild(card);
    });
  },

  renderWatchlist(container) {
    const items = Storage.getWatchlist();
    if (items.length === 0) {
      container.innerHTML = '<div class="empty">No movies in watchlist yet.</div>';
      return;
    }
    container.innerHTML = '';
    items.forEach(m => {
      const card = document.createElement('div');
      card.className = 'card';
      const poster = m.poster
        ? `<img src="${TMDB_IMG_BASE}${m.poster}" alt="${this.escapeHtml(m.title)}" style="width:80px;border-radius:8px;float:left;margin-right:12px">`
        : '';
      card.innerHTML = `
        <div style="min-height:80px">
          ${poster}
          <h3>${this.escapeHtml(m.title)}</h3>
          <div class="meta">
            <span>⭐ ${m.rating ? Number(m.rating).toFixed(1) : 'N/A'}</span>
            <button class="remove-btn" data-id="${m.id}" style="background:none;border:1px solid var(--border);border-radius:6px;padding:2px 8px;cursor:pointer;float:right;color:#ef4444">✕ Remove</button>
          </div>
        </div>`;
      card.querySelector('.remove-btn').addEventListener('click', () => {
        Storage.removeFromWatchlist(m.id);
        this.renderWatchlist(container);
      });
      container.appendChild(card);
    });
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
