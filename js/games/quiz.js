const QUIZ_DATA = [
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
  questions: [], idx: 0, score: 0, answered: false, container: null,

  init(c) {
    this.container = c;
    const s = Storage.getGameState('quiz');
    if (s && s.date === this.today()) {
      this.questions = s.questions || this.pick(); this.idx = s.idx || 0;
      this.score = s.score || 0; this.answered = s.answered || false;
    } else {
      this.questions = this.pick(); this.idx = 0; this.score = 0; this.answered = false;
    }
    this.render();
  },

  today() { return new Date().toISOString().slice(0, 10); },
  pick() { return [...QUIZ_DATA].sort(() => Math.random() - 0.5).slice(0, 5); },

  save() {
    Storage.setGameState('quiz', { date: this.today(), questions: this.questions, idx: this.idx, score: this.score, answered: this.answered });
  },

  render() {
    if (!this.container) return;
    if (this.idx >= this.questions.length) { this.done(); return; }

    const q = this.questions[this.idx];
    const shuffled = [...q.o].sort(() => Math.random() - 0.5);

    this.container.innerHTML = `
      <div class="section">
        <div class="section-header"><h2>Movie Quiz</h2><span class="section-link">${this.idx + 1} / ${this.questions.length}</span></div>
        <div class="quiz-progress">Score: ${this.score}</div>
        <div class="quiz-question">${this.eh(q.q)}</div>
        ${shuffled.map(o => `<button class="quiz-option" data-v="${this.ea(o)}">${this.eh(o)}</button>`).join('')}
        <div class="quiz-feedback" id="q-fb"></div>
      </div>
    `;

    if (this.answered) this.showAnswer(q.a);

    this.container.querySelectorAll('.quiz-option').forEach(b => {
      b.addEventListener('click', () => this.check(b.dataset.v, q.a));
    });
  },

  check(selected, correct) {
    if (this.answered) return;
    this.answered = true;
    if (selected === correct) this.score++;
    this.save();
    this.showAnswer(correct);
    const f = document.getElementById('q-fb');
    if (f) {
      f.textContent = selected === correct ? 'Correct.' : `Nope — ${correct}`;
    }
    setTimeout(() => { this.idx++; this.answered = false; this.save(); this.render(); }, 1400);
  },

  showAnswer(correct) {
    this.container.querySelectorAll('.quiz-option').forEach(b => {
      b.disabled = true;
      if (b.dataset.v === correct) b.classList.add('correct');
      else b.classList.add('wrong');
    });
  },

  done() {
    this.container.innerHTML = `
      <div class="section" style="text-align:center;padding:32px 20px">
        <div class="section-header" style="justify-content:center"><h2>Movie Quiz</h2></div>
        <div style="font-size:2.2rem;font-weight:700;margin:16px 0 4px">${this.score}/${this.questions.length}</div>
        <div style="color:var(--text-dim);font-size:0.88rem;margin-bottom:20px">
          ${this.score === this.questions.length ? 'Perfect.' : this.score >= 3 ? 'Nice.' : 'Try again.'}
        </div>
        <button class="btn btn-primary" id="q-restart">Play Again</button>
      </div>
    `;
    document.getElementById('q-restart').addEventListener('click', () => {
      Storage.remove('game_quiz');
      this.init(this.container);
    });
  },

  eh(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },
  ea(s) { return String(s).replace(/"/g, '&quot;'); }
};
