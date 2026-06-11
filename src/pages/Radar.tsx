import { useState, useEffect } from 'react'
import { _ } from '@/i18n'
import { Entry } from '@/components/shared/Entry'
import { GlassCard } from '@/components/shared/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [url, retryCount])

  return { data, loading, error, retry: () => setRetryCount(c => c + 1) }
}

function useHN() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(async (ids: number[]) => {
        const topIds = ids.slice(0, 15)
        const results = await Promise.all(
          topIds.map(id =>
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
          )
        )
        if (!cancelled) setItems(results)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [retryCount])

  return { data: items, loading, error, retry: () => setRetryCount(c => c + 1) }
}

function useReddit() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    Promise.all([
      fetch('https://www.reddit.com/r/artificial/hot.json?limit=5').then(r => r.json()),
      fetch('https://www.reddit.com/r/congnghe/hot.json?limit=5').then(r => r.json()),
    ])
      .then(([a, b]) => {
        const aChildren: any[] = (a as any).data?.children || []
        const bChildren: any[] = (b as any).data?.children || []
        const combined = [...aChildren, ...bChildren]
          .filter((x: any) => !x.data.stickied)
          .map((x: any) => x.data)
        if (!cancelled) setItems(combined)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [retryCount])

  return { data: items, loading, error, retry: () => setRetryCount(c => c + 1) }
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return String(n)
}

function LoadingItems() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded" />
      ))}
    </div>
  )
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="text-center py-12 text-[var(--text-2)]">
      {_('failed')} <button onClick={retry} className="text-[var(--accent)] ml-2 cursor-pointer">{_('retry')}</button>
    </div>
  )
}

const GITHUB_PERIODS = [
  { id: 'daily', label: 'Hôm nay', days: 1 },
  { id: 'weekly', label: 'Tuần', days: 7 },
  { id: 'monthly', label: 'Tháng', days: 30 },
  { id: 'yearly', label: 'Năm', days: 365 },
]

const GITHUB_TOPICS = [
  { id: '', label: 'Tất cả' },
  { id: 'ai', label: 'AI' },
  { id: 'game', label: 'Game' },
  { id: 'software', label: 'Phần mềm' },
  { id: 'hack', label: 'Hack' },
  { id: 'web', label: 'Web' },
  { id: 'data', label: 'Data' },
  { id: 'devops', label: 'DevOps' },
]

function GithubTab({ keyword }: { keyword: string }) {
  const [period, setPeriod] = useState('weekly')
  const [topic, setTopic] = useState('')
  const [page, setPage] = useState(1)
  const p = GITHUB_PERIODS.find(x => x.id === period) || GITHUB_PERIODS[1]
  const since = new Date(Date.now() - p.days * 86400000).toISOString().slice(0, 10)
  const q = `created:>${since}${topic ? ` topic:${topic}` : ''}`
  const { data, loading, error, retry } = useFetch<any>(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10&page=${page}`
  )

  useEffect(() => { setPage(1) }, [period, topic])

  if (loading) return <LoadingItems />
  if (error) return <ErrorState retry={retry} />

  const items = (data?.items || [])
    .map((r: any) => ({
      name: r.full_name,
      stars: r.stargazers_count,
      url: r.html_url,
      lang: r.language,
    }))
    .filter(item => !keyword || item.name.toLowerCase().includes(keyword.toLowerCase()))
  const total = data?.total_count || 0
  const totalPages = Math.min(Math.ceil(total / 10), 20)

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">{_('trending')}</h2>
        <div className="flex gap-1">
          {GITHUB_PERIODS.map(x => (
            <button
              key={x.id}
              onClick={() => setPeriod(x.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                period === x.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--text-2)]'
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {GITHUB_TOPICS.map(x => (
          <button
            key={x.id}
            onClick={() => setTopic(x.id)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
              topic === x.id
                ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                : 'text-[var(--text-3)] hover:text-[var(--text-2)]'
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>
      {items.map((item: any) => (
        <Entry
          key={item.name}
          icon="🔥"
          title={item.name}
          url={item.url}
          meta={`★ ${formatCount(item.stars)}${item.lang ? ' · ' + item.lang : ''}`}
        />
      ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-[var(--border)]">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded text-xs font-mono border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:cursor-default transition-all">←</button>
          <span className="text-xs text-[var(--text-3)] font-mono">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded text-xs font-mono border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:cursor-default transition-all">→</button>
        </div>
      )}
    </GlassCard>
  )
}

function AITab({ keyword }: { keyword: string }) {
  const { data, loading, error, retry } = useFetch<any>(
    'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=10'
  )

  if (loading) return <LoadingItems />
  if (error) return <ErrorState retry={retry} />

  const items = (data || [])
    .map((m: any) => ({
      name: m.modelId,
      downloads: m.downloads,
      task: m.pipeline_tag,
    }))
    .filter(item => !keyword || item.name.toLowerCase().includes(keyword.toLowerCase()))

  return (
    <GlassCard>
      <h2 className="text-lg font-bold mb-2">AI Models</h2>
      {items.map((item: any) => (
        <Entry
          key={item.name}
          icon="🤖"
          title={item.name}
          meta={`⬇ ${formatCount(item.downloads)}${item.task ? ' · ' + item.task : ''}`}
        />
      ))}
    </GlassCard>
  )
}

function HNTab({ keyword }: { keyword: string }) {
  const { data: items, loading, error, retry } = useHN()

  if (loading) return <LoadingItems />
  if (error) return <ErrorState retry={retry} />

  const filtered = items.filter(
    (item: any) => !keyword || item.title?.toLowerCase().includes(keyword.toLowerCase())
  )

  return (
    <GlassCard>
      <h2 className="text-lg font-bold mb-2">{_('hackernews')}</h2>
      {filtered.map((item: any) => (
        <Entry
          key={item.id}
          icon="📰"
          title={item.title}
          url={item.url}
          meta={`▲ ${item.score ?? 0} · by ${item.by ?? 'unknown'}`}
        />
      ))}
    </GlassCard>
  )
}

function TechTab({ keyword }: { keyword: string }) {
  const { data: items, loading, error, retry } = useReddit()

  if (loading) return <LoadingItems />
  if (error) return <ErrorState retry={retry} />

  const filtered = items.filter(
    (item: any) => !keyword || item.title?.toLowerCase().includes(keyword.toLowerCase())
  )

  return (
    <GlassCard>
      <h2 className="text-lg font-bold mb-2">{_('techNews')}</h2>
      {filtered.map((item: any, i: number) => (
        <Entry
          key={item.url || item.title || i}
          icon="📡"
          title={item.title}
          url={`https://reddit.com${item.permalink}`}
          meta={`▲ ${item.score ?? 0}`}
        />
      ))}
    </GlassCard>
  )
}

export default function Radar() {
  const [keyword, setKeyword] = useState('')

  return (
    <div className="space-y-5">
      <Input
        placeholder={_('searchPlaceholder')}
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />
      <Tabs defaultValue="github">
        <TabsList className="glass mb-4">
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="ai">AI Models</TabsTrigger>
          <TabsTrigger value="hn">HN</TabsTrigger>
          <TabsTrigger value="tech">Tech News</TabsTrigger>
        </TabsList>
        <TabsContent value="github"><GithubTab keyword={keyword} /></TabsContent>
        <TabsContent value="ai"><AITab keyword={keyword} /></TabsContent>
        <TabsContent value="hn"><HNTab keyword={keyword} /></TabsContent>
        <TabsContent value="tech"><TechTab keyword={keyword} /></TabsContent>
      </Tabs>
    </div>
  )
}
