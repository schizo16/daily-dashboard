/* ─── Tools ─── */
const ToolsPage = {
  _current: null,
  load(c) {
    this._c = c;
    this.showGrid();
  },

  showGrid() {
    this._c.innerHTML = `
      <div class="card">
        <div class="section-h"><h2>🧰 Tools</h2></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${this.tile('qr', 'QR Code', 'Generate QR codes from URLs or text')}
          ${this.tile('pw', 'Password', 'Secure random password generator')}
          ${this.tile('counter', 'Text Count', 'Count words, chars, lines')}
          ${this.tile('random', 'Random', 'Random numbers & dice rolls')}
          ${this.tile('base64', 'Base64', 'Encode / decode Base64')}
          ${this.tile('json', 'JSON', 'Format and validate JSON')}
          ${this.tile('typing', 'Typing', 'Test your typing speed')}
          ${this.tile('color', 'Color', 'HEX / RGB color converter')}
        </div>
      </div>`;
    this._c.querySelectorAll('.tool-tile').forEach(t => {
      t.onclick = () => this.showTool(t.dataset.tool);
    });
  },

  tile(id, title, desc) {
    return `<div class="tool-tile" data-tool="${id}" style="padding:14px;border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='var(--border-2)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="font-size:0.85rem;font-weight:600;margin-bottom:3px">${title}</div>
      <div style="font-size:0.7rem;color:var(--text-2)">${desc}</div>
    </div>`;
  },

  showTool(tool) {
    const fns = {
      qr: () => this.qrUI(),
      pw: () => this.pwUI(),
      counter: () => this.counterUI(),
      random: () => this.randomUI(),
      base64: () => this.b64UI(),
      json: () => this.jsonUI(),
      typing: () => this.typingUI(),
      color: () => this.colorUI(),
    };
    (fns[tool] || (() => this.showGrid()))();
  },

  backBtn() {
    return `<div style="margin-bottom:12px"><button class="btn" onclick="ToolsPage.showGrid()">← Back</button></div>`;
  },

  /* QR */
  qrUI() {
    this._c.innerHTML = this.backBtn() + `<div class="card"><div class="section-h"><h2>QR Code</h2></div>
      <div style="display:flex;gap:8px"><input type="text" id="t-qr" class="w-inp" style="flex:1;text-transform:none;text-align:left;width:auto" placeholder="URL or text..."><button class="btn btn-primary" id="t-qr-btn">Generate</button></div>
      <div id="t-qr-out" style="margin-top:12px;text-align:center;min-height:100px"></div></div>`;
    document.getElementById('t-qr-btn').onclick = () => {
      const v = document.getElementById('t-qr').value.trim();
      if (!v) return;
      document.getElementById('t-qr-out').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(v)}" alt="" style="width:160px;height:160px;border-radius:6px">`;
    };
  },

  /* Password */
  pwUI() {
    this._c.innerHTML = this.backBtn() + `<div class="card"><div class="section-h"><h2>Password Generator</h2></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <input type="text" id="t-pw" class="w-inp" style="flex:1;text-transform:none;text-align:left;min-width:180px;font-family:JetBrains Mono,monospace" readonly>
        <button class="btn btn-primary" id="t-pw-btn">Generate</button>
        <label style="font-family:JetBrains Mono,monospace;font-size:0.65rem;color:var(--text-2);display:flex;align-items:center;gap:4px">
          <input type="number" id="t-pw-len" value="16" min="4" max="64" style="width:50px;border:1px solid var(--border);border-radius:4px;padding:2px 6px;background:var(--surface);color:var(--text);font-family:JetBrains Mono,monospace;font-size:0.7rem"> chars
        </label>
      </div>
      <button class="btn" id="t-pw-copy">📋 Copy</button></div>`;
    const gen = () => {
      const len = Number(document.getElementById('t-pw-len').value) || 16;
      const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let p = '';
      for (let i = 0; i < len; i++) p += c[Math.floor(Math.random() * c.length)];
      document.getElementById('t-pw').value = p;
    };
    document.getElementById('t-pw-btn').onclick = gen;
    document.getElementById('t-pw-copy').onclick = () => {
      document.getElementById('t-pw').select(); document.execCommand('copy');
      const b = document.getElementById('t-pw-copy'); b.textContent = '✓ Copied';
      setTimeout(() => { b.textContent = '📋 Copy'; }, 2000);
    };
    gen();
  },

  /* Text Counter */
  counterUI() {
    this._c.innerHTML = this.backBtn() + `<div class="card"><div class="section-h"><h2>Text Counter</h2></div>
      <textarea id="t-tc" class="notes-area" style="font-family:inherit;font-size:0.88rem" rows="6" placeholder="Type or paste text..."></textarea>
      <div id="t-tc-out" style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--text-2);margin-top:6px"></div></div>`;
    const up = () => {
      const t = document.getElementById('t-tc').value;
      document.getElementById('t-tc-out').textContent = `${t.trim() ? t.trim().split(/\s+/).length : 0} words · ${t.length} chars · ${t ? t.split('\n').length : 0} lines`;
    };
    document.getElementById('t-tc').oninput = up; up();
  },

  /* Random */
  randomUI() {
    this._c.innerHTML = this.backBtn() + `<div class="card"><div class="section-h"><h2>Random Number</h2></div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <label style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--text-2)">Min <input type="number" id="t-r-min" value="1" style="width:60px;border:1px solid var(--border);border-radius:4px;padding:4px 6px;background:var(--surface);color:var(--text);font-family:JetBrains Mono,monospace;font-size:0.8rem"></label>
        <label style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--text-2)">Max <input type="number" id="t-r-max" value="100" style="width:60px;border:1px solid var(--border);border-radius:4px;padding:4px 6px;background:var(--surface);color:var(--text);font-family:JetBrains Mono,monospace;font-size:0.8rem"></label>
        <button class="btn btn-primary" id="t-r-btn">Roll</button>
      </div>
      <div id="t-r-out" style="font-size:2.5rem;font-weight:700;text-align:center;padding:16px 0;font-family:JetBrains Mono,monospace">—</div></div>`;
    document.getElementById('t-r-btn').onclick = () => {
      const min = Number(document.getElementById('t-r-min').value) || 1;
      const max = Number(document.getElementById('t-r-max').value) || 100;
      document.getElementById('t-r-out').textContent = Math.floor(Math.random() * (max - min + 1)) + min;
    };
  },

  /* Base64 */
  b64UI() {
    this._c.innerHTML = this.backBtn() + `<div class="card"><div class="section-h"><h2>Base64</h2></div>
      <div style="display:flex;gap:4px;margin-bottom:8px">
        <button class="btn btn-primary" id="t-b64-enc">Encode →</button>
        <button class="btn" id="t-b64-dec">← Decode</button>
      </div>
      <textarea id="t-b64-in" class="notes-area" style="font-family:JetBrains Mono,monospace;font-size:0.78rem" rows="4" placeholder="Input..."></textarea>
      <textarea id="t-b64-out" class="notes-area" style="font-family:JetBrains Mono,monospace;font-size:0.78rem" rows="4" placeholder="Output..." readonly></textarea></div>`;
    document.getElementById('t-b64-enc').onclick = () => {
      try { document.getElementById('t-b64-out').value = btoa(document.getElementById('t-b64-in').value); }
      catch { document.getElementById('t-b64-out').value = 'Error: invalid input'; }
    };
    document.getElementById('t-b64-dec').onclick = () => {
      try { document.getElementById('t-b64-out').value = atob(document.getElementById('t-b64-in').value); }
      catch { document.getElementById('t-b64-out').value = 'Error: invalid Base64'; }
    };
  },

  /* JSON */
  jsonUI() {
    this._c.innerHTML = this.backBtn() + `<div class="card"><div class="section-h"><h2>JSON Formatter</h2></div>
      <textarea id="t-json" class="notes-area" style="font-family:JetBrains Mono,monospace;font-size:0.78rem" rows="8" placeholder="Paste JSON..."></textarea>
      <div style="display:flex;gap:4px;margin-top:6px">
        <button class="btn btn-primary" id="t-json-fmt">Format</button>
        <button class="btn" id="t-json-min">Minify</button>
      </div>
      <div id="t-json-err" style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:#a33;margin-top:4px"></div></div>`;
    const fmt = (minify) => {
      try {
        const obj = JSON.parse(document.getElementById('t-json').value);
        document.getElementById('t-json').value = JSON.stringify(obj, null, minify ? 0 : 2);
        document.getElementById('t-json-err').textContent = '';
      } catch (e) {
        document.getElementById('t-json-err').textContent = 'Error: ' + e.message;
      }
    };
    document.getElementById('t-json-fmt').onclick = () => fmt(false);
    document.getElementById('t-json-min').onclick = () => fmt(true);
  },

  /* Typing Test */
  typingUI() {
    const texts = [
      'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.',
      'Technology is best when it brings people together. The advance of technology is based on making it fit in so that you do not really even notice it.',
      'In the middle of difficulty lies opportunity. The only way to do great work is to love what you do. Stay hungry, stay foolish.',
    ];
    this._c.innerHTML = this.backBtn() + `<div class="card"><div class="section-h"><h2>Typing Test</h2></div>
      <div id="t-typing-text" style="font-size:0.9rem;line-height:1.6;margin-bottom:12px;padding:12px;background:var(--surface-2);border-radius:6px;font-family:JetBrains Mono,monospace"></div>
      <textarea id="t-typing-in" class="notes-area" style="font-family:JetBrains Mono,monospace;font-size:0.85rem" rows="3" placeholder="Type here..."></textarea>
      <div style="display:flex;gap:8px;margin-top:6px;align-items:center;flex-wrap:wrap">
        <button class="btn" id="t-typing-new">New Text</button>
        <span id="t-typing-stats" style="font-family:JetBrains Mono,monospace;font-size:0.7rem;color:var(--text-2)"></span>
      </div></div>`;
    let startTime = null, target = '';
    const display = document.getElementById('t-typing-text');
    const input = document.getElementById('t-typing-in');
    const stats = document.getElementById('t-typing-stats');

    const newText = () => {
      target = texts[Math.floor(Math.random() * texts.length)];
      display.textContent = target;
      input.value = ''; stats.textContent = '';
      startTime = null;
    };
    newText();

    input.oninput = () => {
      if (!startTime && input.value.length === 1) startTime = Date.now();
      if (input.value === target) {
        const ms = (Date.now() - startTime) / 1000;
        const wpm = Math.round((target.split(' ').length / ms) * 60);
        stats.textContent = `✅ Done! ${wpm} WPM`;
        input.disabled = true;
        setTimeout(() => { input.disabled = false; newText(); }, 2000);
      } else {
        const correct = target.startsWith(input.value);
        stats.textContent = correct ? `${input.value.length}/${target.length}` : '❌ Wrong key';
        if (!correct) stats.style.color = '#a33';
        else stats.style.color = '';
      }
    };
    document.getElementById('t-typing-new').onclick = newText;
  },

  /* Color Converter */
  colorUI() {
    this._c.innerHTML = this.backBtn() + `<div class="card"><div class="section-h"><h2>Color Converter</h2></div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
        <input type="text" id="t-color-in" class="w-inp" style="flex:1;text-transform:none;text-align:left;width:auto" placeholder="#ff0000 or rgb(255,0,0)" value="#2563eb">
        <button class="btn btn-primary" id="t-color-btn">Convert</button>
        <input type="color" id="t-color-picker" value="#2563eb" style="width:40px;height:36px;border:1px solid var(--border);border-radius:4px;cursor:pointer;background:none">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-family:JetBrains Mono,monospace;font-size:0.75rem">
        <div style="padding:8px;border:1px solid var(--border);border-radius:4px">HEX: <span id="t-color-hex">#2563eb</span></div>
        <div style="padding:8px;border:1px solid var(--border);border-radius:4px">RGB: <span id="t-color-rgb">rgb(37,99,235)</span></div>
      </div>
      <div id="t-color-preview" style="margin-top:8px;height:60px;border-radius:6px;background:#2563eb"></div></div>`;
    const convert = (val) => {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = val;
      const c = ctx.fillStyle;
      const preview = document.getElementById('t-color-preview');
      if (c) {
        preview.style.background = c;
        document.getElementById('t-color-hex').textContent = c;
        // Parse to RGB
        const div = document.createElement('div');
        div.style.color = c;
        document.body.appendChild(div);
        const cs = getComputedStyle(div).color;
        document.body.removeChild(div);
        document.getElementById('t-color-rgb').textContent = cs;
      }
    };
    document.getElementById('t-color-btn').onclick = () => convert(document.getElementById('t-color-in').value);
    document.getElementById('t-color-picker').oninput = () => {
      document.getElementById('t-color-in').value = document.getElementById('t-color-picker').value;
      convert(document.getElementById('t-color-picker').value);
    };
    convert('#2563eb');
  }
};