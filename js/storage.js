const Storage = {
  get(key, defaultVal = null) {
    try {
      const val = localStorage.getItem('dd_' + key);
      return val !== null ? JSON.parse(val) : defaultVal;
    } catch { return defaultVal; }
  },
  set(key, val) {
    localStorage.setItem('dd_' + key, JSON.stringify(val));
  },
  remove(key) {
    localStorage.removeItem('dd_' + key);
  },
  getWatchlist() {
    return this.get('watchlist', []);
  },
  addToWatchlist(movie) {
    const list = this.getWatchlist();
    if (!list.find(m => m.id === movie.id)) {
      list.push({ id: movie.id, title: movie.title, poster: movie.poster_path, rating: movie.vote_average, addedAt: Date.now() });
      this.set('watchlist', list);
    }
  },
  removeFromWatchlist(movieId) {
    this.set('watchlist', this.getWatchlist().filter(m => m.id !== movieId));
  },
  getTheme() {
    return this.get('theme', 'light');
  },
  setTheme(theme) {
    this.set('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },
  getPinnedTab() {
    return this.get('pinnedTab', null);
  },
  setPinnedTab(tab) {
    this.set('pinnedTab', tab);
  },
  getGameState(gameId) {
    return this.get('game_' + gameId, null);
  },
  setGameState(gameId, state) {
    this.set('game_' + gameId, state);
  }
};
