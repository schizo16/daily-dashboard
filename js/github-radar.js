const AiRadar = {
  _c: null, _page: 1, _period: 'week',

  async load(c) {
    this._c = c;
    this._page = 1;
    this._period = 'week';
    await this.loadAll();
  },

  async loadAll() {
    const c = this._c;
    c.innerHTML = `<div class="loading">${_('loading')}</div>`;
    try {
      const [repos, models, stories] = await Promise.all([
        this.repos(this._period, this._page),
        this.models(),
        this.hn()
      ]);
      c.innerHTML = '';
      c.appendChild(this.box('GitHub Trending', 'github.com/trending', this.repoControls(), this.rl(repos)));
      c.appendChild(this.box('AI Models', 'huggingface.co/models', null, this.ml(models)));
      c.appendChild(this.box('HackerNews', 'news.ycombinator.com', null, this.hl(stories)));
    } catch (e) {
      c.innerHTML = `<div class="loading error">${_('failed')} <button class="btn" onclick="AiRadar.load(this._c)">${_('retry')}</button></div>`;
    }
  },

  repoControls() {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:4px;margin-bottom:12px';
    ['week', 'month', 'year'].forEach(p => {
      const b = document.createElement('button');
      b.textContent = p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm';
      b.style.cssText = `padding:3px 10px;border:1px solid var(--border);border-radius:4px;background:${p === this._period ? 'var(--accent)' : 'transparent'};color:${p === this._period ? 'var(--bg)' : 'var(--text-2)'};cursor:pointer;font-family:JetBrains Mono,monospace;font-size:0.6rem`;
      b.onclick = async () => {
        this._period = p; this._page = 1;
        await this.loadAll();
      };
      div.appendChild(b);
    });
    return div;
  },

  box(t, l, controls, el) {
    const d = document.createElement('div'); d.className = 'card';
    d.innerHTML = `<div class="section-h"><h2>${t}</h2><a href="https://${l}" target="_blank">${l} ↗</a></div>`;
    if (controls) d.insertBefore(controls, d.querySelector('.section-h').nextSibling);
    d.appendChild(el);
    return d;
  },

  async repos(period, page) {
    const d = new Date();
    if (period === 'week') d.setDate(d.getDate() - 7);
    else if (period === 'month') d.setMonth(d.getMonth() - 1);
    else d.setFullYear(d.getFullYear() - 1);
    const r = await fetch(`https://api.github.com/search/repositories?q=created:>${d.toISOString().split('T')[0]}&sort=stars&order=desc&per_page=8&page=${page}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!r.ok) throw new Error(_('githubError'));
    return (await r.json()).items.map(x => ({
      n: x.full_name, u: x.html_url, d: x.description || '', a: x.owner?.avatar_url || '',
      s: x.stargazers_count, f: x.forks_count, l: x.language
    }));
  },

  async models() {
    const r = await fetch('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=10');
    if (!r.ok) return [];
    const data = await r.json();
    return data.map(m => ({
      n: m.id, u: `https://huggingface.co/${m.id}`,
      d: (m.pipeline_tag || '') + (m.library_name ? ' · ' + m.library_name : ''),
      s: m.likes || 0, f: m.downloads || 0
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
    list.forEach((r, i) => {
      const e = document.createElement('div'); e.className = 'entry';
      e.style.animation = 'slideDown 0.3s ease-out both'; e.style.animationDelay = `${i * 0.025}s`;
      const thumb = r.a ? `<div class="entry-thumb"><img src="${this.ea(r.a)}" alt="" loading="lazy"></div>` : '<div class="entry-thumb">📦</div>';
      e.innerHTML = `${thumb}<div class="entry-body">
        <div class="entry-title"><a href="${this.ea(r.u)}" target="_blank">${this.eh(r.n)}</a></div>
        ${r.d ? `<div class="entry-desc">${this.eh(r.d)}</div>` : ''}
        <div class="entry-meta">${r.l ? `<span>${this.eh(r.l)}</span>` : ''}<span>⭐ ${this.fmt(r.s)}</span><span>⑂ ${this.fmt(r.f)}</span></div>
      </div>`;
      d.appendChild(e);
    });
    return d;
  },

  ml(list) {
    const d = document.createElement('div');
    list.forEach((m, i) => {
      const e = document.createElement('div'); e.className = 'entry';
      e.style.animation = 'slideDown 0.3s ease-out both'; e.style.animationDelay = `${i * 0.025}s`;
      e.innerHTML = `<div class="entry-thumb">🤖</div><div class="entry-body">
        <div class="entry-title"><a href="${this.ea(m.u)}" target="_blank">${this.eh(m.n)}</a></div>
        ${m.d ? `<div class="entry-desc">${this.eh(m.d)}</div>` : ''}
        <div class="entry-meta"><span>❤️ ${this.fmt(m.s)}</span><span>📥 ${this.fmt(m.f)}</span></div>
      </div>`;
      d.appendChild(e);
    });
    return d;
  },

  hl(list) {
    const d = document.createElement('div');
    list.forEach((s, i) => {
      const e = document.createElement('div'); e.className = 'entry';
      e.style.animation = 'slideDown 0.3s ease-out both'; e.style.animationDelay = `${i * 0.025}s`;
      e.innerHTML = `<div class="entry-thumb">📰</div><div class="entry-body">
        <div class="entry-title"><a href="${this.ea(s.u)}" target="_blank">${this.eh(s.t)}</a></div>
        <div class="entry-meta"><span>${s.p} points</span><span>${s.c} comments</span></div>
      </div>`;
      d.appendChild(e);
    });
    return d;
  },

  eh(s) { return esc(s); },
  ea(s) { return String(s).replace(/"/g, '&quot;'); },
  fmt(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n); }
};
