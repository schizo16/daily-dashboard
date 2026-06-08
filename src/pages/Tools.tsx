import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/shared/GlassCard'
import { _ } from '@/i18n'
import { Button } from '@/components/ui/button'

const tools = [
  { id: 'qr', icon: '📱', name: 'QR Code', desc: 'Generate QR codes' },
  { id: 'password', icon: '🔐', name: 'Password', desc: 'Generate strong passwords' },
  { id: 'counter', icon: '🔢', name: 'Text Counter', desc: 'Count words, chars & lines' },
  { id: 'random', icon: '🎲', name: 'Random', desc: 'Generate random numbers' },
  { id: 'base64', icon: '🔡', name: 'Base64', desc: 'Encode & decode Base64' },
  { id: 'json', icon: '📋', name: 'JSON', desc: 'Format & minify JSON' },
  { id: 'typing', icon: '⌨️', name: 'Typing Test', desc: 'Test typing speed' },
  { id: 'color', icon: '🎨', name: 'Color', desc: 'Convert color formats' },
]

export default function Tools() {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      {!activeTool ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        >
          <div className="grid grid-cols-2 gap-3">
            {tools.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 200, damping: 24 }}
              >
                <button
                  onClick={() => setActiveTool(t.id)}
                  className="glass rounded-[var(--radius)] p-4 text-left w-full transition-all duration-300 hover:bg-[var(--surface-2)]/80 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                >
                  <div className="text-lg mb-1">{t.icon}</div>
                  <div className="text-sm font-semibold text-[var(--text)]">{t.name}</div>
                  <div className="font-mono text-xs text-[var(--text-2)]">{t.desc}</div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        >
          <button
            onClick={() => setActiveTool(null)}
            className="font-mono text-xs text-[var(--text-3)] hover:text-[var(--text)] transition-colors mb-4 cursor-pointer bg-none border-none"
          >
            ← Back
          </button>
          <GlassCard>
            {activeTool === 'qr' && <QRUI />}
            {activeTool === 'password' && <PasswordUI />}
            {activeTool === 'counter' && <TextCounterUI />}
            {activeTool === 'random' && <RandomUI />}
            {activeTool === 'base64' && <Base64UI />}
            {activeTool === 'json' && <JSONUI />}
            {activeTool === 'typing' && <TypingUI />}
            {activeTool === 'color' && <ColorUI />}
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}

function QRUI() {
  const [qrValue, setQrValue] = useState('')
  const [qrSrc, setQrSrc] = useState('')

  function generate() {
    if (qrValue.trim()) {
      setQrSrc(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}`)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text)]">QR Code</h3>
      <div className="flex gap-2">
        <input
          value={qrValue}
          onChange={e => setQrValue(e.target.value)}
          placeholder="Enter text or URL..."
          className="flex-1 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
          onKeyDown={e => { if (e.key === 'Enter') generate() }}
        />
        <Button onClick={generate}>Generate</Button>
      </div>
      {qrSrc && (
        <div className="flex justify-center pt-2">
          <img src={qrSrc} alt="QR Code" className="w-48 h-48" />
        </div>
      )}
    </div>
  )
}

function PasswordUI() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [useUpper, setUseUpper] = useState(true)
  const [useLower, setUseLower] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSpecial, setUseSpecial] = useState(true)
  const [copied, setCopied] = useState(false)

  function generate() {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    let chars = ''
    if (useUpper) chars += upper
    if (useLower) chars += lower
    if (useNumbers) chars += numbers
    if (useSpecial) chars += special
    if (!chars) return
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    setPassword(result)
    setCopied(false)
  }

  async function copy() {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text)]">Password</h3>
      <div className="flex gap-2">
        <input
          value={password}
          readOnly
          placeholder="Click Generate..."
          className="flex-1 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-mono text-[var(--text)] outline-none"
        />
        <Button onClick={copy}>{copied ? 'Copied!' : 'Copy'}</Button>
        <Button onClick={generate}>Generate</Button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-2)]">Length: {length}</span>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={e => setLength(Number(e.target.value))}
            className="flex-1 accent-[var(--accent)]"
          />
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-[var(--text-2)]">
          {[
            { label: 'A-Z', value: useUpper, set: setUseUpper },
            { label: 'a-z', value: useLower, set: setUseLower },
            { label: '0-9', value: useNumbers, set: setUseNumbers },
            { label: '!@#$%', value: useSpecial, set: setUseSpecial },
          ].map(c => (
            <label key={c.label} className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--text)] transition-colors">
              <input type="checkbox" checked={c.value} onChange={() => c.set(!c.value)} className="accent-[var(--accent)]" />
              {c.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function TextCounterUI() {
  const [text, setText] = useState('')
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length
  const lines = text ? text.split('\n').length : 0

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text)]">Text Counter</h3>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type or paste text here..."
        rows={6}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] resize-y font-mono"
      />
      <div className="flex gap-5 text-sm">
        <div><span className="text-[var(--accent)] font-semibold">{words}</span> <span className="text-[var(--text-2)]">words</span></div>
        <div><span className="text-[var(--accent)] font-semibold">{chars}</span> <span className="text-[var(--text-2)]">chars</span></div>
        <div><span className="text-[var(--accent)] font-semibold">{lines}</span> <span className="text-[var(--text-2)]">lines</span></div>
      </div>
    </div>
  )
}

function RandomUI() {
  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [result, setResult] = useState<number | null>(null)

  function roll() {
    const mn = parseInt(min, 10)
    const mx = parseInt(max, 10)
    if (isNaN(mn) || isNaN(mx)) return
    const lo = Math.min(mn, mx)
    const hi = Math.max(mn, mx)
    setResult(Math.floor(Math.random() * (hi - lo + 1)) + lo)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text)]">Random Number</h3>
      <div className="flex gap-3 items-end">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-2)]">Min</span>
          <input
            type="number"
            value={min}
            onChange={e => setMin(e.target.value)}
            className="w-20 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-2)]">Max</span>
          <input
            type="number"
            value={max}
            onChange={e => setMax(e.target.value)}
            className="w-20 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <Button onClick={roll}>Roll</Button>
      </div>
      {result !== null && (
        <div className="text-center py-4">
          <span className="text-3xl font-bold text-[var(--accent)]">{result}</span>
        </div>
      )}
    </div>
  )
}

function Base64UI() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  function encode() {
    try { setOutput(btoa(input)) } catch { setOutput('Error: Invalid input') }
  }

  function decode() {
    try { setOutput(atob(input)) } catch { setOutput('Error: Invalid Base64 string') }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text)]">Base64</h3>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Input..."
        rows={4}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] resize-y font-mono"
      />
      <div className="flex gap-2">
        <Button onClick={encode}>Encode →</Button>
        <Button onClick={decode}>← Decode</Button>
      </div>
      <textarea
        value={output}
        readOnly
        placeholder="Output..."
        rows={4}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none resize-y font-mono"
      />
    </div>
  )
}

function JSONUI() {
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')

  function format() {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed, null, 2))
      setJsonError('')
    } catch (e) {
      setJsonError(String(e))
    }
  }

  function minify() {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonInput(JSON.stringify(parsed))
      setJsonError('')
    } catch (e) {
      setJsonError(String(e))
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text)]">JSON Formatter</h3>
      <textarea
        value={jsonInput}
        onChange={e => { setJsonInput(e.target.value); setJsonError('') }}
        placeholder="Paste JSON here..."
        rows={8}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] resize-y font-mono"
      />
      <div className="flex gap-2">
        <Button onClick={format}>Format</Button>
        <Button onClick={minify}>Minify</Button>
      </div>
      {jsonError && (
        <div className="text-red-400 text-xs font-mono bg-red-400/10 rounded p-2.5 border border-red-400/20 leading-relaxed">
          {jsonError}
        </div>
      )}
    </div>
  )
}

const TYPING_TEXTS = [
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.',
  'Programming is the art of telling another human being what one wants the computer to do. Good code is its own best documentation.',
  'The sun set behind the mountains, painting the sky in shades of orange and pink. A gentle breeze carried the scent of pine through the valley.',
]

function TypingUI() {
  const [target, setTarget] = useState(TYPING_TEXTS[0])
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    const now = Date.now()
    let st = startTime
    if (!st && val.length > 0) {
      st = now
      setStartTime(now)
    }
    setTyped(val)
    if (val.length >= target.length && st) {
      const elapsed = (now - st) / 1000 / 60
      if (elapsed > 0) {
        setWpm(Math.round(target.split(/\s+/).length / elapsed))
        setDone(true)
      }
    }
  }

  function newText() {
    const next = TYPING_TEXTS.filter(t => t !== target)
    setTarget(next[Math.floor(Math.random() * next.length)])
    setTyped('')
    setStartTime(null)
    setWpm(null)
    setDone(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-[var(--text)]">Typing Test</h3>
        <Button variant="outline" size="sm" onClick={newText}>New Text</Button>
      </div>
      <div className="p-3 rounded border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-2)] leading-relaxed font-mono">
        {target.split('').map((ch, i) => {
          let className = ''
          if (i < typed.length) {
            className = typed[i] === ch ? 'text-green-400' : 'text-red-400'
          }
          return <span key={i} className={className}>{ch}</span>
        })}
      </div>
      {!done ? (
        <textarea
          value={typed}
          onChange={handleChange}
          placeholder="Start typing here..."
          rows={4}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] resize-none font-mono"
        />
      ) : (
        <div className="text-center py-6 space-y-3">
          <div className="text-3xl font-bold text-[var(--accent)]">{wpm} WPM</div>
          <Button variant="outline" size="sm" onClick={newText}>{_('tryAgain')}</Button>
        </div>
      )}
    </div>
  )
}

function ColorUI() {
  const [hex, setHex] = useState('#0071e3')
  const [convertedHex, setConvertedHex] = useState('')
  const [rgb, setRgb] = useState('')

  function convert() {
    let h = hex.trim()
    if (!h.startsWith('#')) h = '#' + h
    if (/^#[0-9a-fA-F]{3}$/.test(h)) {
      h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
    }
    if (/^#[0-9a-fA-F]{6}$/.test(h)) {
      const r = parseInt(h.slice(1, 3), 16)
      const g = parseInt(h.slice(3, 5), 16)
      const b = parseInt(h.slice(5, 7), 16)
      setRgb(`rgb(${r}, ${g}, ${b})`)
      setConvertedHex(h.toUpperCase())
    } else {
      setRgb('Invalid HEX color')
      setConvertedHex('')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text)]">Color Converter</h3>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={convertedHex || hex}
          onChange={e => { setHex(e.target.value); setConvertedHex(''); setRgb('') }}
          className="w-10 h-10 rounded cursor-pointer border border-[var(--border)]"
        />
        <input
          value={hex}
          onChange={e => setHex(e.target.value)}
          placeholder="#000000"
          className="flex-1 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-mono text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
          onKeyDown={e => { if (e.key === 'Enter') convert() }}
        />
        <Button onClick={convert}>Convert</Button>
      </div>
      {convertedHex && (
        <div className="flex items-center gap-4 pt-1">
          <div className="w-14 h-14 rounded border border-[var(--border)] shrink-0" style={{ backgroundColor: convertedHex }} />
          <div className="text-sm font-mono space-y-1">
            <div><span className="text-[var(--text-2)]">HEX: </span><span className="text-[var(--text)]">{convertedHex}</span></div>
            <div><span className="text-[var(--text-2)]">RGB: </span><span className="text-[var(--text)]">{rgb}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
