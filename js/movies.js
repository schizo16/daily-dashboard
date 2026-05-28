const TMDB_KEY = CONFIG.TMDB_KEY;
const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';
const TMDB_IMG_L = 'https://image.tmdb.org/t/p/w342';
const TMDB_LANG = () => currentLocale === 'vi' ? 'vi-VN' : 'en-US';

async function showMovieDetail(id, type) {
  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;z-index:1000;background:rgba(0,0,0,0.7);inset:0;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.15s ease-out;backdrop-filter:blur(4px)';
    panel.innerHTML = `<div style="max-width:640px;margin:0 auto"><div class="loading">${_('loading')}</div></div>`;
  document.body.appendChild(panel);
  panel.onclick = (e) => { if (e.target === panel) panel.remove(); };
  

  try {
    const isM = type === 'movie';
    const r = await fetch(`https://api.themoviedb.org/3/${isM ? 'movie' : 'tv'}/${id}?api_key=${TMDB_KEY}&language=${TMDB_LANG()}&append_to_response=credits`);
    if (!r.ok) throw Error('API error');
    const d = await r.json();
    const title = isM ? d.title : d.name;
    const year = (d.release_date || d.first_air_date || '').slice(0, 4);
    const runtime = isM ? (d.runtime ? d.runtime + ' min' : '') : (d.number_of_seasons ? d.seasons + ' seasons' : '');
    const genres = (d.genres || []).map(g => g.name).join(', ');
    const cast = (d.credits?.cast || []).slice(0, 8).map(p => p.name).join(', ');
    const poster = d.poster_path ? `<img src="https://image.tmdb.org/t/p/w185${d.poster_path}" alt="" style="width:100px;border-radius:6px;float:left;margin:0 14px 12px 0">` : '';
    const tagline = d.tagline ? `<p style="font-style:italic;color:var(--text-2);margin-bottom:12px">${esc(d.tagline)}</p>` : '';
    const rating = d.vote_average ? `${d.vote_average.toFixed(1)}/10` : 'N/A';
    const homepage = d.homepage ? `<a href="${d.homepage}" target="_blank" style="color:var(--accent)">🌐 Website</a>` : '';
    const tmdbUrl = `https://www.themoviedb.org/${isM ? 'movie' : 'tv'}/${id}`;

    const inner = document.createElement('div');
    inner.style.cssText = 'max-width:480px;width:90%;max-height:80vh;overflow-y:auto;position:relative;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.3);animation:fadeIn 0.2s ease-out';
    inner.innerHTML = `
      <button id="detail-close" style="position:absolute;top:12px;right:12px;z-index:10;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--text-2)">✕</button>
      <div style="overflow:hidden">
        ${poster}
        <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px">${esc(title)} <span style="font-weight:400;color:var(--text-2);font-size:1rem">(${year})</span></h2>
        ${tagline}
        <div style="font-size:0.85rem;color:var(--text-2);margin-bottom:12px;display:flex;gap:12px;flex-wrap:wrap">
          <span>⭐ ${rating}</span>
          ${runtime ? `<span>⏱ ${runtime}</span>` : ''}
          ${genres ? `<span>🏷 ${esc(genres)}</span>` : ''}
          ${homepage}
        </div>
      </div>
      ${d.overview ? `<div style="clear:both;margin-bottom:16px"><h3 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-2);margin-bottom:6px">Overview</h3><p style="font-size:0.9rem;line-height:1.6;color:var(--text-2)">${esc(d.overview)}</p></div>` : ''}
      ${cast ? `<div style="margin-bottom:16px"><h3 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-2);margin-bottom:6px">Cast</h3><p style="font-size:0.85rem;color:var(--text-2)">${esc(cast)}</p></div>` : ''}
      <div style="font-size:0.75rem;color:var(--text-3)"><a href="${tmdbUrl}" target="_blank" style="color:var(--accent)">TMDB ↗</a></div>`;
    inner.querySelector('#detail-close').onclick = () => panel.remove();
    panel.innerHTML = '';
    panel.appendChild(inner);
  } catch {
    panel.innerHTML = `<div style="max-width:640px;margin:0 auto;padding:48px 0;text-align:center;color:var(--text-2)">${_('failed')}</div>`;
  }
}

const PERIODS = [
  { id: 'week', label: 'Tuần' },
  { id: 'month', label: 'Tháng' },
  { id: 'year', label: 'Năm' },
  { id: 'top', label: 'Top' },
];

const Movies = {
  _mediaType: 'movie', _periodId: 'week', _moodId: 'all', _gridPage: 1, _navEl: null,

  async load(c) {
    c.innerHTML = `<div class="loading">${_('loading')}</div>`;
    try {
      c.innerHTML = `<div class="card">
        <div class="section-h"><h2 id="ms-title">${_('trendingMovies')}</h2><button id="wl-tog" class="wl-toggle">${_('navWatchlist')}</button></div>
        <div id="ms-type" style="display:flex;gap:12px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:6px">
          <button class="ms-btn active" data-type="movie" style="padding:4px 0;border:none;background:none;cursor:pointer;font-family:inherit;font-size:0.85rem;color:var(--text);font-weight:600;border-bottom:2px solid var(--accent)">🎬 Movies</button>
          <button class="ms-btn" data-type="tv" style="padding:4px 0;border:none;background:none;cursor:pointer;font-family:inherit;font-size:0.85rem;color:var(--text-2);font-weight:400;border-bottom:2px solid transparent">📺 Series</button>
        </div>
        <div id="ms-period" style="display:flex;gap:10px;margin-bottom:14px;border-bottom:1px solid var(--border);padding-bottom:6px"></div>
        <div id="mg"></div>
        <div id="mw" style="display:none"></div>
        <div style="margin-top:12px"><button class="btn" id="m-random-btn" style="width:100%;font-size:0.75rem">🎲 Random Movie</button></div>
        <div id="m-random" style="display:none"></div>
      </div>`;
      this._mediaType = 'movie'; this._periodId = 'week'; this._moodId = 'all'; this._gridPage = 1;
      this.renderPeriods();
      this.wl(document.getElementById('mw'));
      document.getElementById('wl-tog').onclick = () => {
        const g = document.getElementById('mg'), w = document.getElementById('mw'), b = document.getElementById('wl-tog');
        const s = w.style.display !== 'none';
        g.style.display = s ? '' : 'none'; w.style.display = s ? 'none' : '';
        b.textContent = s ? _('navWatchlist') : _('movies');
      };
      document.getElementById('m-random-btn').onclick = async () => {
        const panel = document.getElementById('m-random');
        panel.style.display = '';
        panel.innerHTML = '<div class="loading" style="padding:16px 0">Rolling...</div>';
        try {
          const isMovie = this._mediaType === 'movie';
          const page = Math.floor(Math.random() * 20) + 1;
          const r = await fetch(`https://api.themoviedb.org/3/${isMovie ? 'movie' : 'tv'}/popular?api_key=${TMDB_KEY}&language=${TMDB_LANG()}&page=${page}`);
          if (!r.ok) throw Error();
          const data = await r.json();
          const pick = data.results[Math.floor(Math.random() * data.results.length)];
          showMovieDetail(pick.id, this._mediaType);
          panel.style.display = 'none';
        } catch {
          panel.innerHTML = '<div class="error" style="padding:16px 0">Failed. <button class="btn" onclick="document.getElementById(\'m-random-btn\').click()">Retry</button></div>';
        }
      };

      document.querySelectorAll('#ms-type .ms-btn').forEach(btn => {
        btn.onclick = () => {
          document.querySelectorAll('#ms-type .ms-btn').forEach(x => {
            x.style.color = 'var(--text-2)'; x.style.fontWeight = '400'; x.style.borderBottomColor = 'transparent';
          });
          btn.style.color = 'var(--text)'; btn.style.fontWeight = '600'; btn.style.borderBottomColor = 'var(--accent)';
          this._mediaType = btn.dataset.type;
          this._gridPage = 1;
          document.getElementById('ms-title').textContent = this._mediaType === 'movie' ? _('trendingMovies') : '📺 TV Series';
          this.loadPage();
        };
      });
      await this.loadPage();
      this.loadNews(c);
    } catch (e) {
      c.innerHTML = `<div class="loading error">${_('tmdbError')}. <button class="btn" onclick="Movies.load(this.parentElement.parentElement)">${_('retry')}</button></div>`;
    }
  },

  renderPeriods() {
    const bar = document.getElementById('ms-period'); if (!bar) return;
    bar.innerHTML = '';
    PERIODS.forEach(p => {
      const b = document.createElement('button');
      b.className = 'ms-btn' + (p.id === 'week' ? ' active' : '');
      b.textContent = p.label;
      b.style.cssText = 'padding:4px 0;border:none;background:none;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.03em;border-bottom:2px solid ' + (p.id === 'week' ? 'var(--accent)' : 'transparent') + ';color:' + (p.id === 'week' ? 'var(--text)' : 'var(--text-2)') + ';font-weight:' + (p.id === 'week' ? '600' : '400');
      b.onclick = () => {
        bar.querySelectorAll('.ms-btn').forEach(x => {
          x.style.color = 'var(--text-2)'; x.style.fontWeight = '400'; x.style.borderBottomColor = 'transparent';
        });
        b.style.color = 'var(--text)'; b.style.fontWeight = '600'; b.style.borderBottomColor = 'var(--accent)';
        this._periodId = p.id; this._gridPage = 1; this.loadPage();
      };
      bar.appendChild(b);
    });
  },

  async loadPage() {
    const grid = document.getElementById('mg'); if (!grid) return;
    if (this._navEl) { this._navEl.remove(); this._navEl = null; }
    grid.innerHTML = `<div class="loading" style="padding:20px 0">${_('loading')}</div>`;
    try {
      const isMovie = this._mediaType === 'movie';
      let url;

      if (this._periodId === 'top') {
        url = isMovie
          ? `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_KEY}&language=${TMDB_LANG()}&page=${this._gridPage}`
          : `https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_KEY}&language=${TMDB_LANG()}&page=${this._gridPage}`;
      } else if (this._periodId === 'week') {
        url = isMovie
          ? `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}&language=${TMDB_LANG()}&page=${this._gridPage}`
          : `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_KEY}&language=${TMDB_LANG()}&page=${this._gridPage}`;
      } else {
        const date = new Date();
        let start, end;
        if (this._periodId === 'month') {
          start = new Date(date.getFullYear(), date.getMonth(), 1);
          end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        } else {
          start = new Date(date.getFullYear(), 0, 1);
          end = new Date(date.getFullYear(), 11, 31);
        }
        const fmt = d => d.toISOString().split('T')[0];
        if (isMovie) {
          url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&sort_by=popularity.desc&primary_release_date.gte=${fmt(start)}&primary_release_date.lte=${fmt(end)}&language=${TMDB_LANG()}&page=${this._gridPage}`;
        } else {
          url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&sort_by=popularity.desc&first_air_date.gte=${fmt(start)}&first_air_date.lte=${fmt(end)}&language=${TMDB_LANG()}&page=${this._gridPage}`;
        }
      }

      const r = await fetch(url);
      if (!r.ok) throw new Error('API error');
      const data = await r.json();
      const results = data.results.slice(0, 12).map(m => ({
        id: m.id, t: isMovie ? m.title : m.name, o: m.overview, p: m.poster_path,
        r: m.vote_average, y: (m.release_date || m.first_air_date || '').slice(0, 4)
      }));
      this.grd(grid, results, isMovie);
      if (data.total_pages > 1) {
        const nav = document.createElement('div');
        nav.style.cssText = 'display:flex;gap:4px;margin-top:12px;justify-content:center;flex-wrap:wrap';
        const maxP = Math.min(data.total_pages, 25);
        for (let p = 1; p <= maxP; p++) {
          const btn = document.createElement('button');
          btn.textContent = p;
          btn.style.cssText = `padding:2px 8px;border:1px solid var(--border);border-radius:3px;background:${p === this._gridPage ? 'var(--accent)' : 'transparent'};color:${p === this._gridPage ? 'var(--bg)' : 'var(--text-2)'};cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem`;
          btn.onclick = () => { this._gridPage = Number(btn.textContent); this.loadPage(); };
          nav.appendChild(btn);
        }
        grid.parentElement.appendChild(nav);
        this._navEl = nav;
      }
    } catch (e) {
      grid.innerHTML = `<div class="empty" style="padding:20px 0">${_('failed')}</div>`;
    }
  },

  grd(c, movies, isMovie) {
    c.innerHTML = '';
    movies.forEach((m, i) => {
      const e = document.createElement('div'); e.className = 'movie-e'; e.style.cursor = 'pointer';
      e.style.animation = 'fadeIn 0.3s ease-out both'; e.style.animationDelay = `${i * 0.03}s`;
      const poster = m.p ? `<div class="movie-thumb"><img src="${TMDB_IMG + m.p}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>` : '<div class="movie-thumb" style="font-size:1.2rem">🎬</div>';
      e.innerHTML = `${poster}<div class="movie-body"><div class="movie-name">${esc(m.t)}</div><div class="movie-sub">${m.y}${m.o ? ' · ' + esc(m.o.slice(0, 50)) + '...' : ''} · ${m.r ? m.r.toFixed(1) : 'N/A'}</div></div><button class="wl-btn" data-id="${m.id}">${_('save')}</button>`;
      e.querySelector('.wl-btn').onclick = (ev) => { ev.stopPropagation();
        const b = ev.currentTarget;
        Storage.addToWatchlist({ id: m.id, title: m.t });
        b.textContent = _('saved'); b.disabled = true;
      };
      e.onclick = () => showMovieDetail(m.id, this._mediaType);
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

  async loadNews(c) {
    try {
      const r = await fetch('https://www.reddit.com/r/movies/hot.json?limit=15');
      if (!r.ok) return;
      const data = await r.json();
      const posts = data.data.children.filter(x => !x.data.stickied && x.data.score > 10).slice(0, 10).map(x => ({
        t: x.data.title, u: x.data.url, s: x.data.score, c: x.data.num_comments
      }));
      if (!posts.length) return;
      const div = document.createElement('div'); div.className = 'card';
      div.style.marginTop = '12px';
      div.innerHTML = `<div class="section-h"><h2>${_('movieNews')}</h2><a href="https://reddit.com/r/movies" target="_blank">r/movies ↗</a></div>`;
      const list = document.createElement('div');
      posts.forEach((p, i) => {
        const e = document.createElement('div'); e.className = 'entry';
        e.style.animation = 'slideDown 0.3s ease-out both'; e.style.animationDelay = `${0.03 + i * 0.02}s`;
        e.innerHTML = `<div class="entry-thumb">🎬</div><div class="entry-body"><div class="entry-title"><a href="${esc(p.u)}" target="_blank">${esc(p.t)}</a></div>
          <div class="entry-meta"><span>${p.s} points</span><span>${p.c} comments</span><button class="read-btn">📖 ${_('readAloud')}</button></div></div>`;
        e.querySelector('.read-btn').onclick = () => showReader(c, p.t, p.t, p.u);
        list.appendChild(e);
      });
      div.appendChild(list);
      c.appendChild(div);
    } catch (_) {}
  },
};
