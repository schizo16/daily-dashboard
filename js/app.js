const Games = {
  load(container) {
    container.innerHTML = `
      <div class="section-header"><h2>Games</h2></div>
      <div class="game-selector">
        <button class="game-tab active" data-game="wordle">Wordle</button>
        <button class="game-tab" data-game="quiz">Movie Quiz</button>
      </div>
      <div id="game-container"></div>
    `;
    const gc = document.getElementById('game-container');
    const current = Storage.get('currentGame', 'wordle');
    this.switch(current, gc);
    document.querySelectorAll('[data-game]').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('[data-game]').forEach(x => x.classList.toggle('active', x === b));
        Storage.set('currentGame', b.dataset.game);
        this.switch(b.dataset.game, gc);
      });
    });
  },
  switch(game, c) {
    if (game === 'wordle') Wordle.init(c);
    else if (game === 'quiz') Quiz.init(c);
  }
};

const App = {
  tab: 'radar',
  init() {
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';

    const pin = Storage.getPinnedTab();
    if (pin && document.querySelector(`[data-tab="${pin}"]`)) this.switch(pin);

    document.querySelectorAll('.tab').forEach(b => {
      b.addEventListener('click', () => this.switch(b.dataset.tab));
    });
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggle());

    this.load();
  },

  switch(t) {
    this.tab = t;
    document.querySelectorAll('.tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === t);
      b.setAttribute('aria-selected', b.dataset.tab === t);
    });
    document.querySelectorAll('.tab-content').forEach(e => {
      e.classList.toggle('active', e.id === 'tab-' + t);
    });
    this.load();
  },

  load() {
    const t = this.tab;
    if (t === 'radar') AiRadar.load(document.getElementById('tab-radar'));
    else if (t === 'movies') Movies.load(document.getElementById('tab-movies'));
    else if (t === 'games') Games.load(document.getElementById('tab-games'));
  },

  toggle() {
    const next = Storage.getTheme() === 'dark' ? 'light' : 'dark';
    Storage.setTheme(next);
    document.getElementById('theme-toggle').textContent = next === 'dark' ? '☀️' : '🌙';
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
