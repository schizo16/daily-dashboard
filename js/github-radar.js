const AiRadar = {
  async load(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
    try {
      const [repos, stories] = await Promise.all([
        this.fetchGithubTrending(),
        this.fetchHackerNews()
      ]);
      container.innerHTML = '';
      container.appendChild(this.renderSection('Trending Today', 'github.com/trending', this.renderRepos(repos)));
      container.appendChild(this.renderSection('HackerNews', 'news.ycombinator.com', this.renderStories(stories)));
    } catch (err) {
      container.innerHTML = `<div class="error">Failed to load. <button class="btn" onclick="AiRadar.load(this.parentElement.parentElement)">Retry</button></div>`;
    }
  },

  renderSection(title, link, content) {
    const wrapper = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<h2>${title}</h2><a class="section-link" href="https://${link}" target="_blank">${link} ↗</a>`;
    wrapper.appendChild(header);
    wrapper.appendChild(content);
    return wrapper;
  },

  async fetchGithubTrending() {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const dateStr = d.toISOString().split('T')[0];
    const res = await fetch(`https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=10`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('GitHub API returned ' + res.status);
    const data = await res.json();
    return (data.items || []).map((r, i) => ({
      index: String(i + 1).padStart(2, '0'),
      name: r.full_name,
      url: r.html_url,
      description: r.description || '',
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language
    }));
  },

  async fetchHackerNews() {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = (await topRes.json()).slice(0, 20);
    const items = await Promise.all(
      ids.slice(0, 8).map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
      )
    );
    return items.filter(i => i && i.title)
      .slice(0, 6)
      .map((i, idx) => ({
        index: String(idx + 1).padStart(2, '0'),
        title: i.title,
        url: i.url || `https://news.ycombinator.com/item?id=${i.id}`,
        points: i.score || 0,
        by: i.by || 'anonymous',
        comments: i.descendants || 0
      }));
  },

  renderRepos(repos) {
    const list = document.createElement('div');
    list.className = 'entry-list';
    repos.forEach(r => {
      const entry = document.createElement('div');
      entry.className = 'entry';
      entry.innerHTML = `
        <span class="entry-index">${r.index}</span>
        <div class="entry-body">
          <div class="entry-title"><a href="${this.eAttr(r.url)}" target="_blank">${this.eHtml(r.name)}</a></div>
          ${r.description ? `<div class="entry-desc">${this.eHtml(r.description)}</div>` : ''}
          <div class="entry-meta">
            ${r.language ? `<span>${this.eHtml(r.language)}</span>` : ''}
            <span>${this.fmt(r.stars)} stars</span>
            <span>${this.fmt(r.forks)} forks</span>
          </div>
        </div>`;
      list.appendChild(entry);
    });
    return list;
  },

  renderStories(stories) {
    const list = document.createElement('div');
    list.className = 'entry-list';
    stories.forEach(s => {
      const entry = document.createElement('div');
      entry.className = 'entry';
      entry.innerHTML = `
        <span class="entry-index">${s.index}</span>
        <div class="entry-body">
          <div class="entry-title"><a href="${this.eAttr(s.url)}" target="_blank">${this.eHtml(s.title)}</a></div>
          <div class="entry-meta">
            <span>${s.points} points</span>
            <span>${s.comments} comments</span>
          </div>
        </div>`;
      list.appendChild(entry);
    });
    return list;
  },

  eHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
  eAttr(str) { return String(str).replace(/"/g, '&quot;'); },
  fmt(n) { if (n >= 1000) return (n / 1000).toFixed(1) + 'k'; return String(n); }
};
