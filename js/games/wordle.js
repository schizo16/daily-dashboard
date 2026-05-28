const WORDLE_WORDS = ['apple','beach','crane','dance','eagle','flame','grape','house','ivory','joker','knife','lemon','mango','noble','ocean','piano','queen','river','sugar','tiger','umbra','vivid','whale','xenon','yacht','zebra','blaze','coral','debug','ember','frost','ghost','hazel','input','jolly','kayak','lunar','merry','nymph','opera','pearl','query','rugby','solar','topaz','ultra','vocal','waltz','yield','azure'];
const WORDLE_MAX = 6;

const Wordle = {
  answer: '', guesses: [], current: '', over: false, container: null,

  init(c) {
    this.container = c;
    const saved = Storage.getGameState('wordle');
    if (saved && saved.date === this.today()) {
      this.guesses = saved.guesses || [];
      this.current = saved.current || '';
      this.over = saved.over || false;
      this.answer = saved.answer || this.pick();
    } else {
      this.guesses = []; this.current = ''; this.over = false; this.answer = this.pick();
    }
    this.render();
  },

  today() { return new Date().toISOString().slice(0, 10); },
  pick() { return WORDLE_WORDS[Math.floor(Date.now() / 86400000) % WORDLE_WORDS.length]; },

  save() {
    Storage.setGameState('wordle', { date: this.today(), guesses: this.guesses, current: this.current, over: this.over, answer: this.answer });
  },

  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="section-header"><h2>Wordle</h2><span class="section-link" style="cursor:pointer" id="wordle-reset">New word</span></div>
      <div class="wordle-container" id="wordle-grid"></div>
      <div class="wordle-input-area">
        <input type="text" id="wordle-input" class="wordle-input" maxlength="5" placeholder="aaaaa" autocomplete="off" spellcheck="false">
        <button class="btn btn-primary" id="wordle-submit">Guess</button>
      </div>
      <div class="wordle-status" id="wordle-status"></div>
    `;
    this.renderGrid();

    if (this.over) {
      document.getElementById('wordle-input').disabled = true;
      document.getElementById('wordle-submit').disabled = true;
      const s = document.getElementById('wordle-status');
      if (this.guesses.includes(this.answer)) {
        s.textContent = `You got it (${this.guesses.length}/6)`;
        s.style.color = 'var(--text)';
      } else {
        s.textContent = `The word was ${this.answer.toUpperCase()}`;
        s.style.color = 'var(--text-secondary)';
      }
    }

    document.getElementById('wordle-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.guess(); });
    document.getElementById('wordle-submit').addEventListener('click', () => this.guess());
    document.getElementById('wordle-reset').addEventListener('click', () => {
      Storage.remove('game_wordle');
      this.guesses = []; this.current = ''; this.over = false; this.answer = this.pick();
      this.save(); this.render();
    });
  },

  renderGrid() {
    const grid = document.getElementById('wordle-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < WORDLE_MAX; i++) {
      const row = document.createElement('div');
      row.className = 'w-row';
      for (let j = 0; j < 5; j++) {
        const cell = document.createElement('div');
        cell.className = 'w-cell';
        if (i < this.guesses.length) {
          const g = this.guesses[i];
          cell.textContent = g[j];
          if (this.answer[j] === g[j]) cell.classList.add('hit');
          else if (this.answer.includes(g[j])) cell.classList.add('present');
          else cell.classList.add('miss');
        } else if (i === this.guesses.length) {
          cell.classList.add('active');
        }
        row.appendChild(cell);
      }
      grid.appendChild(row);
    }
  },

  guess() {
    if (this.over) return;
    const input = document.getElementById('wordle-input');
    if (!input) return;
    const g = input.value.toLowerCase().trim();
    if (g.length !== 5) { document.getElementById('wordle-status').textContent = '5 letters'; return; }
    this.current = g;
    this.guesses.push(g);
    if (g === this.answer || this.guesses.length >= WORDLE_MAX) this.over = true;
    this.current = '';
    this.save();
    this.render();
  }
};
