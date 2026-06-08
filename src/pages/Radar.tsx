import { useState, useEffect } from 'react'
import { _ } from '@/i18n'
import { Entry } from '@/components/shared/Entry'
import { GlassCard } from '@/components/shared/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

function GithubTab() {
  const { data, loading, error, retry } = useFetch<any>(
    'https://api.github.com/search/repositories?q=created:>2024-01-01&sort=stars&order=desc&per_page=10'
  )

  if (loading) return <LoadingItems />
  if (error) return <ErrorState retry={retry} />

  const items = (data?.items || []).map((r: any) => ({
    name: r.full_name,
    stars: r.stargazers_count,
    url: r.html_url,
    lang: r.language,
  }))

  return (
    <GlassCard>
      <h2 className="text-lg font-bold mb-2">{_('trending')}</h2>
      {items.map((item: any) => (
        <Entry
          key={item.name}
          icon="🔥"
          title={item.name}
          url={item.url}
          meta={`★ ${formatCount(item.stars)}${item.lang ? ' · ' + item.lang : ''}`}
        />
      ))}
    </GlassCard>
  )
}

function AITab() {
  const { data, loading, error, retry } = useFetch<any>(
    'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=10'
  )

  if (loading) return <LoadingItems />
  if (error) return <ErrorState retry={retry} />

  const items = (data || []).map((m: any) => ({
    name: m.modelId,
    downloads: m.downloads,
    task: m.pipeline_tag,
  }))

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

function HNTab() {
  const { data: items, loading, error, retry } = useHN()

  if (loading) return <LoadingItems />
  if (error) return <ErrorState retry={retry} />

  return (
    <GlassCard>
      <h2 className="text-lg font-bold mb-2">{_('hackernews')}</h2>
      {items.map((item: any) => (
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

function TechTab() {
  const { data: items, loading, error, retry } = useReddit()

  if (loading) return <LoadingItems />
  if (error) return <ErrorState retry={retry} />

  return (
    <GlassCard>
      <h2 className="text-lg font-bold mb-2">{_('techNews')}</h2>
      {items.map((item: any, i: number) => (
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
  return (
    <div className="space-y-5">
      <Tabs defaultValue="github">
        <TabsList className="glass mb-4">
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="ai">AI Models</TabsTrigger>
          <TabsTrigger value="hn">HN</TabsTrigger>
          <TabsTrigger value="tech">Tech News</TabsTrigger>
        </TabsList>
        <TabsContent value="github"><GithubTab /></TabsContent>
        <TabsContent value="ai"><AITab /></TabsContent>
        <TabsContent value="hn"><HNTab /></TabsContent>
        <TabsContent value="tech"><TechTab /></TabsContent>
      </Tabs>
    </div>
  )
}
