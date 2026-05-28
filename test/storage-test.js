// Manual test — run via Node
// Expected: all assertions pass
const assert = (condition, msg) => { if (!condition) throw new Error(msg); };

globalThis.localStorage = { data: {}, getItem(k) { return this.data[k] || null; }, setItem(k, v) { this.data[k] = String(v); }, removeItem(k) { delete this.data[k]; } };
globalThis.document = { documentElement: { setAttribute() {} } };

eval(require('fs').readFileSync('js/storage.js', 'utf8').replace('const Storage', 'globalThis.Storage'));

Storage.set('test-key', 'hello');
assert(Storage.get('test-key') === 'hello', 'get/set basic');

Storage.set('num', 42);
assert(Storage.get('num') === 42, 'preserves number');

assert(Storage.get('missing', 'default') === 'default', 'default value');

Storage.addToWatchlist({ id: 1, title: 'Movie A' });
assert(Storage.getWatchlist().length === 1, 'add to watchlist');
assert(Storage.getWatchlist()[0].title === 'Movie A', 'watchlist item');

Storage.addToWatchlist({ id: 2, title: 'Movie B' });
assert(Storage.getWatchlist().length === 2, 'second item');

Storage.removeFromWatchlist(1);
assert(Storage.getWatchlist().length === 1, 'remove from watchlist');
assert(Storage.getWatchlist()[0].id === 2, 'correct item removed');

Storage.setTheme('dark');
assert(Storage.getTheme() === 'dark', 'theme dark');

Storage.setTheme('light');
assert(Storage.getTheme() === 'light', 'theme light');

console.log('All storage tests passed');
