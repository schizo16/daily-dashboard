/* ─── Page Loaders ─── */

const GamesPage = {
  current: 'wordle',
  load(container) {
    container.innerHTML = `
      <div class="card"><div class="section-h"><h2>Games</h2></div>
        <div class="games-picker">
          <button class="active" data-game="wordle">Wordle</button>
          <button data-game="quiz">Movie Quiz</button>
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
  },
  switch(g, c) {
    if (g === 'wordle') Wordle.init(c);
    else if (g === 'quiz') Quiz.init(c);
  }
};

const WatchlistPage = {
  load(container) {
    const items = Storage.getWatchlist();
    let html = '<div class="card"><div class="section-h"><h2>Watchlist</h2></div>';
    if (!items.length) {
      html += '<div class="empty" style="padding:16px 0">Nothing saved. Browse <a href="#movies" style="color:var(--accent)">Movies</a> to add some.</div>';
    } else {
      html += '<div id="wl-list">';
      items.forEach(m => {
        html += `<div class="movie-e"><div class="movie-body"><div class="movie-name">${esc(m.title)}</div></div><button class="rm-btn" data-id="${m.id}">Remove</button></div>`;
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

  if (page === 'radar') AiRadar.load(el);
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

document.addEventListener('DOMContentLoaded', route);
