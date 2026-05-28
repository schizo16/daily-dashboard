const WORDLE_WORDS = ['apple','beach','crane','dance','eagle','flame','grape','house','ivory','joker','knife','lemon','mango','noble','ocean','piano','queen','river','sugar','tiger','umbra','vivid','whale','xenon','yacht','zebra','blaze','coral','debug','ember','frost','ghost','hazel','input','jolly','kayak','lunar','merry','nymph','opera','pearl','query','rugby','solar','topaz','ultra','vocal','waltz','yield','azure'];
const WORDLE_MAX_ATTEMPTS = 6;

const Wordle = {
  answer: '',
  guesses: [],
  currentGuess: '',
  gameOver: false,
  container: null,

  init(container) {
    this.container = container;
    const saved = Storage.getGameState('wordle');
    if (saved && saved.date === this.today()) {
      this.guesses = saved.guesses || [];
      this.currentGuess = saved.currentGuess || '';
      this.gameOver = saved.gameOver || false;
      this.answer = saved.answer || this.pickWord();
    } else {
      this.guesses = [];
      this.currentGuess = '';
      this.gameOver = false;
      this.answer = this.pickWord();
    }
    this.render();
  },

  today() {
    return new Date().toISOString().slice(0, 10);
  },

  pickWord() {
    const day = Math.floor(Date.now() / 86400000);
    return WORDLE_WORDS[day % WORDLE_WORDS.length];
  },

  save() {
    Storage.setGameState('wordle', {
      date: this.today(),
      guesses: this.guesses,
      currentGuess: this.currentGuess,
      gameOver: this.gameOver,
      answer: this.answer
    });
  },

  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <h2 class="section-title">🎯 Wordle</h2>
      <p class="section-subtitle">Guess the 5-letter word</p>
      <div id="wordle-grid" style="display:grid;gap:4px;justify-content:center;margin-bottom:16px"></div>
      <div id="wordle-input" style="text-align:center">
        <input type="text" id="wordle-guess" maxlength="5" style="text-transform:lowercase;padding:8px 12px;font-size:1.2rem;text-align:center;border:2px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);width:150px" placeholder="aaaaa">
        <button id="wordle-submit" style="padding:8px 16px;margin-left:8px;border:none;border-radius:8px;background:var(--accent);color:#fff;cursor:pointer;font-weight:600">Guess</button>
        <button id="wordle-reset" style="padding:8px 16px;margin-left:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);cursor:pointer;font-weight:600">🔄 New</button>
      </div>
      <div id="wordle-status" style="text-align:center;margin-top:12px;font-weight:600"></div>
    `;

    this.renderGrid();
    this.attachEvents();
  },

  attachEvents() {
    const input = document.getElementById('wordle-guess');
    const submit = document.getElementById('wordle-submit');
    const reset = document.getElementById('wordle-reset');

    if (!input || !submit) return;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submitGuess();
    });
    submit.addEventListener('click', () => this.submitGuess());
    reset.addEventListener('click', () => {
      Storage.remove('game_wordle');
      this.guesses = [];
      this.currentGuess = '';
      this.gameOver = false;
      this.answer = this.pickWord();
      this.save();
      this.render();
    });

    if (this.gameOver) {
      input.disabled = true;
      submit.disabled = true;
      const status = document.getElementById('wordle-status');
      if (this.guesses.includes(this.answer)) {
        status.textContent = `🎉 You got it! (${this.guesses.length}/6)`;
        status.style.color = '#22c55e';
      } else {
        status.textContent = `😢 The word was: ${this.answer.toUpperCase()}`;
        status.style.color = '#ef4444';
      }
    }

    if (this.currentGuess) {
      input.value = this.currentGuess;
    }
  },

  renderGrid() {
    const grid = document.getElementById('wordle-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < WORDLE_MAX_ATTEMPTS; i++) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '4px';
      row.style.justifyContent = 'center';

      for (let j = 0; j < 5; j++) {
        const cell = document.createElement('div');
        cell.style.width = '48px';
        cell.style.height = '48px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.fontSize = '1.3rem';
        cell.style.fontWeight = '700';
        cell.style.borderRadius = '6px';
        cell.style.border = '2px solid var(--border)';
        cell.style.textTransform = 'uppercase';

        if (i < this.guesses.length) {
          const guess = this.guesses[i];
          const letter = guess[j];
          cell.textContent = letter;
          if (this.answer[j] === letter) {
            cell.style.background = '#22c55e';
            cell.style.color = '#fff';
            cell.style.borderColor = '#22c55e';
          } else if (this.answer.includes(letter)) {
            cell.style.background = '#eab308';
            cell.style.color = '#fff';
            cell.style.borderColor = '#eab308';
          } else {
            cell.style.background = '#374151';
            cell.style.color = '#fff';
            cell.style.borderColor = '#374151';
          }
        } else if (i === this.guesses.length && this.currentGuess[j]) {
          cell.textContent = this.currentGuess[j];
          cell.style.borderColor = 'var(--accent)';
        }

        row.appendChild(cell);
      }
      grid.appendChild(row);
    }
  },

  submitGuess() {
    if (this.gameOver) return;
    const input = document.getElementById('wordle-guess');
    if (!input) return;
    const guess = input.value.toLowerCase().trim();
    if (guess.length !== 5) {
      const status = document.getElementById('wordle-status');
      if (status) status.textContent = '⚠️ Enter a 5-letter word';
      return;
    }
    this.currentGuess = guess;
    this.guesses.push(guess);

    if (guess === this.answer || this.guesses.length >= WORDLE_MAX_ATTEMPTS) {
      this.gameOver = true;
    }

    this.currentGuess = '';
    this.save();
    this.render();
  }
};
