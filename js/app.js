const Games = {
  load(container) {
    container.innerHTML = `
      <div id="game-selector" style="display:flex;gap:8px;margin-bottom:16px">
        <button class="tab active" data-game="wordle" style="flex:1">🎯 Wordle</button>
        <button class="tab" data-game="quiz" style="flex:1">🎬 Movie Quiz</button>
      </div>
      <div id="game-container"></div>
    `;
    const gameContainer = document.getElementById('game-container');
    const currentGame = Storage.get('currentGame', 'wordle');
    this.switchGame(currentGame, gameContainer);

    document.querySelectorAll('[data-game]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-game]').forEach(b => b.classList.toggle('active', b === btn));
        Storage.set('currentGame', btn.dataset.game);
        this.switchGame(btn.dataset.game, gameContainer);
      });
    });
  },

  switchGame(game, container) {
    if (game === 'wordle') Wordle.init(container);
    else if (game === 'quiz') Quiz.init(container);
  }
};

const App = {
  currentTab: 'radar',
  init() {
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';

    const pinnedTab = Storage.getPinnedTab();
    if (pinnedTab && document.querySelector(`[data-tab="${pinnedTab}"]`)) {
      this.switchTab(pinnedTab);
    }

    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

    const pinBtn = document.createElement('button');
    pinBtn.className = 'tab';
    pinBtn.style.cssText = 'flex:0;padding:6px 12px;margin-top:4px';
    pinBtn.textContent = '📌';
    pinBtn.title = 'Pin current tab as default';
    pinBtn.addEventListener('click', () => {
      Storage.setPinnedTab(this.currentTab);
      pinBtn.textContent = '📌 Pinned!';
      setTimeout(() => { pinBtn.textContent = '📌'; }, 2000);
    });
    document.querySelector('.tab-bar').after(pinBtn);

    this.loadCurrentTab();
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.tab').forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    document.querySelectorAll('.tab-content').forEach(el => {
      el.classList.toggle('active', el.id === 'tab-' + tabId);
    });
    this.loadCurrentTab();
  },

  loadCurrentTab() {
    const tab = this.currentTab;
    if (tab === 'radar') AiRadar.load(document.getElementById('tab-radar'));
    else if (tab === 'movies') Movies.load(document.getElementById('tab-movies'));
    else if (tab === 'games') Games.load(document.getElementById('tab-games'));
  },

  toggleTheme() {
    const current = Storage.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    Storage.setTheme(next);
    document.getElementById('theme-toggle').textContent = next === 'dark' ? '☀️' : '🌙';
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
