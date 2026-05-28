const AiRadar = {
  async load(c) {
    c.innerHTML = '<div class="loading">Loading...</div>';
    try {
      const [repos, stories] = await Promise.all([this.repos(), this.hn()]);
      c.innerHTML = '';
      c.appendChild(this.box('Trending Today', 'github.com/trending', this.rl(repos)));
      c.appendChild(this.box('HackerNews', 'news.ycombinator.com', this.hl(stories)));
    } catch (e) {
      c.innerHTML = `<div class="loading error">Failed to load. <button class="btn" onclick="AiRadar.load(this.parentElement.parentElement)">Retry</button></div>`;
    }
  },

  box(t, l, html) {
    const s = document.createElement('div');
    s.className = 'section';
    s.innerHTML = `<div class="section-h"><h2>${t}</h2><a href="https://${l}" target="_blank">${l} ↗</a></div>`;
    s.appendChild(html);
    return s;
  },

  async repos() {
    const d = new Date(); d.setDate(d.getDate() - 7);
    const r = await fetch(`https://api.github.com/search/repositories?q=created:>${d.toISOString().split('T')[0]}&sort=stars&order=desc&per_page=8`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!r.ok) throw new Error('GitHub API error');
    return (await r.json()).items.map(x => ({
      n: x.full_name, u: x.html_url, d: x.description || '',
      s: x.stargazers_count, f: x.forks_count, l: x.language
    }));
  },

  async hn() {
    const r = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = (await r.json()).slice(0, 15);
    const items = await Promise.all(ids.slice(0, 6).map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(x => x.json())
    ));
    return items.filter(i => i && i.title).slice(0, 5).map(i => ({
      t: i.title, u: i.url || `https://news.ycombinator.com/item?id=${i.id}`,
      p: i.score || 0, c: i.descendants || 0
    }));
  },

  rl(list) {
    const d = document.createElement('div');
    list.forEach(r => {
      const e = document.createElement('div'); e.className = 'entry';
      e.innerHTML = `<span class="entry-dot"></span><div class="entry-body">
        <div class="entry-title"><a href="${this.ea(r.u)}" target="_blank">${this.eh(r.n)}</a></div>
        ${r.d ? `<div class="entry-desc">${this.eh(r.d)}</div>` : ''}
        <div class="entry-meta">${r.l ? `<span>${this.eh(r.l)}</span>` : ''}<span>${this.fmt(r.s)} stars</span><span>${this.fmt(r.f)} forks</span></div>
      </div>`;
      d.appendChild(e);
    });
    return d;
  },

  hl(list) {
    const d = document.createElement('div');
    list.forEach(s => {
      const e = document.createElement('div'); e.className = 'entry';
      e.innerHTML = `<span class="entry-dot"></span><div class="entry-body">
        <div class="entry-title"><a href="${this.ea(s.u)}" target="_blank">${this.eh(s.t)}</a></div>
        <div class="entry-meta"><span>${s.p} points</span><span>${s.c} comments</span></div>
      </div>`;
      d.appendChild(e);
    });
    return d;
  },

  eh(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },
  ea(s) { return String(s).replace(/"/g, '&quot;'); },
  fmt(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n); }
};
