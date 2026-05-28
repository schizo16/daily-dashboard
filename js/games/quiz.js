const MOVIE_QUIZ_QUESTIONS = [
  { q: 'Which movie features a character named "Neo"?', a: 'The Matrix', options: ['The Matrix', 'Inception', 'Avatar', 'Tron'] },
  { q: 'Who directed "Pulp Fiction"?', a: 'Quentin Tarantino', options: ['Quentin Tarantino', 'Steven Spielberg', 'Martin Scorsese', 'David Fincher'] },
  { q: 'What year was "The Shawshank Redemption" released?', a: '1994', options: ['1992', '1994', '1996', '1998'] },
  { q: 'Which actor played Jack in "Titanic"?', a: 'Leonardo DiCaprio', options: ['Leonardo DiCaprio', 'Brad Pitt', 'Tom Cruise', 'Johnny Depp'] },
  { q: 'Which movie series features lightsabers?', a: 'Star Wars', options: ['Star Wars', 'Star Trek', 'Harry Potter', 'The Matrix'] },
  { q: 'Who voiced Woody in "Toy Story"?', a: 'Tom Hanks', options: ['Tom Hanks', 'Tim Allen', 'Billy Crystal', 'Eddie Murphy'] },
  { q: 'Which movie won the first Best Picture Oscar?', a: 'Wings', options: ['Wings', 'Sunrise', 'The Broadway Melody', 'All Quiet on the Western Front'] },
  { q: 'What is the highest-grossing film of all time?', a: 'Avatar', options: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars: The Force Awakens'] },
  { q: 'Who played The Joker in "The Dark Knight"?', a: 'Heath Ledger', options: ['Heath Ledger', 'Jack Nicholson', 'Joaquin Phoenix', 'Jared Leto'] },
  { q: 'Which film studio is known for the opening fanfare?', a: '20th Century Studios', options: ['20th Century Studios', 'Universal', 'Warner Bros', 'Paramount'] },
  { q: 'What does "FPS" stand for in gaming/movies?', a: 'Frames Per Second', options: ['Frames Per Second', 'First Person Shot', 'Fast Paced Scene', 'Final Production Stage'] },
  { q: 'Who directed "Interstellar"?', a: 'Christopher Nolan', options: ['Christopher Nolan', 'Denis Villeneuve', 'Ridley Scott', 'James Cameron'] },
  { q: 'Which movie features the song "My Heart Will Go On"?', a: 'Titanic', options: ['Titanic', 'The Bodyguard', 'Dirty Dancing', 'Footloose'] },
  { q: 'What is the name of the hobbit in "Lord of the Rings"?', a: 'Frodo', options: ['Frodo', 'Bilbo', 'Sam', 'Pippin'] },
  { q: 'Which movie features dinosaurs brought back to life?', a: 'Jurassic Park', options: ['Jurassic Park', 'The Lost World', 'King Kong', 'Godzilla'] },
];

const Quiz = {
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  container: null,

  init(container) {
    this.container = container;
    const saved = Storage.getGameState('quiz');
    if (saved && saved.date === this.today()) {
      this.questions = saved.questions || this.pickQuestions();
      this.currentIndex = saved.currentIndex || 0;
      this.score = saved.score || 0;
      this.answered = saved.answered || false;
    } else {
      this.questions = this.pickQuestions();
      this.currentIndex = 0;
      this.score = 0;
      this.answered = false;
    }
    this.render();
  },

  today() {
    return new Date().toISOString().slice(0, 10);
  },

  pickQuestions() {
    const shuffled = [...MOVIE_QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  },

  save() {
    Storage.setGameState('quiz', {
      date: this.today(),
      questions: this.questions,
      currentIndex: this.currentIndex,
      score: this.score,
      answered: this.answered
    });
  },

  render() {
    if (!this.container) return;

    if (this.currentIndex >= this.questions.length) {
      this.renderResult();
      return;
    }

    const q = this.questions[this.currentIndex];
    const shuffled = [...q.options].sort(() => Math.random() - 0.5);
    this.container.innerHTML = `
      <h2 class="section-title">🎬 Movie Quiz</h2>
      <p class="section-subtitle">Question ${this.currentIndex + 1} of ${this.questions.length} · Score: ${this.score}</p>
      <div class="card">
        <h3>${this.escapeHtml(q.q)}</h3>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
          ${shuffled.map(opt => `
            <button class="quiz-option" data-answer="${this.escapeAttr(opt)}" style="padding:10px 16px;border:2px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);cursor:pointer;font-size:0.95rem;text-align:left;transition:all 0.2s" ${this.answered ? 'disabled' : ''}>
              ${this.escapeHtml(opt)}
            </button>
          `).join('')}
        </div>
        <div id="quiz-feedback" style="margin-top:12px;font-weight:600"></div>
      </div>
    `;

    if (this.answered) {
      this.highlightAnswer(q.a);
    }

    this.container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => this.checkAnswer(btn.dataset.answer, q.a));
    });
  },

  checkAnswer(selected, correct) {
    if (this.answered) return;
    this.answered = true;
    if (selected === correct) this.score++;
    this.save();
    this.highlightAnswer(correct);
    const feedback = document.getElementById('quiz-feedback');
    if (!feedback) return;
    feedback.textContent = selected === correct ? '✅ Correct!' : `❌ Wrong! Answer: ${correct}`;
    feedback.style.color = selected === correct ? '#22c55e' : '#ef4444';

    setTimeout(() => {
      this.currentIndex++;
      this.answered = false;
      this.save();
      this.render();
    }, 1500);
  },

  highlightAnswer(correct) {
    this.container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.answer === correct) {
        btn.style.borderColor = '#22c55e';
        btn.style.background = '#22c55e20';
      } else {
        btn.style.opacity = '0.6';
      }
    });
  },

  renderResult() {
    this.container.innerHTML = `
      <h2 class="section-title">🎬 Movie Quiz</h2>
      <div class="card" style="text-align:center;padding:32px">
        <h3>Quiz Complete!</h3>
        <p style="font-size:2rem;font-weight:700;margin:16px 0">${this.score} / ${this.questions.length}</p>
        <p style="color:var(--text-secondary)">${this.score === this.questions.length ? '🏆 Perfect score!' : this.score >= 3 ? '👍 Good job!' : '📚 Keep watching!'}</p>
        <button id="quiz-restart" style="margin-top:16px;padding:10px 24px;border:none;border-radius:8px;background:var(--accent);color:#fff;cursor:pointer;font-weight:600">Play Again</button>
      </div>
    `;
    document.getElementById('quiz-restart').addEventListener('click', () => {
      Storage.remove('game_quiz');
      this.init(this.container);
    });
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
