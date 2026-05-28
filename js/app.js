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

const GamesPage = {
  current: 'wordle',
  load(container) {
    container.innerHTML = `
      <div class="card"><div class="section-h"><h2>${_('games')}</h2></div>
        <div class="games-picker">
          <button class="active" data-game="wordle">${_('wordle')}</button>
          <button data-game="quiz">${_('movieQuiz')}</button>
        </div>
        <div id="games-container"></div>
      </div>`;
    const gc = document.getElementById('games-container');
    const cur = Storage.get('currentGame', 'wordle');
    this.switch(cur, gc);
    container.querySelectorAll('[data-game]').forEach(b => {
      b.onclick = () => {
        container.querySelectorAll('[data-game]').forEach(x => x.classList.toggle('active', x === b));
        Storage.set('currentGame', b.dataset.game);
        this.switch(b.dataset.game, gc);
      };
    });
    this.loadNews(container);
  },
  switch(g, c) {
    if (g === 'wordle') Wordle.init(c);
    else if (g === 'quiz') Quiz.init(c);
  },
  async loadNews(c) {
    try {
      const r = await fetch('https://www.reddit.com/r/gaming/hot.json?limit=5');
      if (!r.ok) return;
      const data = await r.json();
      const posts = data.data.children.filter(x => !x.data.stickied).slice(0, 5).map(x => ({
        t: x.data.title, u: x.data.url, s: x.data.score, c: x.data.num_comments
      }));
      if (!posts.length) return;
      const div = document.createElement('div'); div.className = 'card';
      div.style.marginTop = '12px';
      div.innerHTML = `<div class="section-h"><h2>${_('gameNews')}</h2><a href="https://reddit.com/r/gaming" target="_blank">r/gaming ↗</a></div>`;
      const list = document.createElement('div');
      posts.forEach(p => {
        const e = document.createElement('div'); e.className = 'entry';
        e.innerHTML = `<div class="entry-title"><a href="${esc(p.u)}" target="_blank">${esc(p.t)}</a></div>
          <div class="entry-meta"><span>${p.s} points</span><span>${p.c} comments</span><button class="speak-btn" data-text="${esc(p.t)}">🔊 ${_('readAloud')}</button></div>`;
        e.querySelector('.speak-btn').onclick = () => speak(p.t);
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

/* ─── Read Aloud ─── */
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = currentLocale === 'vi' ? 'vi-VN' : 'en-US';
  u.rate = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find(v => v.lang.startsWith('vi'));
  if (viVoice) u.voice = viVoice;
  window.speechSynthesis.speak(u);
}

/* ─── Tech News (Vietnamese + global) ─── */
async function loadTechNews(c) {
  try {
    const [vnRes, enRes] = await Promise.all([
      fetch('https://www.reddit.com/r/congnghe/hot.json?limit=3').catch(() => null),
      fetch('https://www.reddit.com/r/artificial/hot.json?limit=3').catch(() => null)
    ]);
    const allPosts = [];
    if (vnRes && vnRes.ok) {
      const d = await vnRes.json();
      d.data.children.filter(x => !x.data.stickied).slice(0, 3).forEach(x => {
        allPosts.push({ t: x.data.title, u: x.data.url, s: x.data.score, lang: 'VI' });
      });
    }
    if (enRes && enRes.ok) {
      const d = await enRes.json();
      d.data.children.filter(x => !x.data.stickied).slice(0, 3).forEach(x => {
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
      e.innerHTML = `<div class="entry-title"><a href="${esc(p.u)}" target="_blank">${esc(p.t)}</a></div>
        <div class="entry-meta"><span>${p.lang}</span><span>${p.s} points</span><button class="speak-btn" data-text="${esc(p.t)}">🔊 ${_('readAloud')}</button></div>`;
      e.querySelector('.speak-btn').onclick = () => speak(p.t);
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
