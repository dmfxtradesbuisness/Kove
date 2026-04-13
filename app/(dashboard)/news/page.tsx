'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, ExternalLink, RefreshCw, Newspaper, Settings } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Article {
  id: string
  title: string
  summary: string | null
  url: string
  source: string | null
  category: string
  tickers: string[]
  image_url: string | null
  published_at: string | null
  created_at: string
}

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORY_CFG: Record<string, { label: string; text: string; bg: string; border: string; dot: string }> = {
  forex:   { label: 'Forex',   text: '#a78bfa', bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.22)',  dot: '#7B6CF5' },
  crypto:  { label: 'Crypto',  text: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.22)',  dot: '#fbbf24' },
  markets: { label: 'Markets', text: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.22)',  dot: '#34d399' },
  global:  { label: 'Global',  text: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.22)',  dot: '#60a5fa' },
  general: { label: 'General', text: '#888888', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)', dot: '#555' },
}

const FILTER_TABS = [
  { key: 'all',     label: 'All' },
  { key: 'forex',   label: 'Forex' },
  { key: 'crypto',  label: 'Crypto' },
  { key: 'markets', label: 'Markets' },
  { key: 'global',  label: 'Global' },
]

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

// ─── Utils ────────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [articles, setArticles]     = useState<Article[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter]         = useState('all')
  const [configured, setConfigured] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchNews = useCallback(async (cat: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const params = cat !== 'all' ? `?category=${cat}` : ''
      const res = await fetch(`/api/news${params}`)
      const json = await res.json()
      setArticles(json.articles ?? [])
      setConfigured(json.configured ?? false)
      setLastUpdated(new Date())
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load + filter change
  useEffect(() => { fetchNews(filter) }, [filter, fetchNews])

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(() => fetchNews(filter, true), REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [filter, fetchNews])

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="px-4 md:px-8 pt-6 md:pt-10 pb-12 animate-fade-in"
      style={{ maxWidth: 760 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p
            className="text-xs uppercase tracking-widest mb-1.5 font-medium"
            style={{ color: '#444', fontFamily: 'var(--font-display)' }}
          >
            Market Intelligence
          </p>
          <h1
            className="text-3xl font-black tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            News
          </h1>
          <p className="text-xs font-light mt-1" style={{ color: '#555', fontFamily: 'var(--font-body)' }}>
            Live market news &amp; economic events
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>
              Updated {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
          <button
            onClick={() => fetchNews(filter, true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-display)',
              cursor: refreshing ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* API key notice */}
      {!configured && !loading && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl mb-5"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}
        >
          <Settings className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#fbbf24', fontFamily: 'var(--font-display)' }}>
              Finnhub API key not configured
            </p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(251,191,36,0.6)', fontFamily: 'var(--font-body)' }}>
              Add <code className="font-mono" style={{ color: '#fbbf24' }}>FINNHUB_API_KEY</code> to your Vercel environment variables.
              Get a free key at{' '}
              <a
                href="https://finnhub.io"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: '#fbbf24' }}
              >
                finnhub.io
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: active ? '#1e1e1e' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.3)',
                fontFamily: 'var(--font-display)',
                border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#6C5DD3' }} />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(108,93,211,0.08)', border: '1px solid rgba(108,93,211,0.15)' }}
          >
            <Newspaper className="w-6 h-6" style={{ color: 'rgba(108,93,211,0.6)' }} />
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)' }}
          >
            {configured ? 'No articles found' : 'News unavailable'}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-body)' }}
          >
            {configured
              ? 'Try switching to a different category'
              : 'Configure your Finnhub API key to see live news'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {articles.map((article) => {
            const cfg = CATEGORY_CFG[article.category] ?? CATEGORY_CFG.general
            return (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl px-5 py-4 transition-all"
                style={{
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.05)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
                  ;(e.currentTarget as HTMLElement).style.background = '#141414'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)'
                  ;(e.currentTarget as HTMLElement).style.background = '#111111'
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Category dot */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: cfg.dot }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: cfg.text, fontFamily: 'var(--font-display)' }}
                      >
                        {cfg.label}
                      </span>
                      {article.source && (
                        <>
                          <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                          <span
                            className="text-[10px]"
                            style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-body)' }}
                          >
                            {article.source}
                          </span>
                        </>
                      )}
                      {article.published_at && (
                        <>
                          <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                          <span
                            className="text-[10px]"
                            style={{ color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-body)' }}
                          >
                            {timeAgo(article.published_at)}
                          </span>
                          <span
                            className="text-[10px] hidden sm:inline"
                            style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-body)' }}
                          >
                            {formatTime(article.published_at)}
                          </span>
                        </>
                      )}
                      <ExternalLink
                        className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      />
                    </div>

                    {/* Title */}
                    <p
                      className="text-sm font-semibold leading-snug transition-colors"
                      style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {article.title}
                    </p>

                    {/* Summary */}
                    {article.summary && article.summary !== article.title && (
                      <p
                        className="text-xs mt-1.5 leading-relaxed line-clamp-2"
                        style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)' }}
                      >
                        {article.summary}
                      </p>
                    )}

                    {/* Tickers */}
                    {article.tickers && article.tickers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {article.tickers.map((ticker) => (
                          <span
                            key={ticker}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{
                              background: 'rgba(108,93,211,0.1)',
                              color: '#8B7CF8',
                              border: '1px solid rgba(108,93,211,0.2)',
                            }}
                          >
                            ${ticker}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
