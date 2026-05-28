const LOCALE = {
  vi: {
    pageTitle: 'bảng tin',
    navHome: 'Trang chủ',
    navRadar: 'Theo dõi',
    navMovies: 'Phim',
    navGames: 'Trò chơi',
    navWatchlist: 'Đã lưu',

    heroTitle: 'Xin chào.',
    heroDesc: 'Bảng tin cá nhân — AI xu hướng, phim hay, và game mỗi ngày. Không framework, không rác.',
    heroRadar: 'Theo dõi →',
    heroMovies: 'Phim →',
    heroGames: 'Trò chơi →',
    heroGithub: 'GitHub ↗',
    quickLinks: 'Liên kết nhanh',

    tileRadarTitle: 'Theo dõi AI',
    tileRadarDesc: 'Kho lưu trữ GitHub thịnh hành và các câu chuyện hàng đầu trên HackerNews, cập nhật hàng ngày.',
    tileMoviesTitle: 'Phim',
    tileMoviesDesc: 'Phim thịnh hành, xếp hạng và danh sách phim cá nhân của bạn.',
    tileGamesTitle: 'Trò chơi',
    tileGamesDesc: 'Wordle và đố vui về phim — thử thách hàng ngày với điểm số được lưu.',
    tileWatchlistTitle: 'Đã lưu',
    tileWatchlistDesc: 'Phim bạn đã lưu. Một cú nhấp chuột để xóa.',

    trending: 'Thịnh hành',
    hackernews: 'HackerNews',
    trendingMovies: 'Phim thịnh hành',

    save: 'Lưu',
    saved: 'Đã lưu',
    remove: 'Xóa',
    nothingSaved: 'Chưa có gì.',
    nothingSavedBrowse: 'Chưa có gì. Vào <a href="#movies" style="color:var(--accent)">Phim</a> để thêm.',
    movies: 'Phim',

    games: 'Trò chơi',
    wordle: 'Wordle',
    movieQuiz: 'Đố vui',
    guess: 'Đoán',
    newWord: 'Từ mới →',
    letters5: '5 chữ cái',
    gotIt: 'Đúng rồi!',
    wordWas: 'Từ là:',
    score: 'Điểm:',
    correct: 'Đúng.',
    wrong: 'Sai.',
    perfect: 'Hoàn hảo.',
    nice: 'Tốt.',
    tryAgain: 'Thử lại.',
    playAgain: 'Chơi lại',

    loading: 'Đang tải...',
    failed: 'Tải thất bại.',
    retry: 'Thử lại',
    tmdbError: 'Lỗi TMDB — kiểm tra API key',
    githubError: 'Lỗi GitHub API',

    footer: 'bảng tin · js thuần · 2026',
  },

  en: {
    pageTitle: 'dashboard',
    navHome: 'Home',
    navRadar: 'Radar',
    navMovies: 'Movies',
    navGames: 'Games',
    navWatchlist: 'Watchlist',

    heroTitle: 'Hello.',
    heroDesc: 'A personal dashboard — AI trending, movie picks, and daily games. No frameworks, no slop.',
    heroRadar: 'Radar →',
    heroMovies: 'Movies →',
    heroGames: 'Games →',
    heroGithub: 'GitHub ↗',
    quickLinks: 'Quick Links',

    tileRadarTitle: 'AI Radar',
    tileRadarDesc: 'Trending GitHub repos and top HackerNews stories, updated daily.',
    tileMoviesTitle: 'Movies',
    tileMoviesDesc: 'Trending movies, ratings, and your personal watchlist.',
    tileGamesTitle: 'Games',
    tileGamesDesc: 'Wordle and movie quiz — daily challenges with persistent scores.',
    tileWatchlistTitle: 'Watchlist',
    tileWatchlistDesc: 'Movies you have saved. One click to remove.',

    trending: 'Trending',
    hackernews: 'HackerNews',
    trendingMovies: 'Trending Movies',

    save: 'Save',
    saved: 'Saved',
    remove: 'Remove',
    nothingSaved: 'Nothing saved.',
    nothingSavedBrowse: 'Nothing saved. Browse <a href="#movies" style="color:var(--accent)">Movies</a> to add some.',
    movies: 'Movies',

    games: 'Games',
    wordle: 'Wordle',
    movieQuiz: 'Movie Quiz',
    guess: 'Guess',
    newWord: 'New word →',
    letters5: '5 letters',
    gotIt: 'Got it!',
    wordWas: 'Word:',
    score: 'Score:',
    correct: 'Correct.',
    wrong: 'Nope —',
    perfect: 'Perfect.',
    nice: 'Nice.',
    tryAgain: 'Try again.',
    playAgain: 'Play Again',

    loading: 'Loading...',
    failed: 'Failed to load.',
    retry: 'Retry',
    tmdbError: 'TMDB API error — check your key',
    githubError: 'GitHub API error',

    footer: 'dashboard · vanilla js · 2026',
  }
};

let currentLocale = Storage.get('locale', 'vi');

function _(key) {
  return LOCALE[currentLocale]?.[key] ?? key;
}

function setLocale(loc) {
  currentLocale = loc;
  Storage.set('locale', loc);
  location.reload();
}
