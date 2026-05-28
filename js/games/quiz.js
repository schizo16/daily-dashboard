const QD = [
  { q: 'Which movie features a character named "Neo"?', a: 'The Matrix', o: ['The Matrix', 'Inception', 'Avatar', 'Tron'] },
  { q: 'Who directed "Pulp Fiction"?', a: 'Quentin Tarantino', o: ['Quentin Tarantino', 'Steven Spielberg', 'Martin Scorsese', 'David Fincher'] },
  { q: 'What year was "The Shawshank Redemption" released?', a: '1994', o: ['1992', '1994', '1996', '1998'] },
  { q: 'Which actor played Jack in "Titanic"?', a: 'Leonardo DiCaprio', o: ['Leonardo DiCaprio', 'Brad Pitt', 'Tom Cruise', 'Johnny Depp'] },
  { q: 'Which movie series features lightsabers?', a: 'Star Wars', o: ['Star Wars', 'Star Trek', 'Harry Potter', 'The Matrix'] },
  { q: 'Who voiced Woody in "Toy Story"?', a: 'Tom Hanks', o: ['Tom Hanks', 'Tim Allen', 'Billy Crystal', 'Eddie Murphy'] },
  { q: 'Which movie won the first Best Picture Oscar?', a: 'Wings', o: ['Wings', 'Sunrise', 'The Broadway Melody', 'All Quiet on the Western Front'] },
  { q: 'What is the highest-grossing film of all time?', a: 'Avatar', o: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars: The Force Awakens'] },
  { q: 'Who played The Joker in "The Dark Knight"?', a: 'Heath Ledger', o: ['Heath Ledger', 'Jack Nicholson', 'Joaquin Phoenix', 'Jared Leto'] },
  { q: 'Which film studio is known for the opening fanfare?', a: '20th Century Studios', o: ['20th Century Studios', 'Universal', 'Warner Bros', 'Paramount'] },
  { q: 'What does "FPS" stand for in gaming/movies?', a: 'Frames Per Second', o: ['Frames Per Second', 'First Person Shot', 'Fast Paced Scene', 'Final Production Stage'] },
  { q: 'Who directed "Interstellar"?', a: 'Christopher Nolan', o: ['Christopher Nolan', 'Denis Villeneuve', 'Ridley Scott', 'James Cameron'] },
  { q: 'Which movie features the song "My Heart Will Go On"?', a: 'Titanic', o: ['Titanic', 'The Bodyguard', 'Dirty Dancing', 'Footloose'] },
  { q: 'What is the name of the hobbit in "Lord of the Rings"?', a: 'Frodo', o: ['Frodo', 'Bilbo', 'Sam', 'Pippin'] },
  { q: 'Which movie features dinosaurs brought back to life?', a: 'Jurassic Park', o: ['Jurassic Park', 'The Lost World', 'King Kong', 'Godzilla'] },
];

const Quiz = {
  questions: [], idx: 0, score: 0, ans: false, c: null,

  init(con) {
    this.c = con;
    const s = Storage.getGameState('quiz');
    if (s && s.date === this.today()) {
      this.questions = s.questions || this.pick(); this.idx = s.idx || 0;
      this.score = s.score || 0; this.ans = s.ans || false;
    } else {
      this.questions = this.pick(); this.idx = 0; this.score = 0; this.ans = false;
    }
    this.render();
  },

  today() { return new Date().toISOString().slice(0, 10); },
  pick() { return [...QD].sort(() => Math.random() - 0.5).slice(0, 5); },

  save() {
    Storage.setGameState('quiz', { date: this.today(), questions: this.questions, idx: this.idx, score: this.score, ans: this.ans });
  },

  render() {
    if (!this.c) return;
    if (this.idx >= this.questions.length) { this.done(); return; }

    const q = this.questions[this.idx];
    const sh = [...q.o].sort(() => Math.random() - 0.5);

    this.c.innerHTML = `
      <div class="section-h"><h2>${_('movieQuiz')}</h2><span class="section-h-link">${this.idx + 1} / ${this.questions.length}</span></div>
      <div class="quiz-prog">${_('score')} ${this.score}</div>
      <div class="quiz-q">${esc(q.q)}</div>
      ${sh.map(o => `<button class="quiz-opt" data-v="${o.replace(/"/g, '&quot;')}">${esc(o)}</button>`).join('')}
      <div id="qfb" style="margin-top:12px;font-size:0.85rem"></div>`;

    if (this.ans) this.reveal(q.a);

    this.c.querySelectorAll('.quiz-opt').forEach(b => {
      b.onclick = () => this.check(b.dataset.v, q.a);
    });
  },

  check(sel, correct) {
    if (this.ans) return;
    this.ans = true;
    if (sel === correct) this.score++;
    this.save();
    this.reveal(correct);
    const f = document.getElementById('qfb');
    if (f) f.textContent = sel === correct ? '✓ ' + _('correct') : '✗ ' + correct;
    setTimeout(() => { this.idx++; this.ans = false; this.save(); this.render(); }, 1400);
  },

  reveal(correct) {
    this.c.querySelectorAll('.quiz-opt').forEach(b => {
      b.disabled = true;
      if (b.dataset.v === correct) b.classList.add('correct');
      else b.classList.add('wrong');
    });
  },

  done() {
    const pct = this.score === this.questions.length ? _('perfect') : this.score >= 3 ? _('nice') : _('tryAgain');
    this.c.innerHTML = `
      <div style="text-align:center;padding:16px 0">
        <div class="section-h" style="justify-content:center;margin-bottom:12px"><h2>${_('movieQuiz')}</h2></div>
        <div style="font-size:2rem;font-weight:700">${this.score}/${this.questions.length}</div>
        <div style="color:var(--text-2);margin:8px 0 20px">${pct}</div>
        <button class="btn btn-primary" id="qr">${_('playAgain')}</button>
      </div>`;
    document.getElementById('qr').onclick = () => { Storage.remove('game_quiz'); this.init(this.c); };
  },
};
