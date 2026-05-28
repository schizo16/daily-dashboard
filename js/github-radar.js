const AiRadar = {
  async load(container) {
    container.innerHTML = '<div class="loading">Loading AI Radar...</div>';
    try {
      const [repos, stories] = await Promise.all([
        this.fetchGithubTrending(),
        this.fetchHackerNews()
      ]);
      container.innerHTML = '';
      container.appendChild(this.renderRepos(repos));
      container.appendChild(this.renderStories(stories));
    } catch (err) {
      container.innerHTML = `<div class="error">Failed to load. <button onclick="AiRadar.load(this.parentElement.parentElement)" style="background:none;border:1px solid var(--border);border-radius:6px;padding:4px 12px;cursor:pointer;color:var(--accent)">Retry</button></div>`;
    }
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
    return (data.items || []).map(r => ({
      name: r.full_name,
      url: r.html_url,
      description: r.description || '(No description)',
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language
    }));
  },

  async fetchHackerNews() {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = (await topRes.json()).slice(0, 20);
    const items = await Promise.all(
      ids.slice(0, 10).map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
      )
    );
    return items.filter(i => i && i.title && i.url)
      .slice(0, 8)
      .map(i => ({
        title: i.title,
        url: i.url,
        points: i.score || 0,
        by: i.by || 'anonymous',
        descendants: i.descendants || 0
      }));
  },

  renderRepos(repos) {
    const section = document.createElement('div');
    section.innerHTML = '<h2 class="section-title" style="margin-top:0">🔥 GitHub Trending Today</h2>';
    repos.forEach(r => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3><a href="${this.escapeAttr(r.url)}" target="_blank" rel="noopener">${this.escapeHtml(r.name)}</a></h3>
        <p>${this.escapeHtml(r.description)}</p>
        <div class="meta">
          ${r.language ? `<span>🔤 ${this.escapeHtml(r.language)}</span>` : ''}
          <span>⭐ ${this.formatNum(r.stars)}</span>
          <span>⑂ ${this.formatNum(r.forks)}</span>
        </div>`;
      section.appendChild(card);
    });
    return section;
  },

  renderStories(stories) {
    const section = document.createElement('div');
    section.innerHTML = '<h2 class="section-title" style="margin-top:24px">📰 Top HackerNews</h2>';
    stories.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3><a href="${this.escapeAttr(s.url)}" target="_blank" rel="noopener">${this.escapeHtml(s.title)}</a></h3>
        <div class="meta">${s.points} points by ${this.escapeHtml(s.by)} · ${s.descendants} comments</div>`;
      section.appendChild(card);
    });
    return section;
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }
};
