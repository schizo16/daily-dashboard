const AiRadar = {
  async load(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
    try {
      const [repos, stories] = await Promise.all([
        this.fetchGithubTrending(),
        this.fetchHackerNews()
      ]);
      container.innerHTML = '';
      container.appendChild(this.box('Trending Today', 'github.com/trending', this.repos(repos)));
      container.appendChild(this.box('HackerNews', 'news.ycombinator.com', this.stories(stories)));
    } catch (err) {
      container.innerHTML = `<div class="loading error">Failed to load. <button class="btn" onclick="AiRadar.load(this.parentElement.parentElement)">Retry</button></div>`;
    }
  },

  box(title, link, content) {
    const s = document.createElement('div');
    s.className = 'section';
    s.innerHTML = `<div class="section-header"><h2>${title}</h2><a class="section-link" href="https://${link}" target="_blank">${link} ↗</a></div>`;
    s.appendChild(content);
    return s;
  },

  async fetchGithubTrending() {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const ds = d.toISOString().split('T')[0];
    const r = await fetch(`https://api.github.com/search/repositories?q=created:>${ds}&sort=stars&order=desc&per_page=8`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!r.ok) throw new Error('GitHub API error');
    const data = await r.json();
    return (data.items || []).map(x => ({
      name: x.full_name, url: x.html_url,
      desc: x.description || '',
      stars: x.stargazers_count, forks: x.forks_count, lang: x.language
    }));
  },

  async fetchHackerNews() {
    const r = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = (await r.json()).slice(0, 15);
    const items = await Promise.all(
      ids.slice(0, 6).map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
      )
    );
    return items.filter(i => i && i.title).slice(0, 5).map(i => ({
      title: i.title, url: i.url || `https://news.ycombinator.com/item?id=${i.id}`,
      points: i.score || 0, by: i.by || '?', comments: i.descendants || 0
    }));
  },

  repos(list) {
    const d = document.createElement('div');
    list.forEach(r => {
      const e = document.createElement('div');
      e.className = 'entry';
      e.innerHTML = `<div class="entry-body">
        <div class="entry-title"><a href="${this.ea(r.url)}" target="_blank">${this.eh(r.name)}</a></div>
        ${r.desc ? `<div class="entry-desc">${this.eh(r.desc)}</div>` : ''}
        <div class="entry-meta">
          ${r.lang ? `<span>${this.eh(r.lang)}</span>` : ''}
          <span>${this.fmt(r.stars)} stars</span>
          <span>${this.fmt(r.forks)} forks</span>
        </div>
      </div>`;
      d.appendChild(e);
    });
    return d;
  },

  stories(list) {
    const d = document.createElement('div');
    list.forEach(s => {
      const e = document.createElement('div');
      e.className = 'entry';
      e.innerHTML = `<div class="entry-body">
        <div class="entry-title"><a href="${this.ea(s.url)}" target="_blank">${this.eh(s.title)}</a></div>
        <div class="entry-meta"><span>${s.points} points</span><span>${s.comments} comments</span></div>
      </div>`;
      d.appendChild(e);
    });
    return d;
  },

  eh(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },
  ea(s) { return String(s).replace(/"/g, '&quot;'); },
  fmt(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n); }
};
