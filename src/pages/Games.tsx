import { useEffect, useState, useMemo, useCallback, KeyboardEvent, ChangeEvent } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlassCard } from '@/components/shared/GlassCard'
import { Entry } from '@/components/shared/Entry'
import { Skeleton } from '@/components/ui/skeleton'
import { _ } from '@/i18n'
import { storage } from '@/lib/storage'

// --- Types ---

interface SteamDealData {
  title: string
  salePrice: string
  normalPrice: string
  savings: string
  steamRatingPercent: string
  thumb: string
  steamAppID: string
  dealID: string
}

interface RedditChild {
  data: {
    title: string
    url: string
    score: number
    num_comments: number
    permalink: string
  }
}

// --- Wordle ---

const WORD_LIST = [
  'about', 'above', 'adult', 'after', 'again', 'agent', 'agree', 'ahead',
  'alive', 'alone', 'along', 'among', 'angel', 'anger', 'angle', 'apart',
  'apple', 'apply', 'arena', 'argue', 'arise', 'aside', 'asset', 'audio',
  'avoid', 'award', 'basic', 'beach', 'begin', 'being', 'below', 'bench',
  'birth', 'black', 'blade', 'blame', 'blank', 'blast', 'blaze', 'bleed',
  'blend', 'bless', 'blind', 'blink', 'block', 'blood', 'board', 'bonus',
  'boost', 'bound', 'brain', 'brand', 'brave', 'bread', 'break', 'breed',
  'brick', 'brief', 'broad', 'brown', 'brush', 'build', 'bunch', 'burst',
  'cabin', 'cable', 'candy', 'carry', 'catch', 'cause', 'chain', 'chair',
  'chaos', 'charm', 'chart', 'chase', 'cheap', 'check', 'cheer', 'chess',
  'chest', 'chief', 'child', 'china', 'civil', 'claim', 'class', 'clean',
  'clear', 'climb', 'clock', 'close', 'cloud', 'coach', 'coast', 'count',
  'court', 'cover', 'crack', 'craft', 'crash', 'crazy', 'cream', 'crime',
  'cross', 'crowd', 'crown', 'crush', 'curve', 'cycle', 'daily', 'dance',
  'debut', 'delay', 'delta', 'dense', 'depth', 'devil', 'digit', 'dirty',
  'doubt', 'dozen', 'draft', 'drain', 'drama', 'dream', 'dress', 'drink',
  'drive', 'early', 'earth', 'eight', 'elder', 'elect', 'elite', 'empty',
  'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'essay', 'event',
  'every', 'exact', 'exile', 'exist', 'extra', 'faint', 'faith', 'false',
  'fancy', 'fatal', 'fault', 'feast', 'fever', 'fiber', 'field', 'fifth',
  'fifty', 'fight', 'final', 'first', 'fixed', 'flame', 'flash', 'fleet',
  'flesh', 'float', 'flood', 'floor', 'fluid', 'flush', 'focus', 'force',
  'forge', 'forth', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh',
  'front', 'frost', 'fruit', 'fully', 'genre', 'ghost', 'giant', 'given',
  'glass', 'globe', 'gloom', 'glory', 'grace', 'grade', 'grain', 'grand',
  'grant', 'grape', 'grasp', 'grass', 'grave', 'great', 'green', 'greet',
  'grief', 'grill', 'grind', 'gross', 'group', 'grown', 'guard', 'guess',
  'guest', 'guide', 'guilt', 'happy', 'harsh', 'haven', 'heart', 'heavy',
  'hence', 'hobby', 'honor', 'horse', 'hotel', 'house', 'human', 'humor',
  'hurry', 'ideal', 'image', 'imply', 'index', 'indie', 'inner', 'input',
  'irony', 'ivory', 'jewel', 'joint', 'judge', 'juice', 'knack', 'kneel',
  'knock', 'known', 'label', 'labor', 'large', 'laser', 'later', 'laugh',
  'layer', 'learn', 'leash', 'least', 'leave', 'legal', 'lemon', 'level',
  'light', 'limit', 'linen', 'liver', 'local', 'logic', 'loose', 'lover',
  'lower', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'manor',
  'maple', 'march', 'marry', 'match', 'mayor', 'media', 'mercy', 'merge',
  'merit', 'merry', 'metal', 'meter', 'might', 'minor', 'minus', 'mixed',
  'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth',
  'movie', 'music', 'nerve', 'never', 'noble', 'noise', 'north', 'noted',
  'novel', 'nurse', 'nylon', 'occur', 'ocean', 'offer', 'often', 'olive',
  'onset', 'opera', 'orbit', 'order', 'other', 'outer', 'owner', 'oxide',
  'paint', 'panel', 'panic', 'paper', 'party', 'pasta', 'patch', 'pause',
  'peace', 'pearl', 'penny', 'phase', 'phone', 'photo', 'piano', 'piece',
  'pilot', 'pitch', 'pixel', 'place', 'plain', 'plane', 'plant', 'plate',
  'plaza', 'plead', 'pluck', 'plumb', 'plume', 'plush', 'point', 'polar',
  'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior',
  'prize', 'proof', 'proud', 'prove', 'pulse', 'punch', 'pupil', 'purse',
  'queen', 'quest', 'queue', 'quick', 'quiet', 'quite', 'quota', 'quote',
  'radar', 'radio', 'raise', 'rally', 'ranch', 'range', 'rapid', 'ratio',
  'reach', 'react', 'ready', 'realm', 'rebel', 'refer', 'reign', 'relax',
  'reply', 'rider', 'ridge', 'rifle', 'right', 'rigid', 'ripen', 'risen',
  'risky', 'rival', 'river', 'robin', 'robot', 'rocky', 'rouge', 'rough',
  'round', 'route', 'royal', 'rugby', 'ruler', 'rural', 'saint', 'salad',
  'salon', 'sauce', 'scale', 'scene', 'scope', 'score', 'scout', 'scrap',
  'sense', 'serve', 'setup', 'seven', 'shade', 'shaft', 'shake', 'shall',
  'shape', 'share', 'shark', 'sharp', 'sheep', 'sheet', 'shelf', 'shell',
  'shift', 'shine', 'shirt', 'shock', 'shore', 'short', 'shout', 'sight',
  'sigma', 'silly', 'since', 'sixth', 'sixty', 'skate', 'skill', 'skull',
  'slate', 'slave', 'sleep', 'slice', 'slide', 'slope', 'small', 'smart',
  'smell', 'smile', 'smoke', 'snack', 'snake', 'solid', 'solve', 'sorry',
  'sound', 'south', 'space', 'spare', 'spark', 'speak', 'speed', 'spell',
  'spend', 'spice', 'spill', 'spine', 'spite', 'split', 'sport', 'spray',
  'squad', 'stack', 'staff', 'stage', 'stain', 'stake', 'stale', 'stamp',
  'stand', 'stark', 'start', 'state', 'steak', 'steal', 'steam', 'steel',
  'steep', 'steer', 'stern', 'stick', 'stiff', 'still', 'stock', 'stone',
  'stood', 'store', 'storm', 'story', 'stove', 'stuff', 'style', 'sugar',
  'suite', 'sunny', 'super', 'surge', 'swamp', 'swear', 'sweep', 'sweet',
  'swift', 'swing', 'sword', 'table', 'taste', 'teeth', 'tempt', 'terse',
  'thank', 'theft', 'their', 'theme', 'there', 'thick', 'thief', 'thing',
  'think', 'third', 'thorn', 'those', 'three', 'throw', 'thumb', 'tiger',
  'tight', 'timer', 'title', 'toast', 'today', 'token', 'topic', 'total',
  'touch', 'tough', 'towel', 'tower', 'toxic', 'trace', 'track', 'trade',
  'trail', 'train', 'trait', 'trash', 'treat', 'trend', 'trial', 'tribe',
  'trick', 'tried', 'troop', 'truck', 'truly', 'trump', 'trunk', 'trust',
  'truth', 'tulip', 'tumor', 'twice', 'twist', 'uncle', 'under', 'union',
  'unite', 'unity', 'until', 'upper', 'upset', 'urban', 'usage', 'usual',
  'valid', 'value', 'vault', 'venue', 'verse', 'video', 'vigor', 'vinyl',
  'viola', 'virus', 'visit', 'vista', 'vital', 'vivid', 'vocal', 'vodka',
  'voice', 'voter', 'wagon', 'waist', 'watch', 'water', 'weary', 'weave',
  'wedge', 'weird', 'wheat', 'wheel', 'where', 'which', 'while', 'white',
  'whole', 'whose', 'widow', 'width', 'witch', 'woman', 'world', 'worry',
  'worse', 'worst', 'worth', 'would', 'wound', 'wrath', 'write', 'wrong',
  'wrote', 'yacht', 'yield', 'young', 'youth', 'zebra',
]

function getDailyWord(): string {
  const d = new Date()
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  return WORD_LIST[seed % WORD_LIST.length].toUpperCase()
}

function getLetterStatuses(guess: string, word: string): ('correct' | 'present' | 'miss')[] {
  return guess.split('').map((letter, i) => {
    if (letter === word[i]) return 'correct'
    if (word.includes(letter)) return 'present'
    return 'miss'
  })
}

interface WordleState {
  guesses: string[]
  currentGuess: string
  gameOver: boolean
  won: boolean
  message: string
}

function loadWordle(): WordleState {
  return {
    guesses: storage.get<string[]>('game_wordle_guesses', []),
    currentGuess: '',
    gameOver: storage.get<boolean>('game_wordle_over', false),
    won: storage.get<boolean>('game_wordle_won', false),
    message: '',
  }
}

function persistWordle(state: WordleState) {
  storage.set('game_wordle_guesses', state.guesses)
  storage.set('game_wordle_over', state.gameOver)
  storage.set('game_wordle_won', state.won)
}

function WordleGame() {
  const word = useMemo(() => getDailyWord(), [])
  const [state, setState] = useState<WordleState>(loadWordle)

  const save = useCallback((next: WordleState) => {
    setState(next)
    persistWordle(next)
  }, [])

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5)
    save({ ...state, currentGuess: val, message: '' })
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (state.gameOver) return
    if (e.key === 'Enter' && state.currentGuess.length === 5) {
      const guess = state.currentGuess
      if (!WORD_LIST.includes(guess.toLowerCase())) {
        save({ ...state, message: 'Word not in list!' })
        return
      }
      const newGuesses = [...state.guesses, guess]
      const won = guess === word
      const gameOver = won || newGuesses.length >= 6
      save({
        guesses: newGuesses,
        currentGuess: '',
        gameOver,
        won,
        message: '',
      })
    }
  }

  function reset() {
    save({
      guesses: [],
      currentGuess: '',
      gameOver: false,
      won: false,
      message: '',
    })
  }

  const remaining = 6 - state.guesses.length - (state.gameOver ? 0 : 1)

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="grid gap-1.5">
          {state.guesses.map((guess, i) => {
            const statuses = getLetterStatuses(guess, word)
            return (
              <div key={i} className="flex gap-1.5">
                {guess.split('').map((letter, j) => (
                  <div
                    key={j}
                    className={`w-10 h-10 flex items-center justify-center font-bold text-sm rounded ${
                      statuses[j] === 'correct'
                        ? 'bg-green-600 text-white'
                        : statuses[j] === 'present'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-[var(--surface-2)] text-[var(--text-2)]'
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            )
          })}
          {!state.gameOver && state.guesses.length < 6 && (
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 flex items-center justify-center font-bold text-sm rounded border-2 border-[var(--border)] text-[var(--text)]"
                >
                  {state.currentGuess[i] || ''}
                </div>
              ))}
            </div>
          )}
          {Array.from({ length: Math.max(0, remaining) }).map((_, i) => (
            <div key={`e-${i}`} className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className="w-10 h-10 flex items-center justify-center font-bold text-sm rounded border border-[var(--border)] text-[var(--text-3)]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {!state.gameOver && state.guesses.length < 6 && (
        <div className="flex justify-center">
          <input
            value={state.currentGuess}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            maxLength={5}
            className="w-32 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-center text-[var(--text)] uppercase outline-none focus:border-[var(--accent)] tracking-widest"
            placeholder={_('guess')}
            autoFocus
          />
        </div>
      )}

      {state.message && (
        <p className="text-center text-sm text-yellow-500">{state.message}</p>
      )}

      {state.gameOver && (
        <div className="text-center space-y-2">
          <p className={`text-sm font-semibold ${state.won ? 'text-green-500' : 'text-[var(--text-2)]'}`}>
            {state.won ? _('gotIt') : `${_('wordWas')} ${word.toLowerCase()}`}
          </p>
          <button
            onClick={reset}
            className="text-sm text-[var(--accent)] hover:underline cursor-pointer bg-none border-none"
          >
            {_('playAgain')}
          </button>
        </div>
      )}
    </div>
  )
}

// --- Movie Quiz ---

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Which movie won the Oscar for Best Picture in 2024?',
    options: ['Oppenheimer', 'Barbie', 'Killers of the Flower Moon', 'Poor Things'],
    correct: 0,
  },
  {
    question: 'Who directed "Pulp Fiction"?',
    options: ['Martin Scorsese', 'Quentin Tarantino', 'Steven Spielberg', 'David Fincher'],
    correct: 1,
  },
  {
    question: 'What is the highest-grossing film of all time (unadjusted for inflation)?',
    options: ['Avengers: Endgame', 'Avatar', 'Titanic', 'Star Wars: The Force Awakens'],
    correct: 1,
  },
  {
    question: 'Which actor played the Joker in "The Dark Knight"?',
    options: ['Jack Nicholson', 'Joaquin Phoenix', 'Heath Ledger', 'Jared Leto'],
    correct: 2,
  },
  {
    question: 'In which year was the first "Star Wars" film released?',
    options: ['1975', '1977', '1980', '1983'],
    correct: 1,
  },
]

function MovieQuiz() {
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  function handleAnswer(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === QUIZ_QUESTIONS[current].correct) {
      setScore(s => s + 1)
    }
  }

  function next() {
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  function reset() {
    setCurrent(0)
    setScore(0)
    setSelected(null)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className={`text-lg font-semibold ${
          score === QUIZ_QUESTIONS.length
            ? 'text-green-500'
            : score >= 3
              ? 'text-yellow-500'
              : 'text-[var(--text-2)]'
        }`}>
          {score === QUIZ_QUESTIONS.length ? _('perfect') : score >= 3 ? _('nice') : _('tryAgain')}
        </p>
        <p className="text-sm text-[var(--text-2)]">{_('score')} {score}/{QUIZ_QUESTIONS.length}</p>
        <button
          onClick={reset}
          className="text-sm text-[var(--accent)] hover:underline cursor-pointer bg-none border-none"
        >
          {_('playAgain')}
        </button>
      </div>
    )
  }

  const q = QUIZ_QUESTIONS[current]
  const answered = selected !== null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-3)] font-mono">{_('score')} {score}</span>
        <span className="text-xs text-[var(--text-3)] font-mono">Question {current + 1}/{QUIZ_QUESTIONS.length}</span>
      </div>

      <p className="text-sm text-[var(--text)] font-medium">{q.question}</p>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let btnClass =
            'w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 cursor-pointer '
          if (!answered) {
            btnClass +=
              'border-[var(--border)] text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--text)] bg-[var(--surface)]'
          } else if (i === q.correct) {
            btnClass += 'border-green-500 bg-green-500/10 text-green-500 font-medium'
          } else if (i === selected) {
            btnClass += 'border-red-500 bg-red-500/10 text-red-500'
          } else {
            btnClass += 'border-[var(--border)] text-[var(--text-3)] opacity-50'
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={btnClass}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="text-center">
          <button
            onClick={next}
            className="text-sm text-[var(--accent)] hover:underline cursor-pointer bg-none border-none"
          >
            {current < QUIZ_QUESTIONS.length - 1 ? 'Next →' : _('score')}
          </button>
        </div>
      )}
    </div>
  )
}

// --- Data Hooks ---

function useSteamDeals() {
  const [deals, setDeals] = useState<SteamDealData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    fetch('https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=10&sortBy=Savings&steamRating=60&pageNumber=1')
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => { if (!cancelled) { setDeals(data); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })

    return () => { cancelled = true }
  }, [])

  return { deals, loading, error }
}

function useRedditPosts(subreddit: string) {
  const [posts, setPosts] = useState<RedditChild['data'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`)
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(json => { if (!cancelled) { setPosts(json.data.children.map((c: RedditChild) => c.data)); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })

    return () => { cancelled = true }
  }, [subreddit])

  return { posts, loading, error }
}

// --- Sub-components ---

function SteamDealsSection() {
  const { deals, loading, error } = useSteamDeals()
  const [retryKey, setRetryKey] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  function handleImageError(id: string) {
    setFailedImages(prev => new Set(prev).add(id))
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <GlassCard key={i} className="p-0 overflow-hidden">
            <Skeleton className="aspect-[3/2] w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </GlassCard>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <GlassCard className="text-center py-8">
        <p className="text-[var(--text-2)] mb-3">{_('failed')}</p>
        <button
          onClick={() => setRetryKey(k => k + 1)}
          className="text-sm text-[var(--accent)] hover:underline cursor-pointer bg-none border-none"
        >
          {_('retry')}
        </button>
      </GlassCard>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {deals.map((deal) => {
        const appId = deal.steamAppID
        const imgSrc = appId
          ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_sm_120.jpg`
          : deal.thumb
        const savingsPct = Math.round(parseFloat(deal.savings))
        const dealId = deal.steamAppID || deal.title
        const showPlaceholder = !imgSrc || failedImages.has(dealId)

        return (
          <GlassCard key={dealId} className="p-0 overflow-hidden">
            <a
              href={`https://www.cheapshark.com/deal/${deal.dealID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {showPlaceholder ? (
                <div className="w-full h-32 bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-3)] text-xs">
                  🎮
                </div>
              ) : (
                <img
                  src={imgSrc}
                  alt={deal.title}
                  className="w-full aspect-[3/2] object-cover"
                  loading="lazy"
                  onError={() => handleImageError(dealId)}
                />
              )}
              <div className="p-3">
                <h3 className="text-sm font-medium text-[var(--text)] truncate">{deal.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-[var(--accent)]">${deal.salePrice}</span>
                  {deal.normalPrice !== deal.salePrice && (
                    <span className="text-xs text-[var(--text-3)] line-through">${deal.normalPrice}</span>
                  )}
                  <span className={`text-xs font-medium ${savingsPct > 50 ? 'text-green-400' : 'text-green-500'}`}>
                    -{savingsPct}%
                  </span>
                </div>
                {deal.steamRatingPercent && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] text-[var(--text-3)]">★ {deal.steamRatingPercent}%</span>
                  </div>
                )}
              </div>
            </a>
          </GlassCard>
        )
      })}
    </div>
  )
}

function RedditSection({ subreddit }: { subreddit: string }) {
  const { posts, loading, error } = useRedditPosts(subreddit)

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <Skeleton className="w-10 h-10 rounded shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <GlassCard className="text-center py-8">
        <p className="text-[var(--text-2)]">{_('failed')}</p>
      </GlassCard>
    )
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {posts.map((post, i) => (
        <Entry
          key={post.title + i}
          icon={i < 3 ? '🏆' : '🎮'}
          title={post.title}
          url={`https://reddit.com${post.permalink}`}
          meta={`▲ ${post.score}  ·  💬 ${post.num_comments}`}
        />
      ))}
    </div>
  )
}

// --- Main Page ---

export default function Games() {
  return (
    <div className="space-y-5">
      <Tabs defaultValue="deals">
        <TabsList>
          <TabsTrigger value="deals">Steam Deals</TabsTrigger>
          <TabsTrigger value="gaming">Gaming News</TabsTrigger>
          <TabsTrigger value="esports">eSports</TabsTrigger>
          <TabsTrigger value="wordle">{_('wordle')}</TabsTrigger>
          <TabsTrigger value="quiz">{_('movieQuiz')}</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="mt-4">
          <SteamDealsSection />
        </TabsContent>

        <TabsContent value="gaming" className="mt-4">
          <GlassCard>
            <RedditSection subreddit="gaming" />
          </GlassCard>
        </TabsContent>

        <TabsContent value="esports" className="mt-4">
          <GlassCard>
            <RedditSection subreddit="esports" />
          </GlassCard>
        </TabsContent>

        <TabsContent value="wordle" className="mt-4">
          <GlassCard>
            <WordleGame />
          </GlassCard>
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <GlassCard>
            <MovieQuiz />
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
