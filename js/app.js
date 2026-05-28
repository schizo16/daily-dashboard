/* ─── i18n ─── */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = _(key);
  });
  document.getElementById('locale-btn').textContent = currentLocale === 'vi' ? 'EN' : 'VI';
}
document.getElementById('locale-btn').onclick = () => {
  setLocale(currentLocale === 'vi' ? 'en' : 'vi');
};

/* ─── Page Loaders ─── */



const GAME_GENRES = [
  { id: 'topdeals', label: '⭐🔥 Top deal', url: 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20&sortBy=Savings&steamRating=85&pageNumber=' },
  { id: 'popular', label: '🔥 Phổ biến', url: 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20&sortBy=DealRating&steamRating=60&pageNumber=' },
  { id: 'deals', label: '🏷️ Giảm giá', url: 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20&sortBy=Savings&steamRating=60&pageNumber=' },
  { id: 'under5', label: '💵 Dưới $5', url: 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20&sortBy=Savings&maxPrice=5&pageNumber=' },
  { id: 'under10', label: '💵 Dưới $10', url: 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20&sortBy=Savings&maxPrice=10&pageNumber=' },
  { id: 'toprated', label: '⭐ Top rate', url: 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20&sortBy=Metacritic&steamRating=90&pageNumber=' },
  { id: 'new', label: '🆕 Mới', url: 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20&sortBy=Release&steamRating=60&pageNumber=' },
];

const GamesPage = {
  load(container) {
    container.innerHTML = '';
    this.loadGames(container);
    this.loadNews(container);
  },
  async loadGames(c) {
    try {
      const div = document.createElement('div'); div.className = 'card';
      div.style.marginTop = '12px';
      div.innerHTML = `<div class="section-h"><h2>🎮 Steam Deals</h2><a href="https://www.cheapshark.com" target="_blank">cheapshark ↗</a></div>
        <div class="mood-bar" id="gp-bar" style="display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap"></div>
        <div id="gp-grid"></div>`;
      c.appendChild(div);
      this._page = 1; this._genre = 'topdeals';
      this.renderGenreBar();
      await this.loadPage();
    } catch (_) {}
  },
  renderGenreBar() {
    const bar = document.getElementById('gp-bar');
    if (!bar) return;
    GAME_GENRES.forEach(g => {
      const b = document.createElement('button');
      b.className = 'mood-btn';
      b.textContent = g.label;
      b.style.cssText = 'padding:4px 10px;border:1px solid var(--border);border-radius:5px;background:transparent;color:var(--text-2);cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem';
      if (g.id === this._genre) { b.classList.add('active'); b.style.background = 'var(--accent)'; b.style.color = 'var(--bg)'; b.style.borderColor = 'var(--accent)'; }
      b.onmouseover = () => { if (!b.classList.contains('active')) b.style.borderColor = 'var(--border-2)'; };
      b.onmouseout = () => { if (!b.classList.contains('active')) b.style.borderColor = 'var(--border)'; };
      b.onclick = () => {
        bar.querySelectorAll('.mood-btn').forEach(x => { x.classList.remove('active'); x.style.background = 'transparent'; x.style.color = 'var(--text-2)'; x.style.borderColor = 'var(--border)'; });
        b.classList.add('active'); b.style.background = 'var(--accent)'; b.style.color = 'var(--bg)'; b.style.borderColor = 'var(--accent)';
        this._genre = g.id; this._page = 1; this.loadPage();
      };
      bar.appendChild(b);
    });
  },
  async loadPage() {
    const grid = document.getElementById('gp-grid');
    if (!grid) return;
    // Remove old pagination nav
    const oldNav = grid.parentElement.querySelector('.gp-nav');
    if (oldNav) oldNav.remove();
    grid.innerHTML = '<div class="loading" style="padding:16px 0">Loading...</div>';
    const genre = GAME_GENRES.find(g => g.id === this._genre);
    if (!genre) return;
    try {
      const r = await fetch(genre.url + this._page);
      if (!r.ok) throw Error('API error');
      const deals = await r.json();
      grid.innerHTML = '';
      if (!deals || !deals.length) { grid.innerHTML = '<div class="empty" style="padding:16px 0">No deals</div>'; return; }
      deals.slice(0, 15).forEach((g, i) => {
        const e = document.createElement('a'); e.className = 'movie-e';
        e.style.animation = 'fadeIn 0.3s ease-out both'; e.style.animationDelay = `${i * 0.025}s`;
        e.href = `https://store.steampowered.com/app/${g.steamAppID}/`; e.target = '_blank';
        e.style.cssText = 'text-decoration:none;display:flex;cursor:pointer';
        const img = g.thumb || '';
        const pct = g.savings ? Math.round(Number(g.savings)) : 0;
        const rating = g.steamRatingPercent ? `${g.steamRatingPercent}%` : '—';
        const ratingTxt = g.steamRatingText ? `<span style="color:#4ade80">${esc(g.steamRatingText)}</span>` : '';
        const price = g.salePrice ? `$${g.salePrice}` : 'Free';
        const orig = g.normalPrice && g.normalPrice !== g.salePrice ? `<s>$${g.normalPrice}</s>` : '';
        e.innerHTML = `<div class="movie-thumb" style="width:60px;height:34px">${img ? `<img src="${img}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : '🎮'}</div>
          <div class="movie-body"><div class="movie-name" style="color:var(--text)">${esc(g.title || g.external || '')}</div>
          <div class="movie-sub">${pct ? `<span style="background:#4ade80;color:#000;padding:1px 5px;border-radius:3px;font-weight:700">-${pct}%</span> ` : ''}${orig} <span style="font-weight:600">${price}</span> · ⭐ ${rating} ${ratingTxt}</div></div>`;
        grid.appendChild(e);
      });
      const nav = document.createElement('div');
      nav.className = 'gp-nav';
      nav.style.cssText = 'display:flex;gap:4px;margin-top:12px;justify-content:center;align-items:center;flex-wrap:wrap';
      const total = Math.min(50, this._page + 4);
      const start = Math.max(1, this._page - 2);
      for (let p = start; p <= Math.min(total, start + 4); p++) {
        const btn = document.createElement('button');
        btn.textContent = p;
        btn.style.cssText = `min-width:28px;height:28px;border:1px solid ${p === this._page ? 'var(--accent)' : 'var(--border)'};border-radius:4px;background:${p === this._page ? 'var(--accent)' : 'transparent'};color:${p === this._page ? 'var(--bg)' : 'var(--text-2)'};cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.65rem;transition:all 0.1s`;
        btn.onmouseover = () => { if (p !== this._page) btn.style.borderColor = 'var(--text-3)'; };
        btn.onmouseout = () => { if (p !== this._page) btn.style.borderColor = 'var(--border)'; };
        btn.onclick = () => { this._page = p; this.loadPage(); };
        nav.appendChild(btn);
      }
      grid.parentElement.appendChild(nav);
    } catch (e) {
      grid.innerHTML = '<div class="empty" style="padding:16px 0">Failed to load. <button class="btn" onclick="GamesPage.loadPage()">Retry</button></div>';
    }
  },
  async loadNews(c) {
    try {
      const r = await fetch('https://www.reddit.com/r/gaming/hot.json?limit=15');
      if (!r.ok) return;
      const data = await r.json();
      const posts = data.data.children.filter(x => !x.data.stickied).slice(0, 12).map(x => ({
        t: x.data.title, u: x.data.url, s: x.data.score, c: x.data.num_comments
      }));
      if (!posts.length) return;
      const div = document.createElement('div'); div.className = 'card';
      div.style.marginTop = '12px';
      div.innerHTML = `<div class="section-h"><h2>${_('gameNews')}</h2><a href="https://reddit.com/r/gaming" target="_blank">r/gaming ↗</a></div>`;
      const list = document.createElement('div');
      posts.forEach((p, i) => {
        const e = document.createElement('div'); e.className = 'entry';
        e.style.animation = 'slideDown 0.3s ease-out both'; e.style.animationDelay = `${0.03 + i * 0.02}s`;
        e.innerHTML = `<div class="entry-thumb">🎮</div><div class="entry-body">
          <div class="entry-title"><a href="${esc(p.u)}" target="_blank">${esc(p.t)}</a></div>
          <div class="entry-meta"><span>${p.s} points</span><span>${p.c} comments</span><button class="read-btn" data-text="${esc(p.t)}">📖 ${_('readAloud')}</button></div>
        </div>`;
        e.querySelector('.read-btn').onclick = () => showReader(c, p.t, p.t, p.u);
        list.appendChild(e);
      });
      div.appendChild(list);
      c.appendChild(div);
    } catch (_) {}
  }
};

const WatchlistPage = {
  load(container) {
    const items = Storage.getWatchlist();
    let html = `<div class="card"><div class="section-h"><h2>${_('navWatchlist')}</h2></div>`;
    if (!items.length) {
      html += `<div class="empty" style="padding:16px 0">${_('nothingSavedBrowse')}</div>`;
    } else {
      html += '<div id="wl-list">';
      items.forEach(m => {
        html += `<div class="movie-e"><div class="movie-body"><div class="movie-name">${esc(m.title)}</div></div><button class="rm-btn" data-id="${m.id}">${_('remove')}</button></div>`;
      });
      html += '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
    container.querySelectorAll('.rm-btn').forEach(b => {
      b.onclick = () => {
        Storage.removeFromWatchlist(Number(b.dataset.id));
        WatchlistPage.load(container);
      };
    });
  }
};

/* ─── AI Journalist ─── */
const AI_KEY = 'AIzaSyCDUdpLXKQzx_exXm5RIG7l8Gq5RjdjPcU';

async function aiWrite(title, content) {
  if (!content) return '';
  // Try Gemini first
  try {
    const prompt = `Bạn là biên tập viên báo điện tử. Viết lại tin sau thành bài báo tiếng Việt chuyên nghiệp, hấp dẫn. Giữ nguyên sự thật, thêm ngữ cảnh. Dài 2-3 đoạn ngắn.

Tin gốc (tiếng Anh):
Tiêu đề: ${title}
Nội dung: ${content.slice(0, 2000)}`;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AI_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 800 } })
    });
    if (r.ok) {
      const d = await r.json();
      const t = d.candidates?.[0]?.content?.parts?.[0]?.text;
      if (t) return t;
    }
  } catch {}

  // Fallback: LibreTranslate
  try {
    const r = await fetch('https://libretranslate.com/translate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `Tiêu đề: ${title}\n\n${content.slice(0, 1000)}`, source: 'en', target: 'vi' })
    });
    if (r.ok) {
      const d = await r.json();
      if (d.translatedText) return d.translatedText;
    }
  } catch {}

  return content;
}

/* ─── Inline Reader ─── */
function showReader(container, title, content, sourceUrl) {
  const existing = document.getElementById('reader-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'reader-panel';
  panel.style.cssText = 'position:fixed;inset:0;z-index:1000;background:var(--bg);overflow-y:auto;padding:24px;animation:fadeIn 0.2s ease-out';
  panel.innerHTML = `
    <div style="max-width:640px;margin:0 auto;position:relative">
      <button id="reader-close" style="position:fixed;top:16px;right:16px;z-index:10;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:6px 12px;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.75rem;color:var(--text-2)">✕ Đóng</button>
      <div id="reader-title" style="font-size:1.2rem;font-weight:700;margin-bottom:16px;padding-right:80px">${esc(title)}</div>
      <div id="reader-content" style="font-size:0.92rem;line-height:1.7;color:var(--text-2)"><div class="loading">AI đang viết bài...</div></div>
      <div style="margin-top:20px;font-size:0.72rem;color:var(--text-3)"><a href="${esc(sourceUrl)}" target="_blank" style="color:var(--accent)">${_('viewOriginal')} ↗</a></div>
    </div>`;
  document.body.appendChild(panel);
  document.getElementById('reader-close').onclick = () => panel.remove();
  panel.addEventListener('click', (e) => { if (e.target === panel) panel.remove(); });

  (async () => {
    const article = await aiWrite(title, content);
    const parts = article.split('\n').filter(p => p.trim()).map(p => `<p style="margin-bottom:12px">${esc(p)}</p>`).join('');
    document.getElementById('reader-content').innerHTML = parts || `<p>${esc(article)}</p>`;
  })();
}

/* ─── Tech News (Vietnamese + global) ─── */
async function loadTechNews(c) {
  try {
    const [vnRes, enRes] = await Promise.all([
      fetch('https://www.reddit.com/r/congnghe/hot.json?limit=8').catch(() => null),
      fetch('https://www.reddit.com/r/artificial/hot.json?limit=8').catch(() => null)
    ]);
    const allPosts = [];
    if (vnRes && vnRes.ok) {
      const d = await vnRes.json();
      d.data.children.filter(x => !x.data.stickied).slice(0, 8).forEach(x => {
        allPosts.push({ t: x.data.title, u: x.data.url, s: x.data.score, lang: 'VI' });
      });
    }
    if (enRes && enRes.ok) {
      const d = await enRes.json();
      d.data.children.filter(x => !x.data.stickied).slice(0, 8).forEach(x => {
        allPosts.push({ t: x.data.title, u: x.data.url, s: x.data.score, lang: 'EN' });
      });
    }
    if (!allPosts.length) return;
    const div = document.createElement('div'); div.className = 'card';
    div.style.marginTop = '12px';
    div.innerHTML = `<div class="section-h"><h2>${_('techNews')}</h2><a href="https://reddit.com/r/artificial" target="_blank">reddit ↗</a></div>`;
    const list = document.createElement('div');
    allPosts.forEach((p, i) => {
      const e = document.createElement('div'); e.className = 'entry';
      e.style.animation = 'slideDown 0.3s ease-out both'; e.style.animationDelay = `${0.03 + i * 0.02}s`;
      const icon = p.lang === 'VI' ? '🇻🇳' : '🤖';
      e.innerHTML = `<div class="entry-thumb">${icon}</div><div class="entry-body">
        <div class="entry-title"><a href="${esc(p.u)}" target="_blank">${esc(p.t)}</a></div>
        <div class="entry-meta"><span>${p.lang}</span><span>${p.s} points</span><button class="read-btn" data-text="${esc(p.t)}">📖 ${_('readAloud')}</button></div>
      </div>`;
      e.querySelector('.read-btn').onclick = () => showReader(c, p.t, p.t, p.u);
      list.appendChild(e);
    });
    div.appendChild(list);
    c.appendChild(div);
  } catch (_) {}
}

function esc(s) {
  if (typeof s !== 'string') s = String(s);
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ─── Router ─── */

function show(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav a[data-page]').forEach(a => a.classList.remove('active'));

  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');

  const link = document.querySelector(`.nav a[data-page="${page}"]`);
  if (link) link.classList.add('active');

  if (page === 'radar') { AiRadar.load(el); loadTechNews(el); }
  else if (page === 'movies') Movies.load(el);
  else if (page === 'games') GamesPage.load(el);
  else if (page === 'watchlist') WatchlistPage.load(el);
  else if (page === 'tools') ToolsPage.load(el);
  else if (page === 'radio') RadioPage.load(el);
  startAutoRefresh(page);
}

/* ─── Auto-refresh ─── */
const REFRESH_INTERVALS = {
  radar: 5 * 60 * 1000,
  movies: 30 * 60 * 1000,
  games: 30 * 60 * 1000,
};
let refreshTimers = {};

function startAutoRefresh(page) {
  stopAutoRefresh();
  const ms = REFRESH_INTERVALS[page];
  if (!ms) return;
  refreshTimers[page] = setTimeout(() => {
    const el = document.getElementById('page-' + page);
    if (el && el.classList.contains('active')) {
      if (page === 'radar') AiRadar.load(el);
      else if (page === 'movies') Movies.load(el);
      else if (page === 'games') GamesPage.load(el);
    }
  }, ms);
}

function stopAutoRefresh() {
  Object.values(refreshTimers).forEach(t => clearTimeout(t));
  refreshTimers = {};
}

function route() {
  show((location.hash.slice(1) || 'home').split('?')[0].split('&')[0]);
}

window.addEventListener('hashchange', route);

/* ─── Theme ─── */
const t = Storage.getTheme();
document.documentElement.setAttribute('data-theme', t);
document.getElementById('theme-btn').textContent = t === 'dark' ? '☀️' : '🌙';
document.getElementById('theme-btn').onclick = () => {
  const n = Storage.getTheme() === 'dark' ? 'light' : 'dark';
  Storage.setTheme(n);
  document.documentElement.setAttribute('data-theme', n);
  document.getElementById('theme-btn').textContent = n === 'dark' ? '☀️' : '🌙';
};

/* ─── Radio ─── */
const COUNTRIES = [
  { name: '🇺🇸 United States', code: 'US' },
  { name: '🇬🇧 United Kingdom', code: 'GB' },
  { name: '🇻🇳 Vietnam', code: 'VN' },
  { name: '🇯🇵 Japan', code: 'JP' },
  { name: '🇰🇷 South Korea', code: 'KR' },
  { name: '🇨🇳 China', code: 'CN' },
  { name: '🇫🇷 France', code: 'FR' },
  { name: '🇩🇪 Germany', code: 'DE' },
  { name: '🇪🇸 Spain', code: 'ES' },
  { name: '🇮🇹 Italy', code: 'IT' },
  { name: '🇧🇷 Brazil', code: 'BR' },
  { name: '🇮🇳 India', code: 'IN' },
  { name: '🇦🇺 Australia', code: 'AU' },
  { name: '🇨🇦 Canada', code: 'CA' },
  { name: '🇷🇺 Russia', code: 'RU' },
  { name: '🇹🇭 Thailand', code: 'TH' },
];

const RadioPage = {
  _audio: null, _country: null,
  load(c) {
    this._c = c;
    this._audio = new Audio();
    this._audio.volume = 0.7;
    this.showCountries();
  },

  showCountries() {
    this._c.innerHTML = `<div class="card">
      <div class="section-h"><h2>📻 Radio</h2></div>
      <div id="radio-now" style="text-align:center;padding:20px 0">
        <div style="font-size:2.2rem;margin-bottom:6px" id="radio-icon">📻</div>
        <div style="font-size:0.95rem;font-weight:600;margin-bottom:4px" id="radio-title">Choose a country</div>
        <div style="font-size:0.75rem;color:var(--text-2)" id="radio-status">Select a country to browse stations</div>
      </div>
      <div id="radio-controls" style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">
        <button class="btn" id="radio-play" style="display:none">▶ Play</button>
        <button class="btn" id="radio-stop" style="display:none">⏹ Stop</button>
      </div>
      <div id="radio-back" style="display:none;margin-bottom:12px"><button class="btn" onclick="RadioPage.showCountries()">← Back to countries</button></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px" id="radio-content">
        ${COUNTRIES.map(c => `
          <div class="country-btn" data-code="${c.code}" style="padding:12px;border:1px solid var(--border);border-radius:6px;cursor:pointer;text-align:center;transition:all 0.12s" onmouseover="this.style.borderColor='var(--border-2)'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="font-size:0.82rem;font-weight:500">${c.name}</div>
          </div>`).join('')}
      </div>
    </div>`;
    this._c.querySelectorAll('.country-btn').forEach(b => {
      b.onclick = () => this.loadStations(b.dataset.code);
    });
  },

  async loadStations(code) {
    const country = COUNTRIES.find(c => c.code === code);
    if (!country) return;
    this._country = code;
    const container = document.getElementById('radio-content');
    const now = document.getElementById('radio-now');
    container.innerHTML = '<div class="loading" style="padding:20px 0">Loading stations...</div>';
    document.getElementById('radio-back').style.display = 'block';
    document.getElementById('radio-controls').style.display = 'flex';

    try {
      const r = await fetch(`https://de1.api.radio-browser.info/json/stations/bycountry/${encodeURIComponent(country.name.replace(/^[^\s]+\s/, ''))}?limit=30&order=votes&reverse=true&hidebroken=true`);
      if (!r.ok) throw Error();
      const stations = (await r.json()).filter(s => s.url && (s.codec === 'MP3' || s.codec === 'AAC' || s.codec === 'OGG')).slice(0, 20);
      if (!stations.length) throw Error();

      container.innerHTML = '';
      stations.forEach(s => {
        const d = document.createElement('div');
        d.style.cssText = 'padding:10px 12px;border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:all 0.12s';
        d.onmouseover = () => { d.style.borderColor = 'var(--border-2)'; };
        d.onmouseout = () => { d.style.borderColor = 'var(--border)'; };
        d.innerHTML = `<div style="font-size:0.82rem;font-weight:500">${esc(s.name)}</div>
          <div style="font-size:0.65rem;color:var(--text-3);margin-top:2px">${esc(s.country || '')} · ${s.codec || ''} · ${s.bitrate || ''}kbps</div>`;
        d.onclick = () => this.play(s.url, s.name, country.name);
        container.appendChild(d);
      });
    } catch {
      container.innerHTML = '<div class="empty" style="padding:20px 0">Could not load stations. Try another country.</div>';
    }
  },

  play(url, name, countryName) {
    const stop = document.getElementById('radio-stop');
    const play = document.getElementById('radio-play');
    if (stop) stop.style.display = '';
    if (play) play.style.display = '';

    const icon = document.getElementById('radio-icon');
    const title = document.getElementById('radio-title');
    const status = document.getElementById('radio-status');
    if (icon) icon.textContent = '📻';
    if (title) title.textContent = name;
    if (status) status.textContent = `🔊 Playing · ${countryName}`;

    this._currentUrl = url;
    this._currentName = name;
    this._currentCountry = countryName;

    this._audio.src = url;
    this._audio.play().catch(() => {
      if (status) status.textContent = '❌ Cannot play (CORS or dead link)';
    });

    if (stop) stop.onclick = () => { this._audio.pause(); this._audio.src = ''; if (status) status.textContent = '⏹ Stopped'; this.hidePlayer(); };
    if (play) play.onclick = () => this._audio.play();

    this.showPlayer();
  },

  showPlayer() {
    let bar = document.getElementById('radio-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'radio-bar';
      document.body.appendChild(bar);
    }
    bar.style.cssText = 'position:fixed;bottom:0;left:50%;transform:translateX(-50%);z-index:999;background:var(--surface);border:1px solid var(--border);border-top-left-radius:10px;border-top-right-radius:10px;padding:10px 18px;display:flex;align-items:center;gap:12px;max-width:600px;width:90%;box-shadow:0 -4px 20px rgba(0,0,0,0.15);animation:fadeIn 0.2s ease-out';
    bar.innerHTML = `
      <div style="flex:1;min-width:0">
        <div style="font-size:0.78rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" id="bar-title">${esc(this._currentName)}</div>
        <div style="font-size:0.62rem;color:var(--text-3)" id="bar-country">${esc(this._currentCountry || '')}</div>
      </div>
      <div style="display:flex;gap:4px;align-items:center">
        <button class="btn" id="bar-play" style="padding:4px 10px;font-size:0.75rem">⏸</button>
        <button class="btn" id="bar-stop" style="padding:4px 10px;font-size:0.75rem">⏹</button>
        <button class="btn" id="bar-change" style="padding:4px 10px;font-size:0.7rem">📡 Stations</button>
      </div>`;
    document.getElementById('bar-play').onclick = () => {
      if (this._audio.paused) { this._audio.play(); document.getElementById('bar-play').textContent = '⏸'; }
      else { this._audio.pause(); document.getElementById('bar-play').textContent = '▶'; }
    };
    document.getElementById('bar-stop').onclick = () => {
      this._audio.pause(); this._audio.src = ''; this.hidePlayer();
    };
    document.getElementById('bar-change').onclick = () => {
      if (this._country) this.loadStations(this._country);
      this.hidePlayer();
    };
  },

  hidePlayer() {
    const bar = document.getElementById('radio-bar');
    if (bar) bar.remove();
  },

};

/* ─── Tools ─── */
const ToolsPage = {
  _c: null,
  load(c) { this._c = c; this.showGrid(); },
  showGrid() {
    this._c.innerHTML = `<div class="card"><div class="section-h"><h2>🧰 Tools</h2></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${this.tile('qr','QR Code','Generate QR codes from URLs or text')}
        ${this.tile('pw','Password','Secure random password generator')}
        ${this.tile('counter','Text Count','Count words, chars, lines')}
        ${this.tile('random','Random','Random numbers & dice rolls')}
        ${this.tile('b64','Base64','Encode / decode Base64')}
        ${this.tile('json','JSON','Format and validate JSON')}
        ${this.tile('typing','Typing','Test your typing speed')}
        ${this.tile('dl','Downloader','YouTube, TikTok, IG download links')}
        ${this.tile('color','Color','HEX / RGB color converter')}
      </div></div>`;
    this._c.querySelectorAll('.tool-tile').forEach(t => { t.onclick = () => this.showTool(t.dataset.tool); });
  },
  tile(id, title, desc) {
    return `<div class="tool-tile" data-tool="${id}" style="padding:14px;border:1px solid var(--border);border-radius:6px;cursor:pointer" onmouseover="this.style.borderColor='var(--border-2)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="font-size:0.85rem;font-weight:600;margin-bottom:3px">${title}</div>
      <div style="font-size:0.7rem;color:var(--text-2)">${desc}</div>
    </div>`;
  },
  back() { this.showGrid(); },
  showTool(t) {
    const f = {
      qr: () => this.qrUI(), pw: () => this.pwUI(), counter: () => this.counterUI(),
      random: () => this.randomUI(), b64: () => this.b64UI(), json: () => this.jsonUI(),
      typing: () => this.typingUI(), color: () => this.colorUI(),
      dl: () => this.dlUI(),
    };
    (f[t] || (() => this.showGrid()))();
  },
  render(title, body) {
    this._c.innerHTML = `<div style="margin-bottom:12px"><button class="btn" onclick="ToolsPage.back()">← Back</button></div>
      <div class="card"><div class="section-h"><h2>${title}</h2></div>${body}</div>`;
  },

  qrUI() {
    this.render('QR Code', `<div style="display:flex;gap:8px"><input type="text" id="tqr" class="w-inp" style="flex:1;text-transform:none;text-align:left;width:auto" placeholder="URL or text..."><button class="btn btn-primary" id="tqrb">Generate</button></div>
      <div id="tqro" style="margin-top:12px;text-align:center;min-height:80px"></div>`);
    document.getElementById('tqrb').onclick = () => {
      const v = document.getElementById('tqr').value.trim();
      if (v) document.getElementById('tqro').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(v)}" alt="" style="width:150px;border-radius:6px">`;
    };
  },
  pwUI() {
    this.render('Password', `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="tpw" class="w-inp" style="flex:1;text-transform:none;min-width:180px;font-family:JetBrains Mono,monospace" readonly>
      <button class="btn btn-primary" id="tpwb">Generate</button>
      <label style="font-size:0.65rem;color:var(--text-2);display:flex;align-items:center;gap:4px;font-family:JetBrains Mono,monospace">
        <input type="number" id="tpwl" value="16" min="4" max="64" style="width:50px;border:1px solid var(--border);border-radius:4px;padding:2px 6px;background:var(--surface);color:var(--text);font-family:JetBrains Mono,monospace;font-size:0.7rem"> chars
      </label></div>
      <button class="btn" id="tpwc">📋 Copy</button>`);
    const gen = () => {
      const len = Number(document.getElementById('tpwl').value) || 16;
      const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let p = ''; for (let i = 0; i < len; i++) p += c[Math.floor(Math.random() * c.length)];
      document.getElementById('tpw').value = p;
    };
    document.getElementById('tpwb').onclick = gen; gen();
    document.getElementById('tpwc').onclick = () => {
      document.getElementById('tpw').select(); document.execCommand('copy');
      const b = document.getElementById('tpwc'); b.textContent = '✓ Copied';
      setTimeout(() => { b.textContent = '📋 Copy'; }, 2000);
    };
  },
  counterUI() {
    this.render('Text Counter', `<textarea id="ttc" class="notes-area" style="font-family:inherit;font-size:0.88rem" rows="6" placeholder="Type or paste text..."></textarea>
      <div id="ttco" style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--text-2);margin-top:6px"></div>`);
    const up = () => { const t = document.getElementById('ttc').value; document.getElementById('ttco').textContent = `${t.trim()?t.trim().split(/\s+/).length:0} words · ${t.length} chars · ${t?t.split('\n').length:0} lines`; };
    document.getElementById('ttc').oninput = up; up();
  },
  randomUI() {
    this.render('Random Number', `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
      <label style="font-size:0.7rem;color:var(--text-2);font-family:JetBrains Mono,monospace">Min <input type="number" id="trmin" value="1" style="width:60px;border:1px solid var(--border);border-radius:4px;padding:4px 6px;background:var(--surface);color:var(--text);font-family:JetBrains Mono,monospace;font-size:0.8rem"></label>
      <label style="font-size:0.7rem;color:var(--text-2);font-family:JetBrains Mono,monospace">Max <input type="number" id="trmax" value="100" style="width:60px;border:1px solid var(--border);border-radius:4px;padding:4px 6px;background:var(--surface);color:var(--text);font-family:JetBrains Mono,monospace;font-size:0.8rem"></label>
      <button class="btn btn-primary" id="trb">Roll</button></div>
      <div id="tro" style="font-size:2.5rem;font-weight:700;text-align:center;padding:16px 0;font-family:JetBrains Mono,monospace">—</div>`);
    document.getElementById('trb').onclick = () => { const min=Number(document.getElementById('trmin').value)||1, max=Number(document.getElementById('trmax').value)||100; document.getElementById('tro').textContent=Math.floor(Math.random()*(max-min+1))+min; };
  },
  b64UI() {
    this.render('Base64', `<div style="display:flex;gap:4px;margin-bottom:8px"><button class="btn btn-primary" id="tb64e">Encode →</button><button class="btn" id="tb64d">← Decode</button></div>
      <textarea id="tb64i" class="notes-area" style="font-family:JetBrains Mono,monospace;font-size:0.78rem" rows="4" placeholder="Input..."></textarea>
      <textarea id="tb64o" class="notes-area" style="font-family:JetBrains Mono,monospace;font-size:0.78rem" rows="4" placeholder="Output..." readonly></textarea>`);
    document.getElementById('tb64e').onclick=()=>{try{document.getElementById('tb64o').value=btoa(document.getElementById('tb64i').value)}catch{document.getElementById('tb64o').value='Error'}};
    document.getElementById('tb64d').onclick=()=>{try{document.getElementById('tb64o').value=atob(document.getElementById('tb64i').value)}catch{document.getElementById('tb64o').value='Error'}};
  },
  jsonUI() {
    this.render('JSON Formatter', `<textarea id="tjson" class="notes-area" style="font-family:JetBrains Mono,monospace;font-size:0.78rem" rows="8" placeholder="Paste JSON..."></textarea>
      <div style="display:flex;gap:4px;margin-top:6px"><button class="btn btn-primary" id="tjsonf">Format</button><button class="btn" id="tjsonm">Minify</button></div>
      <div id="tjsone" style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:#a33;margin-top:4px"></div>`);
    const f=(m)=>{try{const o=JSON.parse(document.getElementById('tjson').value);document.getElementById('tjson').value=JSON.stringify(o,null,m?0:2);document.getElementById('tjsone').textContent='';}catch(e){document.getElementById('tjsone').textContent='Error: '+e.message;}};
    document.getElementById('tjsonf').onclick=()=>f(0); document.getElementById('tjsonm').onclick=()=>f(1);
  },
  typingUI() {
    const texts=['The quick brown fox jumps over the lazy dog.','Technology is best when it brings people together.','In the middle of difficulty lies opportunity.'];
    this.render('Typing Test', `<div id="ttypt" style="font-size:0.9rem;line-height:1.6;margin-bottom:12px;padding:12px;background:var(--surface-2);border-radius:6px;font-family:JetBrains Mono,monospace"></div>
      <textarea id="ttypi" class="notes-area" style="font-family:JetBrains Mono,monospace;font-size:0.85rem" rows="3" placeholder="Type here..."></textarea>
      <div style="display:flex;gap:8px;margin-top:6px;align-items:center;flex-wrap:wrap"><button class="btn" id="ttypn">New Text</button><span id="ttyps" style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--text-2)"></span></div>`);
    let start=null, target='';
    const d=document.getElementById('ttypt'), i=document.getElementById('ttypi'), s=document.getElementById('ttyps');
    const n=()=>{target=texts[Math.floor(Math.random()*texts.length)];d.textContent=target;i.value='';s.textContent='';start=null;};
    n();
    i.oninput=()=>{if(!start&&i.value.length===1)start=Date.now();if(i.value===target){const ms=(Date.now()-start)/1000;s.textContent='✅ Done! '+Math.round((target.split(' ').length/ms)*60)+' WPM';i.disabled=true;setTimeout(()=>{i.disabled=false;n();},2000);}else{s.textContent=target.startsWith(i.value)?`${i.value.length}/${target.length}`:'❌ Wrong';}};
    document.getElementById('ttypn').onclick=n;
  },
  dlUI() {
    this.render('Video Downloader', `<div style="margin-bottom:12px">
      <input type="url" id="tdl" class="w-inp" style="width:100%;text-transform:none;text-align:left;font-size:0.82rem" placeholder="Paste YouTube, TikTok, Instagram, Facebook URL...">
      <button class="btn btn-primary" id="tdlb" style="margin-top:6px;width:100%">Fetch & Download</button>
    </div>
    <div id="tdlo" style="font-size:0.82rem"></div>
    <div style="margin-top:8px;font-size:0.72rem;color:var(--text-3);line-height:1.5" id="tdl-help">
      ⚡ Paste URL → click Fetch → chọn chất lượng → download trực tiếp
    </div>`);
    document.getElementById('tdlb').onclick = async () => {
      const url = document.getElementById('tdl').value.trim();
      if (!url) return;
      const out = document.getElementById('tdlo');
      const help = document.getElementById('tdl-help');
      out.innerHTML = '<div class="loading">Fetching video info...</div>';

      let videoId = '', platform = 'youtube';
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) { videoId = ytMatch[1]; platform = 'youtube'; }
      else if (url.includes('tiktok')) platform = 'tiktok';
      else if (url.includes('instagram')) platform = 'instagram';
      else if (url.includes('facebook') || url.includes('fb.com')) platform = 'facebook';

      if (platform === 'youtube' && videoId) {
        try {
          const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          if (r.ok) {
            const data = await r.json();
            const encoded = encodeURIComponent(url);

            out.innerHTML = `
              <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
                <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="" style="width:120px;border-radius:4px;flex-shrink:0">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;margin-bottom:4px">${esc(data.title || '')}</div>
                  <div style="font-size:0.75rem;color:var(--text-2)">${esc(data.author_name || '')}</div>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px">
                <a href="https://www.youtube.com/embed/${videoId}?autoplay=1" target="_blank" class="btn" style="text-align:center;text-decoration:none">▶ Watch Online</a>
                <a href="https://en.savefrom.net/?url=${encoded}" target="_blank" class="btn" style="text-align:center;text-decoration:none">⬇ Download via SaveFrom</a>
                <a href="https://yt1s.com/${encoded}" target="_blank" class="btn" style="text-align:center;text-decoration:none">⬇ Download via YT1s</a>
              </div>`;
            help.textContent = '📌 Click Watch để xem, hoặc Download để tải qua dịch vụ bên thứ ba.';
            return;
          }
        } catch {}
      }

      // Fallback for other platforms or failed fetch
      const encoded = encodeURIComponent(url);
      const services = [
        { name: 'SaveFrom.net', url: `https://en.savefrom.net/?url=${encoded}` },
        { name: platform === 'tiktok' ? 'SSSTik.io' : 'Y2Mate', url: platform === 'tiktok' ? `https://ssstik.io/en?url=${encoded}` : `https://www.y2mate.com/?url=${encoded}` },
        { name: 'VideoTak', url: `https://videotak.com/?url=${encoded}` },
      ];
      out.innerHTML = `<div style="margin-bottom:6px;font-weight:500">Download via:</div>` +
        services.map(s => `<a href="${s.url}" target="_blank" class="btn" style="display:block;text-align:center;text-decoration:none;margin-bottom:4px;font-size:0.78rem">⬇ ${s.name}</a>`).join('') +
        `<div style="margin-top:6px;font-size:0.7rem;color:var(--text-3)">Opens in new tab</div>`;
      help.textContent = '⚠ Could not fetch video info. Use download links above.';
    };
  },
  colorUI() {
    this.render('Color Converter', `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
      <input type="text" id="tci" class="w-inp" style="flex:1;text-transform:none;text-align:left;width:auto" placeholder="#ff0000" value="#2563eb">
      <button class="btn btn-primary" id="tcib">Convert</button>
      <input type="color" id="tcip" value="#2563eb" style="width:40px;height:36px;border:1px solid var(--border);border-radius:4px;cursor:pointer;background:none"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-family:JetBrains Mono,monospace;font-size:0.75rem">
        <div style="padding:8px;border:1px solid var(--border);border-radius:4px">HEX: <span id="tchex">#2563eb</span></div>
        <div style="padding:8px;border:1px solid var(--border);border-radius:4px">RGB: <span id="tcrgb">rgb(37,99,235)</span></div>
      </div>
      <div id="tcpr" style="margin-top:8px;height:60px;border-radius:6px;background:#2563eb"></div>`);
    const cv=(v)=>{const c=new Option().style;c.color=v;const preview=document.getElementById('tcpr');if(c.color){preview.style.background=c.color;document.getElementById('tchex').textContent=c.color;const d=document.createElement('div');d.style.color=c.color;document.body.appendChild(d);document.getElementById('tcrgb').textContent=getComputedStyle(d).color;document.body.removeChild(d);}};
    document.getElementById('tcib').onclick=()=>cv(document.getElementById('tci').value);
    document.getElementById('tcip').oninput=()=>{document.getElementById('tci').value=document.getElementById('tcip').value;cv(document.getElementById('tcip').value);};
    cv('#2563eb');
  }
};

/* ─── Weather ─── */
async function loadWeather() {
  const el = document.getElementById('hero-weather');
  if (!el) return;
  try {
    let lat = 21.0285, lon = 105.8542;
    const saved = Storage.get('weatherLoc');
    if (saved) { lat = saved.lat; lon = saved.lon; }
    else if (navigator.geolocation) {
      try {
        const pos = await new Promise((ok, err) => navigator.geolocation.getCurrentPosition(ok, err, { timeout: 3000 }));
        lat = pos.coords.latitude; lon = pos.coords.longitude;
        Storage.set('weatherLoc', { lat, lon });
      } catch {}
    }
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
    if (!r.ok) throw Error();
    const d = await r.json();
    const cw = d.current_weather;
    const temp = Math.round(cw.temperature);
    const code = cw.weathercode;
    const icon = ['☀️','🌤','⛅','🌥','☁️','🌧','🌦','⛈','🌨','🌫'][code <= 1 ? 0 : code <= 2 ? 1 : code <= 3 ? 2 : code <= 4 ? 3 : code <= 10 ? 5 : code <= 20 ? 6 : code <= 30 ? 7 : code <= 40 ? 8 : 9];
    const unit = '°C';
    el.innerHTML = `${icon} <span class="weather-temp">${temp}${unit}</span>`;
  } catch {
    el.innerHTML = '';
  }
}

/* ─── Home widgets ─── */
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const clock = document.getElementById('hero-clock');
  if (clock) clock.textContent = h + ':' + m;

  const dateEl = document.getElementById('hero-date');
  if (dateEl) {
    const opts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    dateEl.textContent = now.toLocaleDateString(currentLocale === 'vi' ? 'vi-VN' : 'en-US', opts);
  }

  const greeting = document.getElementById('greeting');
  if (greeting) {
    const hour = now.getHours();
    let msg;
    if (currentLocale === 'vi') {
      if (hour < 12) msg = 'Chào buổi sáng. ☀️';
      else if (hour < 18) msg = 'Chào buổi chiều. 🌤';
      else msg = 'Chào buổi tối. 🌙';
    } else {
      if (hour < 12) msg = 'Good morning. ☀️';
      else if (hour < 18) msg = 'Good afternoon. 🌤';
      else msg = 'Good evening. 🌙';
    }
    greeting.textContent = msg;
  }
}

function initNotes() {
  const area = document.getElementById('notes-area');
  if (!area) return;
  area.value = Storage.get('notes', '');
  area.oninput = () => Storage.set('notes', area.value);
  document.getElementById('notes-clear').onclick = () => {
    area.value = '';
    Storage.remove('notes');
  };
}

document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  route();
  updateClock();
  setInterval(updateClock, 10000);
  loadWeather();
  initNotes();
});
