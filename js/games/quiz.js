const MOVIE_QUIZ_Q = [
  { q: 'Which movie features a character named "Neo"?', a: 'The Matrix', opts: ['The Matrix', 'Inception', 'Avatar', 'Tron'] },
  { q: 'Who directed "Pulp Fiction"?', a: 'Quentin Tarantino', opts: ['Quentin Tarantino', 'Steven Spielberg', 'Martin Scorsese', 'David Fincher'] },
  { q: 'What year was "The Shawshank Redemption" released?', a: '1994', opts: ['1992', '1994', '1996', '1998'] },
  { q: 'Which actor played Jack in "Titanic"?', a: 'Leonardo DiCaprio', opts: ['Leonardo DiCaprio', 'Brad Pitt', 'Tom Cruise', 'Johnny Depp'] },
  { q: 'Which movie series features lightsabers?', a: 'Star Wars', opts: ['Star Wars', 'Star Trek', 'Harry Potter', 'The Matrix'] },
  { q: 'Who voiced Woody in "Toy Story"?', a: 'Tom Hanks', opts: ['Tom Hanks', 'Tim Allen', 'Billy Crystal', 'Eddie Murphy'] },
  { q: 'Which movie won the first Best Picture Oscar?', a: 'Wings', opts: ['Wings', 'Sunrise', 'The Broadway Melody', 'All Quiet on the Western Front'] },
  { q: 'What is the highest-grossing film of all time?', a: 'Avatar', opts: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars: The Force Awakens'] },
  { q: 'Who played The Joker in "The Dark Knight"?', a: 'Heath Ledger', opts: ['Heath Ledger', 'Jack Nicholson', 'Joaquin Phoenix', 'Jared Leto'] },
  { q: 'Which film studio is known for the opening fanfare?', a: '20th Century Studios', opts: ['20th Century Studios', 'Universal', 'Warner Bros', 'Paramount'] },
  { q: 'What does "FPS" stand for in gaming/movies?', a: 'Frames Per Second', opts: ['Frames Per Second', 'First Person Shot', 'Fast Paced Scene', 'Final Production Stage'] },
  { q: 'Who directed "Interstellar"?', a: 'Christopher Nolan', opts: ['Christopher Nolan', 'Denis Villeneuve', 'Ridley Scott', 'James Cameron'] },
  { q: 'Which movie features the song "My Heart Will Go On"?', a: 'Titanic', opts: ['Titanic', 'The Bodyguard', 'Dirty Dancing', 'Footloose'] },
  { q: 'What is the name of the hobbit in "Lord of the Rings"?', a: 'Frodo', opts: ['Frodo', 'Bilbo', 'Sam', 'Pippin'] },
  { q: 'Which movie features dinosaurs brought back to life?', a: 'Jurassic Park', opts: ['Jurassic Park', 'The Lost World', 'King Kong', 'Godzilla'] },
];

const Quiz = {
  questions: [], idx: 0, score: 0, answered: false, container: null,

  init(c) {
    this.container = c;
    const saved = Storage.getGameState('quiz');
    if (saved && saved.date === this.today()) {
      this.questions = saved.questions || this.pick();
      this.idx = saved.idx || 0; this.score = saved.score || 0; this.answered = saved.answered || false;
    } else {
      this.questions = this.pick(); this.idx = 0; this.score = 0; this.answered = false;
    }
    this.render();
  },

  today() { return new Date().toISOString().slice(0, 10); },
  pick() { return [...MOVIE_QUIZ_Q].sort(() => Math.random() - 0.5).slice(0, 5); },

  save() {
    Storage.setGameState('quiz', { date: this.today(), questions: this.questions, idx: this.idx, score: this.score, answered: this.answered });
  },

  render() {
    if (!this.container) return;
    if (this.idx >= this.questions.length) { this.done(); return; }

    const q = this.questions[this.idx];
    const shuffled = [...q.opts].sort(() => Math.random() - 0.5);

    this.container.innerHTML = `
      <div class="section-header"><h2>Movie Quiz</h2><span class="section-link">${this.idx + 1}/${this.questions.length}</span></div>
      <div class="quiz-progress">Score: ${this.score}</div>
      <div class="quiz-question">${this.e(q.q)}</div>
      ${shuffled.map(o => `<button class="quiz-option" data-answer="${this.eAttr(o)}">${this.e(o)}</button>`).join('')}
      <div class="quiz-feedback" id="quiz-feedback"></div>
    `;

    if (this.answered) this.reveal(q.a);

    this.container.querySelectorAll('.quiz-option').forEach(b => {
      b.addEventListener('click', () => this.answer(b.dataset.answer, q.a));
    });
  },

  answer(selected, correct) {
    if (this.answered) return;
    this.answered = true;
    if (selected === correct) this.score++;
    this.save();
    this.reveal(correct);
    const f = document.getElementById('quiz-feedback');
    if (f) {
      f.textContent = selected === correct ? 'Correct.' : `Wrong. Answer: ${correct}`;
      f.style.color = selected === correct ? 'var(--text)' : 'var(--text-secondary)';
    }
    setTimeout(() => { this.idx++; this.answered = false; this.save(); this.render(); }, 1400);
  },

  reveal(correct) {
    this.container.querySelectorAll('.quiz-option').forEach(b => {
      b.disabled = true;
      if (b.dataset.answer === correct) b.classList.add('correct');
      else b.classList.add('wrong');
    });
  },

  done() {
    this.container.innerHTML = `
      <div class="section-header"><h2>Movie Quiz</h2></div>
      <div style="padding:24px 0;text-align:center">
        <div style="font-size:2rem;font-weight:600;margin-bottom:8px">${this.score}/${this.questions.length}</div>
        <div style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:20px">${this.score === this.questions.length ? 'Perfect.' : this.score >= 3 ? 'Good.' : 'Keep watching.'}</div>
        <button class="btn btn-primary" id="quiz-restart">Play Again</button>
      </div>
    `;
    document.getElementById('quiz-restart').addEventListener('click', () => {
      Storage.remove('game_quiz');
      this.init(this.container);
    });
  },

  e(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
  eAttr(str) { return String(str).replace(/"/g, '&quot;'); }
};
