const WORDLE_WORDS = ['apple','beach','crane','dance','eagle','flame','grape','house','ivory','joker','knife','lemon','mango','noble','ocean','piano','queen','river','sugar','tiger','umbra','vivid','whale','xenon','yacht','zebra','blaze','coral','debug','ember','frost','ghost','hazel','input','jolly','kayak','lunar','merry','nymph','opera','pearl','query','rugby','solar','topaz','ultra','vocal','waltz','yield','azure'];
const WL_MAX = 6;

const Wordle = {
  answer: '', guesses: [], current: '', over: false, c: null,

  init(con) {
    this.c = con;
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
    if (!this.c) return;
    this.c.innerHTML = `
      <div class="section">
        <div class="section-h"><h2>Wordle</h2><span class="section-h-link" style="cursor:pointer" id="wl-rst">New word →</span></div>
        <div class="w-grid" id="wl-g"></div>
        <div class="w-input-area">
          <input type="text" id="wl-inp" class="w-inp" maxlength="5" placeholder="guess" autocomplete="off" spellcheck="false">
          <button class="btn btn-primary" id="wl-sub">Guess</button>
        </div>
        <div class="w-status" id="wl-st"></div>
      </div>`;
    this.grid();
    if (this.over) {
      document.getElementById('wl-inp').disabled = true;
      document.getElementById('wl-sub').disabled = true;
      const s = document.getElementById('wl-st');
      s.textContent = this.guesses.includes(this.answer) ? `Got it! (${this.guesses.length}/${WL_MAX})` : `Word was ${this.answer.toUpperCase()}`;
    }
    document.getElementById('wl-inp').onkeydown = e => { if (e.key === 'Enter') this.guess(); };
    document.getElementById('wl-sub').onclick = () => this.guess();
    document.getElementById('wl-rst').onclick = () => {
      Storage.remove('game_wordle');
      this.guesses = []; this.current = ''; this.over = false; this.answer = this.pick();
      this.save(); this.render();
    };
  },

  grid() {
    const g = document.getElementById('wl-g');
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
    const inp = document.getElementById('wl-inp');
    if (!inp) return;
    const g = inp.value.toLowerCase().trim();
    if (g.length !== 5) { document.getElementById('wl-st').textContent = '5 letters needed'; return; }
    this.current = g; this.guesses.push(g);
    if (g === this.answer || this.guesses.length >= WL_MAX) this.over = true;
    this.current = ''; this.save(); this.render();
  }
};
