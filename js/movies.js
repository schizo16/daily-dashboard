const TMDB_KEY = '64cbee95805bc6f398898e585b312a8c';

const Movies = {
  async load(c) {
    c.innerHTML = `<div class="loading">${_('loading')}</div>`;
    try {
      c.innerHTML = `<div class="card"><div class="section-h"><h2>${_('trendingMovies')}</h2><button id="wl-tog" class="wl-toggle">${_('navWatchlist')}</button></div><div id="mg"></div><div id="mw" style="display:none"></div></div>`;
      const m = await this.fetch();
      this.grd(document.getElementById('mg'), m);
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

  async fetch() {
    const r = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}`);
    if (!r.ok) throw new Error(_('tmdbError'));
    return (await r.json()).results.slice(0, 8).map(m => ({
      id: m.id, t: m.title, o: m.overview,
      r: m.vote_average, y: m.release_date ? m.release_date.slice(0, 4) : ''
    }));
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
