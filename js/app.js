/* ─── AI Hub ─── */
const AI_CHATS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖' },
  { name: 'Gemini', url: 'https://gemini.google.com', icon: '✨' },
  { name: 'Claude', url: 'https://claude.ai', icon: '🧠' },
  { name: 'DeepSeek', url: 'https://chat.deepseek.com', icon: '🌊' },
  { name: 'Groq', url: 'https://groq.com', icon: '⚡' },
  { name: 'Perplexity', url: 'https://perplexity.ai', icon: '🔍' },
];

function toggleAIHub() {
  let panel = document.getElementById('ai-panel');
  if (panel) { panel.remove(); return; }
  panel = document.createElement('div');
  panel.id = 'ai-panel';
  panel.style.cssText = 'position:fixed;bottom:80px;right:20px;z-index:999;width:280px;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.2);animation:fadeIn 0.2s ease-out;overflow:hidden';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--border)">
      <span style="font-weight:600;font-size:0.85rem">🤖 AI Hub</span>
      <button onclick="this.closest('#ai-panel').remove()" style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:0.85rem">✕</button>
    </div>
    <div style="padding:8px 10px">
      ${AI_CHATS.map(a => `
        <a href="${a.url}" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;text-decoration:none;color:var(--text);transition:all 0.12s;font-size:0.85rem" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background='transparent'">
          <span style="font-size:1.2rem">${a.icon}</span>
          <span>${a.name}</span>
          <span style="margin-left:auto;font-size:0.6rem;color:var(--text-3)">↗</span>
        </a>`).join('')}
    </div>
    <div style="padding:8px 14px 12px;font-size:0.65rem;color:var(--text-3);border-top:1px solid var(--border)">
      Click to open in new tab
    </div>`;
  document.body.appendChild(panel);
}

// AI Hub button
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.id = 'ai-hub-btn';
  btn.textContent = '✦';
  btn.title = 'AI Chat';
  btn.style.fontSize = '1rem';
  btn.style.cssText = 'position:fixed;bottom:24px;right:20px;z-index:998;width:44px;height:44px;border-radius:50%;border:none;background:var(--accent);color:#fff;font-size:1.2rem;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,0.2);transition:all 0.15s';
  btn.onmouseover = () => { btn.style.transform = 'scale(1.1)'; };
  btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };
  btn.onclick = toggleAIHub;
  document.body.appendChild(btn);
});

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
    this.loadEsports(container);
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
  async loadEsports(c) {
    try {
      const r = await fetch('https://www.reddit.com/r/esports/hot.json?limit=12');
      if (!r.ok) return;
      const data = await r.json();
      const posts = data.data.children.filter(x => !x.data.stickied).slice(0, 8).map(x => ({
        t: x.data.title, u: x.data.url, s: x.data.score, c: x.data.num_comments
      }));
      if (!posts.length) return;
      const div = document.createElement('div'); div.className = 'card';
      div.style.marginTop = '12px';
      div.innerHTML = `<div class="section-h"><h2>🎮 Esports</h2><a href="https://reddit.com/r/esports" target="_blank">r/esports ↗</a></div>`;
      const list = document.createElement('div');
      posts.forEach((p, i) => {
        const e = document.createElement('div'); e.className = 'entry';
        e.style.animation = 'slideDown 0.3s ease-out both'; e.style.animationDelay = `${i * 0.02}s`;
        e.innerHTML = `<div class="entry-thumb">🏆</div><div class="entry-body"><div class="entry-title"><a href="${esc(p.u)}" target="_blank">${esc(p.t)}</a></div>
          <div class="entry-meta"><span>${p.s} points</span><span>${p.c} comments</span></div></div>`;
        list.appendChild(e);
      });
      div.appendChild(list);
      c.appendChild(div);
    } catch (_) {}
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
const AI_KEY = CONFIG.GEMINI_KEY;

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
  else if (page === 'media') MediaPage.load(el);
  else if (page === 'music') {
    if (!MusicPage._loaded) MusicPage.load(el);
    else { el.classList.add('active'); }
  }
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
  window._themeManuallySet = true;
  const n = Storage.getTheme() === 'dark' ? 'light' : 'dark';
  Storage.setTheme(n);
  document.documentElement.setAttribute('data-theme', n);
  document.getElementById('theme-btn').textContent = n === 'dark' ? '☀️' : '🌙';
};

/* ─── Media (Radio + Music) ─── */
const MediaPage = {
  _tab: 'radio',
  load(c) {
    c.innerHTML = `
      <div class="card">
        <div class="section-h"><h2>📻 Media</h2></div>
        <div style="display:flex;gap:2px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:6px">
          <button class="media-tab active" data-tab="radio" style="padding:4px 0;border:none;background:none;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text);font-weight:600;border-bottom:2px solid var(--accent)">📻 Radio</button>
          <button class="media-tab" data-tab="music" style="padding:4px 0;border:none;background:none;cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-2);font-weight:400;border-bottom:2px solid transparent;margin-left:14px">🎵 Music</button>
        </div>
        <div id="media-content"></div>
      </div>`;
    this._c = c;
    this._tab = 'radio';
    this.switch('radio');

    c.querySelectorAll('.media-tab').forEach(b => {
      b.onclick = () => {
        c.querySelectorAll('.media-tab').forEach(x => {
          x.style.color = 'var(--text-2)'; x.style.fontWeight = '400'; x.style.borderBottomColor = 'transparent';
        });
        b.style.color = 'var(--text)'; b.style.fontWeight = '600'; b.style.borderBottomColor = 'var(--accent)';
        this.switch(b.dataset.tab);
      };
    });
  },
  switch(tab) {
    this._tab = tab;
    const content = document.getElementById('media-content');
    if (!content) return;
    if (tab === 'radio') RadioPage.load(content);
    else MusicPage.load(content);
  }
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
    this._nowPlaying = '';

    this._audio.src = url;
    this._audio.play().catch(() => {
      if (status) status.textContent = '❌ Cannot play (CORS or dead link)';
    });

    if (stop) stop.onclick = () => { clearInterval(this._npInterval); this._audio.pause(); this._audio.src = ''; if (status) status.textContent = '⏹ Stopped'; this.hidePlayer(); };
    if (play) play.onclick = () => this._audio.play();

    this.showPlayer();

    // Try to fetch now-playing for SomaFM stations
    const channelMatch = url.match(/https:\/\/(?:ice\d)\.somafm\.com\/(\w+)-128/);
    if (channelMatch) {
      const channel = channelMatch[1];
      const updateNowPlaying = async () => {
        try {
          const r = await fetch(`https://api.somafm.com/songs/${channel}.json`);
          if (r.ok) {
            const d = await r.json();
            const song = d.songs?.[0];
            if (song) {
              const text = `${song.artist} — ${song.title}`;
              if (text !== this._nowPlaying) {
                this._nowPlaying = text;
                const np = document.getElementById('bar-nowplaying');
                if (np) np.textContent = `🎵 ${esc(text)}`;
              }
            }
          }
        } catch {}
      };
      this._npInterval = setInterval(updateNowPlaying, 15000);
      setTimeout(updateNowPlaying, 2000);
    }
  },

  showPlayer() {
    let bar = document.getElementById('radio-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'radio-bar';
      document.body.appendChild(bar);
    }
    bar.style.cssText = 'position:fixed;bottom:0;left:50%;transform:translateX(-50%);z-index:999;background:var(--surface);border:1px solid var(--border);border-top-left-radius:12px;border-top-right-radius:12px;padding:12px 18px;max-width:600px;width:92%;box-shadow:0 -4px 20px rgba(0,0,0,0.15);animation:fadeIn 0.2s ease-out';
    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px">
        <div style="flex:1;min-width:0">
          <div style="font-size:0.82rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" id="bar-title">${esc(this._currentName)}</div>
          <div style="font-size:0.65rem;color:var(--text-3)" id="bar-nowplaying"></div>
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          <button class="btn" id="bar-play" style="padding:4px 10px;font-size:0.75rem">⏸</button>
          <button class="btn" id="bar-stop" style="padding:4px 10px;font-size:0.75rem">⏹</button>
          <button class="btn" id="bar-change" style="padding:4px 10px;font-size:0.7rem">📡</button>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
        <span style="font-size:0.6rem;color:var(--text-3);font-family:JetBrains Mono,monospace">🔊</span>
        <input type="range" id="bar-volume" min="0" max="1" step="0.05" value="${this._audio.volume}" style="flex:1;height:4px;accent-color:var(--accent);cursor:pointer">
        <span id="bar-vol-pct" style="font-size:0.6rem;color:var(--text-3);font-family:JetBrains Mono,monospace;min-width:28px;text-align:right">${Math.round(this._audio.volume * 100)}%</span>
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
    document.getElementById('bar-volume').oninput = (e) => {
      this._audio.volume = e.target.value;
      document.getElementById('bar-vol-pct').textContent = Math.round(e.target.value * 100) + '%';
    };
  },

  hidePlayer() {
    const bar = document.getElementById('radio-bar');
    if (bar) bar.remove();
  },

};

/* ─── Music ─── */
const YT_KEY = CONFIG.YT_KEY;
const FEATURED = [
  { title: '🇺🇸 US Top Hits', vid: 'JGwWNGJdvx8' },
  { title: '🇰🇷 K-Pop Mix', vid: '4W6qY0fMk6k' },
  { title: '🇯🇵 J-Pop Mix', vid: 'sXwL65mzLvM' },
  { title: '🇻🇳 Nhạc Việt', vid: 'dI3q-rW8bWY' },
  { title: '🎧 Lo-Fi Chill', vid: 'jfKfPfyJRdk' },
  { title: '🎤 Rap US', vid: 'JGwWNGJdvx8' },
];

const SONG_DB = [
  { q: ['blackpink', 'bp'], vid: 'IO14CavZ4no', t: 'BLACKPINK - How You Like That' },
  { q: ['bts', 'bangtan'], vid: 'gdZLi9oWNZg', t: 'BTS - Dynamite' },
  { q: ['son tung', 'sontung', 'son tung mtp'], vid: 'dI3q-rW8bWY', t: 'Sơn Tùng M-TP - Chúng Ta Của Hiện Tại' },
  { q: ['hien ho', 'hienho'], vid: 'bUqVJHwOJgI', t: 'Hiền Hồ - Có Ai Thương Em Đâu' },
  { q: ['lofi', 'lo fi', 'chill'], vid: 'jfKfPfyJRdk', t: 'Lo-Fi Chill Mix' },
  { q: ['jazz', 'relax'], vid: 'jfKfPfyJRdk', t: 'Jazz Relax Music' },
  { q: ['edm', 'electronic', 'dance'], vid: '4W6qY0fMk6k', t: 'EDM Dance Mix' },
  { q: ['rap', 'hip hop', 'hiphop'], vid: 'JGwWNGJdvx8', t: 'Rap Hip Hop Mix' },
  { q: ['kpop', 'k-pop', 'k pop'], vid: '4W6qY0fMk6k', t: 'K-Pop Mix' },
  { q: ['jpop', 'j-pop', 'j pop'], vid: 'sXwL65mzLvM', t: 'J-Pop Mix' },
  { q: ['vpop', 'v-pop', 'nhac viet'], vid: 'dI3q-rW8bWY', t: 'V-Pop Mix' },
  { q: ['classical', 'classic'], vid: 'sXwL65mzLvM', t: 'Classical Music' },
  { q: ['taylor swift'], vid: 'JGwWNGJdvx8', t: 'Taylor Swift Mix' },
  { q: ['ed sheeran'], vid: 'JGwWNGJdvx8', t: 'Ed Sheeran Mix' },
  { q: ['michael jackson', 'mj'], vid: 'JGwWNGJdvx8', t: 'Michael Jackson Mix' },
  { q: ['beatles', 'the beatles'], vid: 'JGwWNGJdvx8', t: 'The Beatles Mix' },
  { q: ['queen'], vid: 'JGwWNGJdvx8', t: 'Queen Mix' },
];

let ytPlayer = null;
let ytReady = false;

function onYouTubeIframeAPIReady() {
  ytReady = true;
}

const MusicPage = {
  _loaded: false,
  _shuffle: false,
  _loop: 0, // 0: off, 1: loop all, 2: loop one
  load(c) {
    this._loaded = true;
    c.innerHTML = `<div class="card">
      <div class="section-h"><h2>🎵 Music</h2></div>

      <div style="margin-bottom:16px">
        <div style="display:flex;gap:4px">
          <input type="text" id="ms-q" class="w-inp" style="flex:1;text-transform:none;text-align:left;font-size:0.82rem" placeholder="Search any song or artist...">
          <button class="btn btn-primary" id="ms-play-btn">🔍 Search & Play</button>
        </div>
        <div style="font-size:0.62rem;color:var(--text-3);margin-top:4px">🔍 Search nhạc → tự động tìm và phát · hoặc paste URL YouTube/Spotify</div>
      </div>

      <div style="text-align:center;padding:20px;border:1px solid var(--border);border-radius:8px;margin-bottom:12px;background:var(--surface-2)" id="ms-now">
        <div style="font-size:2.5rem;margin-bottom:6px" id="ms-icon">🎵</div>
        <div style="font-size:1rem;font-weight:600" id="ms-title">No track playing</div>
        <div style="font-size:0.78rem;color:var(--text-2);margin-top:4px" id="ms-status">Paste a YouTube URL and press Play</div>
      </div>

        <div style="display:flex;gap:6px;justify-content:center;margin-bottom:4px">
        <button class="btn" id="ms-prev" disabled>⏮</button>
        <button class="btn" id="ms-pause" disabled>⏸</button>
        <button class="btn" id="ms-stop" disabled>⏹</button>
        <button class="btn" id="ms-next" disabled>⏭</button>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:6px">
        <button class="btn" id="ms-shuffle" style="font-size:0.7rem;padding:2px 10px">🔀</button>
        <button class="btn" id="ms-loop" style="font-size:0.7rem;padding:2px 10px">🔁</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <input type="range" id="ms-seek" min="0" max="100" value="0" step="0.1" style="flex:1;height:4px;accent-color:var(--accent);cursor:pointer">
        <span id="ms-time" style="font-family:JetBrains Mono,monospace;font-size:0.6rem;color:var(--text-3);min-width:70px;text-align:right">0:00 / 0:00</span>
      </div>

      <div id="ms-player"></div>
      <div id="ms-frame-container" style="width:0;height:0;overflow:hidden"></div>
      <div id="ms-queue" style="margin-bottom:12px;display:none"></div>
    </div>`;

    document.getElementById('ms-play-btn').onclick = () => {
      const raw = document.getElementById('ms-q').value.trim();
      if (!raw) return;
      const lower = raw.toLowerCase();
      const ytMatch = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
      const ytPlaylist = raw.match(/[?&]list=([a-zA-Z0-9_-]+)/);
      const spMatch = raw.match(/open\.spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
      const scMatch = raw.match(/soundcloud\.com\/([^\/]+\/[^\/]+)/);
      const audioMatch = raw.match(/\.(mp3|wav|ogg|m4a|flac)(\?|$)/i);

      if (ytPlaylist && !raw.match(/\/watch\?v=/)) MusicPage.playYTPlaylist(ytPlaylist[1]);
      else if (ytMatch) MusicPage.playYT(ytMatch[1]);
      else if (spMatch) MusicPage.playSpotify(spMatch[2], spMatch[1]);
      else if (scMatch) MusicPage.playSoundCloud(scMatch[1]);
      else if (audioMatch || raw.startsWith('http')) MusicPage.playAudio(raw);
      else {
        const match = SONG_DB.find(s => s.q.some(k => lower.includes(k)));
        if (match) {
          document.getElementById('ms-q').value = match.t;
          MusicPage.playYT(match.vid);
        } else {
          // YouTube Data API search
          fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(raw)}&type=video&maxResults=1&key=${YT_KEY}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
              const vid = d?.items?.[0]?.id?.videoId;
              if (vid) MusicPage.playYT(vid);
              else window.open('https://music.youtube.com/search?q=' + encodeURIComponent(lower), '_blank');
            })
            .catch(() => window.open('https://music.youtube.com/search?q=' + encodeURIComponent(lower), '_blank'));
        }
      }
    };
    document.getElementById('ms-q').onkeydown = (e) => {
      if (e.key === 'Enter') document.getElementById('ms-play-btn').click();
    };

    // Shuffle & Loop buttons
    const shuffBtn = document.getElementById('ms-shuffle');
    const loopBtn = document.getElementById('ms-loop');
    this._shuffle = false; this._loop = false;
    shuffBtn.onclick = () => {
      this._shuffle = !this._shuffle;
      shuffBtn.style.opacity = this._shuffle ? '1' : '0.4';
    };
    shuffBtn.style.opacity = '0.4';
    loopBtn.onclick = () => {
      this._loop = (this._loop + 1) % 3;
      loopBtn.textContent = ['🔁', '🔁', '🔂'][this._loop];
      loopBtn.style.opacity = this._loop > 0 ? '1' : '0.4';
    };
    loopBtn.style.opacity = '0.4';

    // Seek
    for (const id of ['ms-seek', 'mb-seek']) {
      const seek = document.getElementById(id);
      if (!seek) continue;
      seek.addEventListener('input', () => { seek._dragging = true; });
      seek.addEventListener('change', () => {
        seek._dragging = false;
        if (ytPlayer && typeof ytPlayer.getDuration === 'function') {
          const dur = ytPlayer.getDuration();
          if (dur > 0) ytPlayer.seekTo((seek.value / 100) * dur, true);
        }
      });
    }



    document.getElementById('ms-pause').onclick = () => {
      const frame = document.getElementById('ms-frame');
      frame.src = frame.src.includes('autoplay=1') ? frame.src.replace('autoplay=1','autoplay=0') : frame.src.replace('autoplay=0','autoplay=1');
      const btn = document.getElementById('ms-pause');
      btn.textContent = btn.textContent === '⏸ Pause' ? '▶ Resume' : '⏸ Pause';
    };
    document.getElementById('ms-stop').onclick = () => {
      const frame = document.getElementById('ms-frame');
      frame.src = 'https://www.youtube.com/embed/?autoplay=0';
      document.getElementById('ms-title').textContent = 'No track playing';
      document.getElementById('ms-status').textContent = 'Paste a YouTube URL and press Play';
      document.getElementById('ms-pause').disabled = true;
      document.getElementById('ms-stop').disabled = true;
    };
  },

  play(id, platform) {
    if (platform === 'yt' || !platform) this.playYT(id);
  },

  playYTPlaylist(listId) {
    document.getElementById('ms-title').textContent = '▶ Playlist';
    document.getElementById('ms-status').textContent = 'Loading playlist...';
    document.getElementById('ms-pause').disabled = false;
    document.getElementById('ms-stop').disabled = false;
    document.getElementById('ms-prev').disabled = true;
    document.getElementById('ms-next').disabled = true;
    document.getElementById('ms-pause').onclick = () => {
      if (ytPlayer) {
        const st = ytPlayer.getPlayerState();
        if (st === 1) { ytPlayer.pauseVideo(); document.getElementById('ms-pause').textContent = '▶ Resume'; }
        else if (st === 2) { ytPlayer.playVideo(); document.getElementById('ms-pause').textContent = '⏸ Pause'; }
      }
    };
    document.getElementById('ms-stop').onclick = () => {
      if (ytPlayer) ytPlayer.stopVideo();
      document.getElementById('ms-frame-container').style.cssText = 'width:0;height:0;overflow:hidden';
      document.getElementById('ms-frame-container').innerHTML = '';
      document.getElementById('ms-title').textContent = 'No track playing';
      document.getElementById('ms-pause').disabled = true;
      document.getElementById('ms-stop').disabled = true;
      const bar = document.getElementById('music-bar');
      if (bar) bar.remove();
    };

    // Build queue from YouTube Data API
    this._queue = [];
    this._queueIdx = -1;
    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${listId}&maxResults=50&key=${YT_KEY}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.items) {
          this._queue = d.items.map((i, idx) => ({ t: i.snippet.title, vid: i.snippet.resourceId.videoId }));
          this._queueIdx = 0;
          this.renderQueue(this._queue, 0);
          document.getElementById('ms-status').textContent = `Playing · ${this._queue.length} songs`;
          this.updateQueueAndButtons();
          // Play first song
          const first = this._queue[0];
          if (first && first.vid) {
            if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
              ytPlayer.loadVideoById(first.vid);
            } else {
              // Player will be created by the async path
            }
          }
        }
      })
      .catch(() => {});

    const container = document.getElementById('ms-frame-container');
    container.style.cssText = 'width:0;height:0;overflow:hidden';
    container.innerHTML = '<div id="yt-player"></div>';
    if (!window.YT) { const t = document.createElement('script'); t.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(t); }

    const createPlayer = () => {
      if (document.getElementById('yt-player') && window.YT && window.YT.Player && !ytPlayer) {
        ytPlayer = new YT.Player('yt-player', {
          height: '0', width: '0',
          videoId: '',
          playerVars: { listType: 'playlist', list: listId, autoplay: 1, controls: 0 },
          events: {
            onReady: () => { document.getElementById('ms-title').textContent = '▶ Playlist'; MusicPage._startTimeTick(); }
          }
        });
      }
    };
    const attempt = () => {
      if (window.YT && window.YT.Player && !ytPlayer && document.getElementById('yt-player')) createPlayer();
      else setTimeout(attempt, 500);
    };
    if (window.YT && window.YT.Player) createPlayer();
    else { window.onYouTubeIframeAPIReady = createPlayer; setTimeout(attempt, 2000); }

    this.showMusicBar('📋 YouTube Playlist', '');
  },

  playSpotify(id, type) {
    document.getElementById('ms-title').textContent = '▶ Spotify';
    document.getElementById('ms-status').textContent = `Loading ${type}...`;
    document.getElementById('ms-pause').disabled = false;
    document.getElementById('ms-stop').disabled = false;
    const height = type === 'playlist' ? '352' : '80';
    const container = document.getElementById('ms-frame-container');
    container.style.cssText = 'margin-bottom:12px';
    container.innerHTML = `
      <iframe src="https://open.spotify.com/embed/${type}/${id}" style="width:100%;height:${height}px;border:none;border-radius:8px" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    document.getElementById('ms-pause').textContent = '⏸ Pause';
    document.getElementById('ms-pause').onclick = () => {};
    document.getElementById('ms-stop').onclick = () => {
      if (this._tickInterval) clearInterval(this._tickInterval);
      container.style.cssText = 'width:0;height:0;overflow:hidden';
      container.innerHTML = '';
      document.getElementById('ms-pause').disabled = true;
      document.getElementById('ms-stop').disabled = true;
      document.getElementById('ms-title').textContent = 'No track playing';
      const qq = document.getElementById('ms-queue');
      if (qq) qq.style.display = 'none';
      const bar = document.getElementById('music-bar');
      if (bar) bar.remove();
    };
    const label = type === 'playlist' ? '📋 Spotify Playlist' : type === 'album' ? '💿 Spotify Album' : '🎵 Spotify Track';
    this.showMusicBar(label, '');
  },

  playSoundCloud(url) {
    document.getElementById('ms-title').textContent = '▶ SoundCloud';
    document.getElementById('ms-status').textContent = 'Loading...';
    const container = document.getElementById('ms-frame-container');
    container.style.cssText = 'margin-bottom:12px';
    container.innerHTML = `
      <iframe src="https://w.soundcloud.com/player/?url=https://soundcloud.com/${url}&auto_play=true&visual=false" style="width:100%;height:166px;border:none;border-radius:8px" allow="autoplay"></iframe>`;
    document.getElementById('ms-pause').onclick = () => {};
    document.getElementById('ms-stop').onclick = () => {
      container.style.cssText = 'width:0;height:0;overflow:hidden';
      container.innerHTML = '';
      document.getElementById('ms-title').textContent = 'No track playing';
      const bar = document.getElementById('music-bar');
      if (bar) bar.remove();
    };
    this.showMusicBar('SoundCloud', url);
  },

  playAudio(url) {
    document.getElementById('ms-title').textContent = '▶ Audio URL';
    document.getElementById('ms-status').textContent = 'Loading...';
    const container = document.getElementById('ms-frame-container');
    container.style.cssText = 'margin-bottom:12px';
    container.innerHTML = `
      <audio src="${esc(url)}" controls autoplay style="width:100%;border-radius:6px" id="ms-audio"></audio>`;
    const audio = document.getElementById('ms-audio');
    if (audio) {
      audio.onplay = () => document.getElementById('ms-pause').textContent = '⏸ Pause';
      audio.onpause = () => document.getElementById('ms-pause').textContent = '▶ Resume';
      document.getElementById('ms-pause').onclick = () => { if (audio.paused) audio.play(); else audio.pause(); };
      document.getElementById('ms-stop').onclick = () => {
        audio.pause(); audio.src = '';
        container.style.cssText = 'width:0;height:0;overflow:hidden';
        container.innerHTML = '';
        document.getElementById('ms-title').textContent = 'No track playing';
        const bar = document.getElementById('music-bar');
        if (bar) bar.remove();
      };
    }
    this.showMusicBar('Audio URL', url.split('/').pop() || url);
  },

  playYT(id) {
    this._currentId = id;
    this._currentIdx = FEATURED.findIndex(f => f.vid === id);

    // If player exists, just load new video (no destroy/recreate)
    if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
      ytPlayer.loadVideoById(id);
      this.updateQueueAndButtons();
      this.fetchTitle(id);
      return;
    }
    if (this._currentIdx >= 0) {
    this._queue = FEATURED;
    this._queueIdx = this._currentIdx;
    this.renderQueue(FEATURED, this._currentIdx);
    } else {
      this._queue = [];
      this._queueIdx = -1;
      const qq = document.getElementById('ms-queue');
      if (qq) qq.style.display = 'none';
    }

    if (!ytPlayer) {
      // Create player container
      const container = document.getElementById('ms-frame-container');
      container.style.cssText = 'width:0;height:0;overflow:hidden';
      container.innerHTML = '<div id="yt-player"></div>';

      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }

      const onReady = () => {
        document.getElementById('ms-title').textContent = '▶ Playing';
        document.getElementById('ms-status').textContent = 'Connected';
        MusicPage._startTimeTick();
      };
      const onStateChange = (e) => {
        if (e.data === YT.PlayerState.ENDED) {
          if (MusicPage._loop === 2) { // Loop one
            try { ytPlayer.seekTo(0, true); ytPlayer.playVideo(); } catch {}
          } else if (MusicPage._loop === 1) { // Loop all
            const q = MusicPage._queue || [];
            if (q.length > 0) {
              const next = MusicPage._queueIdx + 1;
              MusicPage.playFromQueue(next >= q.length ? 0 : next);
            }
          } else { // No loop — play next if exists
            const q = MusicPage._queue || [];
            const next = MusicPage._queueIdx + 1;
            if (q.length > 0 && next < q.length) MusicPage.playFromQueue(next);
          }
        }
      };
      const createPlayer = () => {
        if (document.getElementById('yt-player') && window.YT && window.YT.Player && !ytPlayer) {
          ytPlayer = new YT.Player('yt-player', {
            height: '0', width: '0',
            videoId: id,
            playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1 },
            events: { onReady, onStateChange }
          });
        }
      };
      if (window.YT && window.YT.Player) createPlayer();
      else { window.onYouTubeIframeAPIReady = createPlayer; setTimeout(createPlayer, 1500); }
    }
    this.updateQueueAndButtons();
    this.fetchTitle(id);
  },

  updateQueueAndButtons() {
    const q = (this._queue && this._queue.length > 0) ? this._queue : (this._currentIdx >= 0 ? FEATURED : []);
    const qi = this._queueIdx >= 0 ? this._queueIdx : this._currentIdx;
    if (qi < 0) return;
    document.getElementById('ms-pause').disabled = false;
    document.getElementById('ms-stop').disabled = false;
    document.getElementById('ms-pause').textContent = '⏸ Pause';
    const prev = document.getElementById('ms-prev');
    const next = document.getElementById('ms-next');
    if (prev) { prev.disabled = qi <= 0; prev.onclick = () => { if (qi > 0) this.playFromQueue(qi - 1); }; }
    if (next) { next.disabled = qi < 0 || qi >= q.length - 1; next.onclick = () => { if (qi < q.length - 1) this.playFromQueue(qi + 1); }; }
    if (q.length > 0) this.renderQueue(q, qi);
  },

  fetchTitle(id) {
    document.getElementById('ms-title').textContent = '▶ Loading...';
    document.getElementById('ms-status').textContent = 'Starting...';
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          document.getElementById('ms-title').textContent = `🎵 ${esc(d.title || '')}`;
          document.getElementById('ms-status').textContent = `👤 ${esc(d.author_name || '')}`;
          this.showMusicBar(d.title, d.author_name);
        } else this.showMusicBar('Playing', 'YouTube');
      })
      .catch(() => this.showMusicBar('Playing', 'YouTube'));
  },

  _startTimeTick() {
    if (this._tickInterval) clearInterval(this._tickInterval);
    this._tickInterval = setInterval(() => {
      if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
      try {
        const cur = ytPlayer.getCurrentTime();
        const dur = ytPlayer.getDuration();
        if (dur > 0) {
          const fmt = s => { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return m + ':' + String(sec).padStart(2, '0'); };
          const txt = fmt(cur) + ' / ' + fmt(dur);
          const pct = (cur / dur) * 100;
          for (const id of ['mb-time', 'ms-time']) {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
          }
          for (const id of ['mb-seek', 'ms-seek']) {
            const el = document.getElementById(id);
            if (el && !el._dragging) el.value = pct;
          }
        }
      } catch {}
    }, 1000);
  },

  renderQueue(queue, currentIdx) {
    const list = document.getElementById('ms-queue');
    if (!list || !queue) return;
    list.style.display = '';
    const start = Math.max(0, currentIdx - 2);
    const items = queue.slice(start, currentIdx + 6);
    list.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:0.6rem;font-family:JetBrains Mono,monospace;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-3)">Queue</span><button onclick="MusicPage.clearQueue()" style="font-size:0.55rem;font-family:JetBrains Mono,monospace;border:none;background:none;color:var(--text-3);cursor:pointer">Clear</button></div>' +
      items.map((item, i) => {
        const realIdx = start + i;
        const isCurrent = realIdx === currentIdx;
        const t = item.t || item.title || 'Unknown';
        return `<div style="padding:5px 8px;border-radius:4px;background:${isCurrent ? 'var(--accent-soft)' : 'transparent'};font-size:0.78rem;display:flex;align-items:center;gap:6px;cursor:pointer" onclick="MusicPage.playFromQueue(${realIdx})">
          <span style="font-family:JetBrains Mono,monospace;font-size:0.6rem;color:${isCurrent ? 'var(--accent)' : 'var(--text-3)'}">${isCurrent ? '▶' : '🎵'}</span>
          <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:${isCurrent ? '600' : '400'}">${esc(t)}</span>
        </div>`;
      }).join('');
  },

  clearQueue() {
    this._queue = [];
    this._queueIdx = -1;
    const qe = document.getElementById('ms-queue');
    if (qe) { qe.style.display = 'none'; qe.innerHTML = ''; }
    if (ytPlayer) { try { ytPlayer.stopVideo(); } catch {} ytPlayer = null; }
    document.getElementById('ms-title').textContent = 'No track playing';
    document.getElementById('ms-pause').disabled = true;
    document.getElementById('ms-stop').disabled = true;
    document.getElementById('ms-prev').disabled = true;
    document.getElementById('ms-next').disabled = true;
    document.getElementById('ms-frame-container').style.cssText = 'width:0;height:0;overflow:hidden';
    document.getElementById('ms-frame-container').innerHTML = '';
    const bar = document.getElementById('music-bar');
    if (bar) bar.remove();
  },

  playFromQueue(idx) {
    const q = this._queue || FEATURED;
    if (q.length === 0) return;

    // Loop one
    if (this._loop && idx >= q.length) { idx = 0; }
    else if (this._loop && idx < 0) { idx = q.length - 1; }
    // No loop
    else if (idx < 0 || idx >= q.length) {
      if (this._loop === false) { // Loop off — stop at end
        if (ytPlayer) ytPlayer.stopVideo();
        return;
      }
      idx = idx < 0 ? q.length - 1 : 0;
    }

    this._queueIdx = idx;
    const item = q[idx];
    if (item.vid) {
      this.renderQueue(q, idx);
      this.playYT(item.vid);
    }
  },

  showMusicBar(title, author) {
    let bar = document.getElementById('music-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'music-bar';
      document.body.appendChild(bar);
    }
    bar.style.cssText = 'position:fixed;bottom:0;left:50%;transform:translateX(-50%);z-index:999;background:var(--surface);border:1px solid var(--border);border-top-left-radius:12px;border-top-right-radius:12px;padding:12px 18px;max-width:600px;width:92%;box-shadow:0 -4px 20px rgba(0,0,0,0.15);animation:fadeIn 0.2s ease-out';
    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px">
        <div style="flex:1;min-width:0">
          <div style="font-size:0.82rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🎵 ${esc(title || 'Playing')}</div>
          <div style="font-size:0.65rem;color:var(--text-3)">👤 ${esc(author || 'YouTube')}</div>
        </div>
        <div style="display:flex;gap:3px">
          <button class="btn" id="mb-prev" style="padding:3px 6px;font-size:0.7rem">⏮</button>
          <button class="btn" id="mb-play" style="padding:3px 8px;font-size:0.7rem">⏸</button>
          <button class="btn" id="mb-next" style="padding:3px 6px;font-size:0.7rem">⏭</button>
          <button class="btn" id="mb-stop" style="padding:3px 8px;font-size:0.7rem">⏹</button>
          <button class="btn" id="mb-shuffle" style="padding:3px 6px;font-size:0.65rem;opacity:0.4">🔀</button>
          <button class="btn" id="mb-loop" style="padding:3px 6px;font-size:0.65rem;opacity:0.4">🔁</button>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
        <span id="mb-time" style="font-size:0.55rem;color:var(--text-3);font-family:JetBrains Mono,monospace;min-width:65px">0:00 / 0:00</span>
        <input type="range" id="mb-seek" min="0" max="100" value="0" step="0.1" style="flex:1;height:3px;accent-color:var(--accent);cursor:pointer">
        <span style="font-size:0.5rem;color:var(--text-3)">🔊</span>
        <input type="range" id="mb-vol" min="0" max="100" step="5" value="70" style="width:50px;height:3px;accent-color:var(--accent);cursor:pointer">
        <span id="mb-vol-pct" style="font-size:0.5rem;color:var(--text-3);font-family:JetBrains Mono,monospace;min-width:22px;text-align:right">70%</span>
      </div>`;
    document.getElementById('mb-play').onclick = () => {
      if (ytPlayer) {
        if (ytPlayer.getPlayerState() === 1) {
          ytPlayer.pauseVideo();
          document.getElementById('mb-play').textContent = '▶';
        } else {
          ytPlayer.playVideo();
          document.getElementById('mb-play').textContent = '⏸';
        }
      }
    };
    document.getElementById('mb-prev').onclick = () => {
      const q2 = (this._queue && this._queue.length > 0) ? this._queue : [];
      const qi2 = this._queueIdx >= 0 ? this._queueIdx : 0;
      if (qi2 > 0) this.playFromQueue(qi2 - 1);
    };
    document.getElementById('mb-next').onclick = () => {
      const q2 = (this._queue && this._queue.length > 0) ? this._queue : [];
      const qi2 = this._queueIdx >= 0 ? this._queueIdx : 0;
      if (qi2 < q2.length - 1) this.playFromQueue(qi2 + 1);
    };
    document.getElementById('mb-stop').onclick = () => {
      try { if (ytPlayer) ytPlayer.stopVideo(); } catch {}
      document.getElementById('ms-pause').disabled = true;
      document.getElementById('ms-stop').disabled = true;
      document.getElementById('ms-title').textContent = 'No track playing';
      document.getElementById('ms-frame-container').style.cssText = 'width:0;height:0;overflow:hidden';
      document.getElementById('ms-frame-container').innerHTML = '';
      const q3 = document.getElementById('ms-queue');
      if (q3) q3.style.display = 'none';
      const q4 = document.getElementById('ms-queue');
      if (q4) q4.style.display = 'none';
      bar.remove();
    };
    document.getElementById('mb-shuffle').onclick = () => {
      this._shuffle = !this._shuffle;
      document.getElementById('mb-shuffle').style.opacity = this._shuffle ? '1' : '0.4';
      document.getElementById('ms-shuffle').style.opacity = this._shuffle ? '1' : '0.4';
    };
    document.getElementById('mb-loop').onclick = () => {
      this._loop = (this._loop + 1) % 3;
      const txt = ['🔁', '🔁', '🔂'][this._loop];
      const op = this._loop > 0 ? '1' : '0.4';
      const el1 = document.getElementById('mb-loop');
      const el2 = document.getElementById('ms-loop');
      if (el1) { el1.textContent = txt; el1.style.opacity = op; }
      if (el2) { el2.textContent = txt; el2.style.opacity = op; }
    };
    document.getElementById('mb-vol').oninput = (e) => {
      const v = e.target.value;
      document.getElementById('mb-vol-pct').textContent = v + '%';
      if (ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(v);
    };
  }
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
    // Set weather type for effects
    let wtype = 'clear';
    if (code >= 51 && code <= 67) wtype = 'drizzle';
    else if (code >= 61 && code <= 65) wtype = 'rain';
    else if (code >= 80 && code <= 82) wtype = 'rain';
    else if (code >= 71 && code <= 77) wtype = 'snow';
    else if (code >= 95 && code <= 99) wtype = 'thunderstorm';
    else if (code >= 41 && code <= 49) wtype = 'fog';
    else if (code >= 2 && code <= 4) wtype = 'cloudy';
    if (cw.windspeed > 10) wtype = 'wind';
    else if (code >= 95 && code <= 99) wtype = 'wind';
    document.documentElement.setAttribute('data-weather', wtype);
  } catch {
    el.innerHTML = '';
  }
}

/* ─── Search ─── */
function initSearch() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  if (!form || !input) return;
  form.onsubmit = (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    // Check if it's a URL
    const hasSpace = val.includes(' ');
    const hasDot = val.includes('.');
    const hasProtocol = val.startsWith('http://') || val.startsWith('https://');
    if ((hasDot && !hasSpace) || hasProtocol) {
      window.open(hasProtocol ? val : 'https://' + val, '_blank');
    } else {
      window.open('https://www.google.com/search?q=' + encodeURIComponent(val), '_blank');
    }
  };
}

/* ─── Dynamic background + auto theme ─── */
let _timeOverride = null;
function updateTimeBackground() {
  const h = new Date().getHours();
  let period;
  if (_timeOverride) period = _timeOverride;
  else if (h >= 6 && h < 12) period = 'morning';
  else if (h >= 12 && h < 18) period = 'afternoon';
  else if (h >= 18 && h < 22) period = 'evening';
  else period = 'night';
  document.documentElement.setAttribute('data-time', period);
  // Auto theme: light for day, dark for evening/night
  // Auto theme: light for day, dark for night (only if not manually toggled)
  if (!_timeOverride && !window._themeManuallySet) {
    const autoTheme = (period === 'morning' || period === 'afternoon') ? 'light' : 'dark';
    if (Storage.getTheme() !== autoTheme) {
      Storage.setTheme(autoTheme);
      document.documentElement.setAttribute('data-theme', autoTheme);
      const btn = document.getElementById('theme-btn');
      if (btn) btn.textContent = autoTheme === 'dark' ? '☀️' : '🌙';
    }
  }
}
// Debug: click 🌙/☀️ on footer to cycle time
document.addEventListener('DOMContentLoaded', () => {
  const cycleBtn = document.createElement('span');
  cycleBtn.textContent = '🌙';
  cycleBtn.title = 'Cycle time (debug)';
  cycleBtn.style.cssText = 'cursor:pointer;font-size:0.65rem;margin-left:6px;opacity:0.4';
  cycleBtn.onmouseover = () => { cycleBtn.style.opacity = '1'; };
  cycleBtn.onmouseout = () => { cycleBtn.style.opacity = '0.4'; };
  const order = [null, 'morning', 'afternoon', 'evening', 'night'];
  let idx = 0;
  cycleBtn.onclick = () => {
    idx = (idx + 1) % order.length;
    _timeOverride = order[idx];
    updateTimeBackground();
    cycleBtn.textContent = order[idx] ? ['🌅','☀️','🌇','🌙'][['morning','afternoon','evening','night'].indexOf(order[idx])] : '🌙';
  };
  document.querySelector('.footer .container')?.appendChild(cycleBtn);
});

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

  // Close nav after clicking a link (mobile)
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.onclick = () => { document.getElementById('nav-toggle').checked = false; };
  });
  updateClock();
  updateTimeBackground();
  setInterval(() => { updateClock(); updateTimeBackground(); }, 10000);
  initSearch();
  loadWeather();
  initNotes();
});
