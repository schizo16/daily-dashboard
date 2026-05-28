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
  { id: 'deals', label: '🔥 Giảm giá', url: 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=20&sortBy=Savings&steamRating=60&pageNumber=' },
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
      this._page = 1; this._genre = 'deals';
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
    grid.innerHTML = '<div class="loading" style="padding:16px 0">Loading...</div>';
    const genre = GAME_GENRES.find(g => g.id === this._genre);
    if (!genre) return;
    try {
      const r = await fetch(genre.url + this._page);
      if (!r.ok) throw Error('API error');
      const deals = await r.json();
      grid.innerHTML = '';
      if (!deals || !deals.length) { grid.innerHTML = '<div class="empty" style="padding:16px 0">No deals</div>'; return; }
      deals.slice(0, 15).forEach(g => {
        const e = document.createElement('a'); e.className = 'movie-e';
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
      // Simple pagination: show prev/next
      const nav = document.createElement('div');
      nav.style.cssText = 'display:flex;gap:8px;margin-top:12px;justify-content:center;align-items:center';
      if (this._page > 1) {
        const prev = document.createElement('button');
        prev.textContent = '‹ Trang ' + (this._page - 1);
        prev.className = 'btn'; prev.style.cssText = 'padding:4px 12px;border:1px solid var(--border);border-radius:5px;background:transparent;color:var(--text-2);cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.65rem';
        prev.onclick = () => { this._page--; this.loadPage(); };
        nav.appendChild(prev);
      }
      const current = document.createElement('span');
      current.textContent = this._page;
      current.style.cssText = 'font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--text)';
      nav.appendChild(current);
      const next = document.createElement('button');
      next.textContent = 'Trang ' + (this._page + 1) + ' ›';
      next.className = 'btn'; next.style.cssText = 'padding:4px 12px;border:1px solid var(--border);border-radius:5px;background:transparent;color:var(--text-2);cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.65rem';
      next.onclick = () => { this._page++; this.loadPage(); };
      nav.appendChild(next);
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

document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  route();
});
