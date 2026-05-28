const Games = {
  load(c) {
    c.innerHTML = `<div class="game-bar"><button class="game-bt active" data-game="wordle">Wordle</button><button class="game-bt" data-game="quiz">Movie Quiz</button></div><div id="gc"></div>`;
    const gc = document.getElementById('gc');
    const cur = Storage.get('currentGame', 'wordle');
    this.sw(cur, gc);
    c.querySelectorAll('[data-game]').forEach(b => {
      b.onclick = () => {
        c.querySelectorAll('[data-game]').forEach(x => x.classList.toggle('active', x === b));
        Storage.set('currentGame', b.dataset.game);
        this.sw(b.dataset.game, gc);
      };
    });
  },
  sw(g, c) {
    if (g === 'wordle') Wordle.init(c);
    else if (g === 'quiz') Quiz.init(c);
  }
};

const App = {
  tab: 'radar',
  init() {
    const t = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', t);
    document.getElementById('theme-toggle').textContent = t === 'dark' ? '☀️' : '🌙';

    const p = Storage.getPinnedTab();
    if (p && document.querySelector(`[data-tab="${p}"]`)) this.switch(p);

    document.querySelectorAll('.tab').forEach(b => { b.onclick = () => this.switch(b.dataset.tab); });
    document.getElementById('theme-toggle').onclick = () => this.toggle();
    this.load();
  },

  switch(t) {
    this.tab = t;
    document.querySelectorAll('.tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === t);
      b.setAttribute('aria-selected', b.dataset.tab === t);
    });
    document.querySelectorAll('.tab-content').forEach(e => e.classList.toggle('active', e.id === 'tab-' + t));
    this.load();
  },

  load() {
    const t = this.tab;
    if (t === 'radar') AiRadar.load(document.getElementById('tab-radar'));
    else if (t === 'movies') Movies.load(document.getElementById('tab-movies'));
    else if (t === 'games') Games.load(document.getElementById('tab-games'));
  },

  toggle() {
    const n = Storage.getTheme() === 'dark' ? 'light' : 'dark';
    Storage.setTheme(n);
    document.getElementById('theme-toggle').textContent = n === 'dark' ? '☀️' : '🌙';
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
