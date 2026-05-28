const WORDLE_WORDS = ['apple','beach','crane','dance','eagle','flame','grape','house','ivory','joker','knife','lemon','mango','noble','ocean','piano','queen','river','sugar','tiger','umbra','vivid','whale','xenon','yacht','zebra','blaze','coral','debug','ember','frost','ghost','hazel','input','jolly','kayak','lunar','merry','nymph','opera','pearl','query','rugby','solar','topaz','ultra','vocal','waltz','yield','azure'];
const WL_MAX = 6;

const Wordle = {
  answer: '', guesses: [], current: '', over: false, container: null,

  init(c) {
    this.container = c;
    const s = Storage.getGameState('wordle');
    if (s && s.date === this.today()) {
      this.guesses = s.guesses || []; this.current = s.current || '';
      this.over = s.over || false; this.answer = s.answer || this.pick();
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
      <div class="section">
        <div class="section-header"><h2>Wordle</h2><span class="section-link" style="cursor:pointer" id="wl-reset">New word →</span></div>
        <div class="wordle-grid" id="wl-grid"></div>
        <div class="wordle-input-area">
          <input type="text" id="wl-input" class="wordle-input" maxlength="5" placeholder="guess" autocomplete="off" spellcheck="false">
          <button class="btn btn-primary" id="wl-submit">Guess</button>
        </div>
        <div class="wordle-status" id="wl-status"></div>
      </div>
    `;
    this.grid();
    if (this.over) {
      document.getElementById('wl-input').disabled = true;
      document.getElementById('wl-submit').disabled = true;
      const s = document.getElementById('wl-status');
      s.textContent = this.guesses.includes(this.answer)
        ? `Got it! (${this.guesses.length}/6)`
        : `Word was ${this.answer.toUpperCase()}`;
    }
    document.getElementById('wl-input').addEventListener('keydown', e => { if (e.key === 'Enter') this.guess(); });
    document.getElementById('wl-submit').addEventListener('click', () => this.guess());
    document.getElementById('wl-reset').addEventListener('click', () => {
      Storage.remove('game_wordle');
      this.guesses = []; this.current = ''; this.over = false; this.answer = this.pick();
      this.save(); this.render();
    });
  },

  grid() {
    const g = document.getElementById('wl-grid');
    if (!g) return;
    g.innerHTML = '';
    for (let i = 0; i < WL_MAX; i++) {
      const r = document.createElement('div'); r.className = 'w-row';
      for (let j = 0; j < 5; j++) {
        const c = document.createElement('div'); c.className = 'w-cell';
        if (i < this.guesses.length) {
          const w = this.guesses[i];
          c.textContent = w[j];
          if (this.answer[j] === w[j]) c.classList.add('hit');
          else if (this.answer.includes(w[j])) c.classList.add('present');
          else c.classList.add('miss');
        }
        r.appendChild(c);
      }
      g.appendChild(r);
    }
  },

  guess() {
    if (this.over) return;
    const inp = document.getElementById('wl-input');
    if (!inp) return;
    const g = inp.value.toLowerCase().trim();
    if (g.length !== 5) { document.getElementById('wl-status').textContent = '5 letters needed'; return; }
    this.current = g; this.guesses.push(g);
    if (g === this.answer || this.guesses.length >= WL_MAX) this.over = true;
    this.current = ''; this.save(); this.render();
  }
};
