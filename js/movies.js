const TMDB_KEY = '64cbee95805bc6f398898e585b312a8c';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';

const MOODS = [
  { id: 'all', label: 'moodAll', genres: '' },
  { id: 'happy', label: 'moodHappy', genres: '35,10751,16' },
  { id: 'sad', label: 'moodSad', genres: '18,10749' },
  { id: 'action', label: 'moodAction', genres: '28,12,53' },
  { id: 'horror', label: 'moodHorror', genres: '27,9648' },
  { id: 'scifi', label: 'moodScifi', genres: '878,14' },
  { id: 'romance', label: 'moodRomance', genres: '10749,10770' },
];

const TVMOODS = [
  { id: 'all', label: 'moodAll', genres: '' },
  { id: 'happy', label: 'moodHappy', genres: '35,10751,16' },
  { id: 'drama', label: 'moodSad', genres: '18' },
  { id: 'action', label: 'moodAction', genres: '10759,9648' },
  { id: 'scifi', label: 'moodScifi', genres: '10765,10764' },
  { id: 'crime', label: 'Kinh dị', genres: '80,18' },
  { id: 'romance', label: 'moodRomance', genres: '10749,10766' },
];

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
        <div id="ms-type" style="display:flex;gap:2px;margin-bottom:12px;border-bottom:1px solid var(--border)">
          <button class="ms-btn active" data-type="movie">🎬 Movies</button>
          <button class="ms-btn" data-type="tv">📺 Series</button>
        </div>
        <div class="mood-bar" id="ms-period" style="display:flex;gap:2px;margin-bottom:10px;border-bottom:1px solid var(--border)"></div>
        <div class="mood-bar" id="mood-bar" style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap"></div>
        <div id="mg"></div>
        <div id="mw" style="display:none"></div>
      </div>`;
      this._mediaType = 'movie'; this._periodId = 'week'; this._moodId = 'all'; this._gridPage = 1;
      this.renderPeriods();
      this.renderMoods();
      this.wl(document.getElementById('mw'));
      document.getElementById('wl-tog').onclick = () => {
        const g = document.getElementById('mg'), w = document.getElementById('mw'), b = document.getElementById('wl-tog');
        const s = w.style.display !== 'none';
        g.style.display = s ? '' : 'none'; w.style.display = s ? 'none' : '';
        b.textContent = s ? _('navWatchlist') : _('movies');
      };
      document.querySelectorAll('.ms-btn').forEach(btn => {
        btn.onclick = () => {
          document.querySelectorAll('.ms-btn').forEach(x => x.classList.toggle('active', x === btn));
          this._mediaType = btn.dataset.type;
          this._gridPage = 1;
          document.getElementById('ms-title').textContent = this._mediaType === 'movie' ? _('trendingMovies') : '📺 TV Series';
          this.renderMoods();
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
      b.style.cssText = 'padding:4px 12px 6px;border:none;border-bottom:2px solid transparent;background:none;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.65rem;text-transform:uppercase;color:var(--text-3)';
      b.onclick = () => {
        bar.querySelectorAll('.ms-btn').forEach(x => { x.classList.remove('active'); x.style.color = 'var(--text-3)'; x.style.borderBottomColor = 'transparent'; });
        b.classList.add('active'); b.style.color = 'var(--text)'; b.style.borderBottomColor = 'var(--accent)';
        this._periodId = p.id; this._gridPage = 1; this.loadPage();
      };
      bar.appendChild(b);
    });
  },

  renderMoods() {
    const bar = document.getElementById('mood-bar'); if (!bar) return;
    bar.innerHTML = '';
    const moods = this._mediaType === 'tv' ? TVMOODS : MOODS;
    this._moodId = 'all';
    moods.forEach(m => {
      const b = document.createElement('button');
      b.className = 'mood-btn';
      b.dataset.mood = m.id;
      b.textContent = _(m.label);
      b.style.cssText = 'padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:transparent;color:var(--text-2);cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem';
      if (m.id === 'all') { b.classList.add('active'); b.style.background = 'var(--accent)'; b.style.color = 'var(--bg)'; b.style.borderColor = 'var(--accent)'; }
      b.onmouseover = () => { if (!b.classList.contains('active')) b.style.borderColor = 'var(--border-2)'; };
      b.onmouseout = () => { if (!b.classList.contains('active')) b.style.borderColor = 'var(--border)'; };
      b.onclick = () => {
        bar.querySelectorAll('.mood-btn').forEach(x => { x.classList.remove('active'); x.style.background = 'transparent'; x.style.color = 'var(--text-2)'; x.style.borderColor = 'var(--border)'; });
        b.classList.add('active'); b.style.background = 'var(--accent)'; b.style.color = 'var(--bg)'; b.style.borderColor = 'var(--accent)';
        this._moodId = m.id; this._gridPage = 1; this.loadPage();
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
      const moods = isMovie ? MOODS : TVMOODS;
      const mood = moods.find(m => m.id === this._moodId) || moods[0];
      let url;

      if (this._periodId === 'top') {
        url = isMovie
          ? `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=${this._gridPage}`
          : `https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_KEY}&language=en-US&page=${this._gridPage}`;
      } else {
        const date = new Date();
        if (this._periodId === 'week') {
          url = isMovie
            ? `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}&language=en-US&page=${this._gridPage}`
            : `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_KEY}&language=en-US&page=${this._gridPage}`;
        } else {
          let start, end;
          if (this._periodId === 'month') {
            start = new Date(date.getFullYear(), date.getMonth(), 1);
            end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          } else if (this._periodId === 'year') {
            start = new Date(date.getFullYear(), 0, 1);
            end = new Date(date.getFullYear(), 11, 31);
          }
          const fmt = d => d.toISOString().split('T')[0];
          const genreFilter = mood.genres ? `&with_genres=${mood.genres}` : '';
          const sortBy = this._periodId === 'month' ? 'vote_average.desc&vote_count.gte=100' : 'popularity.desc';
          const type = isMovie ? 'movie' : 'tv';
          url = `https://api.themoviedb.org/3/discover/${type}?api_key=${TMDB_KEY}&sort_by=${sortBy}&primary_release_date.gte=${fmt(start)}&primary_release_date.lte=${fmt(end)}${genreFilter}&language=en-US&page=${this._gridPage}`;
          if (!isMovie) url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&sort_by=popularity.desc&first_air_date.gte=${fmt(start)}&first_air_date.lte=${fmt(end)}${genreFilter}&language=en-US&page=${this._gridPage}`;
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
    movies.forEach(m => {
      const e = document.createElement('div'); e.className = 'movie-e';
      const poster = m.p ? `<div class="movie-thumb"><img src="${TMDB_IMG + m.p}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>` : '<div class="movie-thumb" style="font-size:1.2rem">🎬</div>';
      e.innerHTML = `${poster}<div class="movie-body"><div class="movie-name">${esc(m.t)}</div><div class="movie-sub">${m.y}${m.o ? ' · ' + esc(m.o.slice(0, 50)) + '...' : ''} · ${m.r ? m.r.toFixed(1) : 'N/A'}</div></div><button class="wl-btn" data-id="${m.id}">${_('save')}</button>`;
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

  async loadNews(c) {
    try {
      const r = await fetch('https://www.reddit.com/r/movies/hot.json?limit=15');
      if (!r.ok) return;
      const data = await r.json();
      const posts = data.data.children.filter(x => !x.data.stickied).slice(0, 10).map(x => ({
        t: x.data.title, u: x.data.url, s: x.data.score, c: x.data.num_comments
      }));
      if (!posts.length) return;
      const div = document.createElement('div'); div.className = 'card';
      div.style.marginTop = '12px';
      div.innerHTML = `<div class="section-h"><h2>${_('movieNews')}</h2><a href="https://reddit.com/r/movies" target="_blank">r/movies ↗</a></div>`;
      const list = document.createElement('div');
      posts.forEach(p => {
        const e = document.createElement('div'); e.className = 'entry';
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
