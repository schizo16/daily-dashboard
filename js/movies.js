const TMDB_KEY = '64cbee95805bc6f398898e585b312a8c';

const MOODS = [
  { id: 'all', label: 'moodAll', genres: '' },
  { id: 'happy', label: 'moodHappy', genres: '35,10751,16' },
  { id: 'sad', label: 'moodSad', genres: '18,10749' },
  { id: 'action', label: 'moodAction', genres: '28,12,53' },
  { id: 'horror', label: 'moodHorror', genres: '27,9648' },
  { id: 'scifi', label: 'moodScifi', genres: '878,14' },
  { id: 'romance', label: 'moodRomance', genres: '10749,10770' },
];

const Movies = {
  currentMood: 'all',

  async load(c) {
    c.innerHTML = `<div class="loading">${_('loading')}</div>`;
    try {
      c.innerHTML = `<div class="card">
        <div class="section-h"><h2>${_('trendingMovies')}</h2><button id="wl-tog" class="wl-toggle">${_('navWatchlist')}</button></div>
        <div class="mood-bar" id="mood-bar"></div>
        <div id="mg"></div>
        <div id="mw" style="display:none"></div>
      </div>`;
      this.renderMoods();
      await this.loadMovies('all');
      this.wl(document.getElementById('mw'));
      document.getElementById('wl-tog').onclick = () => {
        const g = document.getElementById('mg'), w = document.getElementById('mw'), b = document.getElementById('wl-tog');
        const s = w.style.display !== 'none';
        g.style.display = s ? '' : 'none';
        w.style.display = s ? 'none' : '';
        b.textContent = s ? _('navWatchlist') : _('movies');
      };
    } catch (e) {
      c.innerHTML = `<div class="loading error">${_('tmdbError')}. <button class="btn" onclick="Movies.load(this.parentElement.parentElement)">${_('retry')}</button></div>`;
    }
  },

  renderMoods() {
    const bar = document.getElementById('mood-bar');
    if (!bar) return;
    bar.style.cssText = 'display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap';
    MOODS.forEach(m => {
      const b = document.createElement('button');
      b.className = 'mood-btn' + (m.id === 'all' ? ' active' : '');
      b.dataset.mood = m.id;
      b.textContent = _(m.label);
      b.style.cssText = 'padding:5px 12px;border:1px solid var(--border);border-radius:6px;background:transparent;color:var(--text-2);cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.05em;transition:all 0.12s';
      b.onmouseover = () => { if (!b.classList.contains('active')) b.style.borderColor = 'var(--border-2)'; };
      b.onmouseout = () => { if (!b.classList.contains('active')) b.style.borderColor = 'var(--border)'; };
      b.onclick = () => {
        bar.querySelectorAll('.mood-btn').forEach(x => {
          x.classList.remove('active');
          x.style.background = 'transparent';
          x.style.color = 'var(--text-2)';
          x.style.borderColor = 'var(--border)';
        });
        b.classList.add('active');
        b.style.background = 'var(--accent)';
        b.style.color = 'var(--bg)';
        b.style.borderColor = 'var(--accent)';
        this.currentMood = m.id;
        this.loadMovies(m.id);
      };
      if (m.id === 'all') {
        b.style.background = 'var(--accent)';
        b.style.color = 'var(--bg)';
        b.style.borderColor = 'var(--accent)';
      }
      bar.appendChild(b);
    });
  },

  async loadMovies(moodId) {
    const grid = document.getElementById('mg');
    if (!grid) return;
    grid.innerHTML = `<div class="loading" style="padding:20px 0">${_('loading')}</div>`;
    try {
      const mood = MOODS.find(m => m.id === moodId) || MOODS[0];
      let url;
      if (mood.genres) {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=${mood.genres}&sort_by=popularity.desc&vote_count.gte=50&language=en-US`;
      } else {
        url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}&language=en-US`;
      }
      const r = await fetch(url);
      if (!r.ok) throw new Error('API error');
      const data = await r.json();
      const movies = data.results.slice(0, 10).map(m => ({
        id: m.id, t: m.title, o: m.overview,
        r: m.vote_average, y: m.release_date ? m.release_date.slice(0, 4) : ''
      }));
      this.grd(grid, movies);
    } catch (e) {
      grid.innerHTML = `<div class="empty" style="padding:20px 0">${_('failed')}</div>`;
    }
  },

  grd(c, movies) {
    c.innerHTML = '';
    movies.forEach(m => {
      const e = document.createElement('div'); e.className = 'movie-e';
      e.innerHTML = `<div class="movie-body"><div class="movie-name">${esc(m.t)}</div><div class="movie-sub">${m.y}${m.o ? ' · ' + esc(m.o.slice(0, 60)) + '...' : ''} · ${m.r ? m.r.toFixed(1) : 'N/A'}</div></div><button class="wl-btn" data-id="${m.id}">${_('save')}</button>`;
      e.querySelector('.wl-btn').onclick = (ev) => {
        const b = ev.currentTarget;
        Storage.addToWatchlist({ id: m.id, title: m.t });
        b.textContent = _('saved'); b.disabled = true;
      };
      c.appendChild(e);
    });
  },

  wl(c) {
    const items = Storage.getWatchlist();
    if (!items.length) { c.innerHTML = `<div class="empty" style="padding:16px 0 0">${_('nothingSaved')}</div>`; return; }
    c.innerHTML = '';
    items.forEach(m => {
      const e = document.createElement('div'); e.className = 'movie-e';
      e.innerHTML = `<div class="movie-body"><div class="movie-name">${esc(m.title)}</div></div><button class="rm-btn" data-id="${m.id}">${_('remove')}</button>`;
      e.querySelector('.rm-btn').onclick = () => { Storage.removeFromWatchlist(m.id); Movies.wl(c); };
      c.appendChild(e);
    });
  },
};
