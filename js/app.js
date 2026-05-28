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

const PROXY = 'https://corsproxy.io/?url=';
function steamApi() {
  const cc = currentLocale === 'vi' ? 'VN' : 'US';
  return `https://store.steampowered.com/api/featuredcategories?cc=${cc}&l=${currentLocale === 'vi' ? 'vi' : 'en'}`;
}

function fmtPrice(price, isVn) {
  if (price == null) return isVn ? 'Miễn phí' : 'Free';
  const val = Number(price) / 100;
  if (isVn) return Math.round(val).toLocaleString('vi-VN') + '₫';
  return '$' + val.toFixed(2);
}

const GAME_GENRES = [
  { id: 'topsellers', label: '🔥 Bán chạy', key: 'top_sellers' },
  { id: 'specials', label: '🏷️ Giảm giá', key: 'specials' },
  { id: 'free', label: '🎁 Miễn phí', key: 'specials', filter: g => g.final_price === 0 || g.discount_percent >= 100 },
  { id: 'newreleases', label: '🆕 Mới ra', key: 'new_releases' },
  { id: 'comingsoon', label: '⏳ Sắp ra', key: 'coming_soon' },
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
      div.innerHTML = `<div class="section-h"><h2>🎮 Steam Store</h2><a href="https://store.steampowered.com" target="_blank">store.steampowered ↗</a></div>
        <div class="mood-bar" id="gp-bar" style="display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap"></div>
        <div id="gp-grid"></div>`;
      c.appendChild(div);
      this.renderGenreBar();
      const data = await this.fetchSteam();
      this.renderGrid(data, 'topsellers');
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
      b.onmouseover = () => { if (!b.classList.contains('active')) b.style.borderColor = 'var(--border-2)'; };
      b.onmouseout = () => { if (!b.classList.contains('active')) b.style.borderColor = 'var(--border)'; };
      b.onclick = () => {
        bar.querySelectorAll('.mood-btn').forEach(x => {
          x.classList.remove('active');
          x.style.background = 'transparent'; x.style.color = 'var(--text-2)'; x.style.borderColor = 'var(--border)';
        });
        b.classList.add('active');
        b.style.background = 'var(--accent)'; b.style.color = 'var(--bg)'; b.style.borderColor = 'var(--accent)';
        const cached = window.__steamData;
        if (cached) this.renderGrid(cached, g.id);
      };
      if (g.id === 'topsellers') { b.classList.add('active'); b.style.background = 'var(--accent)'; b.style.color = 'var(--bg)'; b.style.borderColor = 'var(--accent)'; }
      bar.appendChild(b);
    });
  },
  async fetchSteam() {
    const r = await fetch(PROXY + encodeURIComponent(steamApi()));
    if (!r.ok) throw new Error('Steam error');
    const d = await r.json();
    window.__steamData = d;
    return d;
  },
  renderGrid(data, section) {
    const grid = document.getElementById('gp-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const genre = GAME_GENRES.find(g => g.id === section);
    if (!genre) return;
    let items = data[genre.key]?.items || [];
    if (genre.filter) items = items.filter(genre.filter);
    items = items.slice(0, 10);
    if (!items.length) { grid.innerHTML = '<div class="empty" style="padding:16px 0">No games</div>'; return; }
    const isVn = currentLocale === 'vi';
    items.forEach(g => {
      const appId = g.id;
      const steamUrl = `https://store.steampowered.com/app/${appId}/`;
      const e = document.createElement('a'); e.className = 'movie-e'; e.href = steamUrl; e.target = '_blank'; e.style.textDecoration = 'none'; e.style.display = 'flex'; e.style.cursor = 'pointer';
      const img = g.capsule_small || g.header_image || '';
      const pct = g.discount_percent || 0;
      const hasDisc = pct > 0;
      const finalP = g.final_price;
      const origP = g.original_price;
      e.innerHTML = `<div class="movie-thumb" style="width:60px;height:34px">${img ? `<img src="${img}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : '🎮'}</div>
        <div class="movie-body"><div class="movie-name" style="color:var(--text)">${esc(g.name || '')}</div>
        <div class="movie-sub">${hasDisc ? `<span style="background:#4ade80;color:#000;padding:1px 5px;border-radius:3px;font-weight:700">-${pct}%</span> ` : ''}${(origP !== undefined && origP !== finalP) ? `<s>${fmtPrice(origP, isVn)}</s> ` : ''}${finalP !== undefined ? `<span style="font-weight:600">${fmtPrice(finalP, isVn)}</span>` : (isVn ? 'Miễn phí' : 'Free')}</div></div>`;
      grid.appendChild(e);
    });
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
      posts.forEach(p => {
        const e = document.createElement('div'); e.className = 'entry';
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
    allPosts.forEach(p => {
      const e = document.createElement('div'); e.className = 'entry';
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
}

function route() {
  show(location.hash.slice(1) || 'home');
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

document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  route();
});
