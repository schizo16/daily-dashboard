const WORDS = ['apple','beach','crane','dance','eagle','flame','grape','house','ivory','joker','knife','lemon','mango','noble','ocean','piano','queen','river','sugar','tiger','umbra','vivid','whale','xenon','yacht','zebra','blaze','coral','debug','ember','frost','ghost','hazel','input','jolly','kayak','lunar','merry','nymph','opera','pearl','query','rugby','solar','topaz','ultra','vocal','waltz','yield','azure'];
const WMAX = 6;

const Wordle = {
  answer: '', guesses: [], cur: '', over: false, c: null,

  init(con) {
    this.c = con;
    const s = Storage.getGameState('wordle');
    if (s && s.date === this.today()) {
      this.guesses = s.guesses || []; this.cur = s.cur || '';
      this.over = s.over || false; this.answer = s.answer || this.pick();
    } else {
      this.guesses = []; this.cur = ''; this.over = false; this.answer = this.pick();
    }
    this.render();
  },

  today() { return new Date().toISOString().slice(0, 10); },
  pick() { return WORDS[Math.floor(Date.now() / 86400000) % WORDS.length]; },

  save() {
    Storage.setGameState('wordle', { date: this.today(), guesses: this.guesses, cur: this.cur, over: this.over, answer: this.answer });
  },

  render() {
    if (!this.c) return;
    this.c.innerHTML = `
      <div class="section">
        <div class="section-h"><h2>Wordle</h2><span class="section-h-link" style="cursor:pointer" id="wr">New word →</span></div>
        <div class="w-grid" id="wg"></div>
        <div class="w-inp-area"><input type="text" id="wi" class="w-inp" maxlength="5" placeholder="guess" autocomplete="off" spellcheck="false"><button class="btn btn-primary" id="ws">Guess</button></div>
        <div class="w-status" id="wo"></div>
      </div>`;
    this.grid();
    if (this.over) {
      document.getElementById('wi').disabled = true;
      document.getElementById('ws').disabled = true;
      document.getElementById('wo').textContent = this.guesses.includes(this.answer) ? `Got it! (${this.guesses.length}/6)` : `Word: ${this.answer.toUpperCase()}`;
    }
    document.getElementById('wi').onkeydown = e => { if (e.key === 'Enter') this.guess(); };
    document.getElementById('ws').onclick = () => this.guess();
    document.getElementById('wr').onclick = () => {
      Storage.remove('game_wordle');
      this.guesses = []; this.cur = ''; this.over = false; this.answer = this.pick();
      this.save(); this.render();
    };
  },

  grid() {
    const g = document.getElementById('wg');
    if (!g) return;
    g.innerHTML = '';
    for (let i = 0; i < WMAX; i++) {
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
    const i = document.getElementById('wi');
    if (!i) return;
    const g = i.value.toLowerCase().trim();
    if (g.length !== 5) { document.getElementById('wo').textContent = '5 letters'; return; }
    this.cur = g; this.guesses.push(g);
    if (g === this.answer || this.guesses.length >= WMAX) this.over = true;
    this.cur = ''; this.save(); this.render();
  }
};
