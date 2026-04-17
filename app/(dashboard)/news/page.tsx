'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, ExternalLink, RefreshCw, Newspaper, Settings, Calendar, Clock } from 'lucide-react'

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

interface EconEvent {
  name: string
  date: Date
  impact: 'high' | 'medium' | 'low'
  description: string
  currencies: string[]
  actual?: string
  forecast?: string
}

// ─── Economic calendar 2026 ───────────────────────────────────────────────────
function buildEconCalendar(): EconEvent[] {
  const y = new Date().getFullYear()
  const events: EconEvent[] = [
    // FOMC
    ...[
      [1,28],[3,18],[5,6],[6,17],[7,29],[9,16],[10,28],[12,9],
    ].map(([m,d]) => ({ name: 'FOMC Meeting', date: new Date(y,m-1,d), impact: 'high' as const, description: 'Federal Reserve interest rate decision', currencies: ['USD', 'NQ'] })),

    // CPI (2nd Tuesday of month ~)
    ...[
      [1,15],[2,12],[3,12],[4,10],[5,13],[6,11],[7,14],[8,13],[9,11],[10,9],[11,12],[12,10],
    ].map(([m,d]) => ({ name: 'CPI', date: new Date(y,m-1,d), impact: 'high' as const, description: 'Consumer Price Index — inflation data', currencies: ['USD', 'NQ'] })),

    // NFP (first Friday)
    ...[
      [1,10],[2,7],[3,7],[4,4],[5,2],[6,5],[7,3],[8,7],[9,4],[10,2],[11,6],[12,4],
    ].map(([m,d]) => ({ name: 'NFP', date: new Date(y,m-1,d), impact: 'high' as const, description: 'Non-Farm Payrolls — jobs data', currencies: ['USD', 'NQ'] })),

    // PPI
    ...[
      [1,16],[2,13],[3,13],[4,11],[5,14],[6,12],[7,15],[8,14],[9,12],[10,10],[11,13],[12,11],
    ].map(([m,d]) => ({ name: 'PPI', date: new Date(y,m-1,d), impact: 'medium' as const, description: 'Producer Price Index', currencies: ['USD'] })),

    // Retail Sales
    ...[
      [1,16],[2,14],[3,17],[4,16],[5,15],[6,16],[7,16],[8,15],[9,12],[10,16],[11,14],[12,12],
    ].map(([m,d]) => ({ name: 'Retail Sales', date: new Date(y,m-1,d), impact: 'medium' as const, description: 'US Retail Sales MoM', currencies: ['USD'] })),

    // GDP (quarterly — prelim)
    ...[
      [1,30],[4,30],[7,30],[10,30],
    ].map(([m,d]) => ({ name: 'GDP', date: new Date(y,m-1,d), impact: 'high' as const, description: 'Gross Domestic Product QoQ', currencies: ['USD', 'NQ'] })),

    // Unemployment Claims (weekly — first Thursday of each month shown)
    ...[
      [1,9],[2,6],[3,6],[4,3],[5,1],[6,5],[7,3],[8,6],[9,4],[10,2],[11,5],[12,4],
    ].map(([m,d]) => ({ name: 'Initial Claims', date: new Date(y,m-1,d), impact: 'low' as const, description: 'Weekly unemployment claims', currencies: ['USD'] })),
  ]
  return events
}

function getThisWeekEvents(): EconEvent[] {
  const now = new Date()
  const dow = now.getDay() // 0=Sun, 1=Mon...
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return buildEconCalendar()
    .filter(e => e.date >= monday && e.date <= sunday)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

function getWeekLabel(): string {
  const now = new Date()
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

const IMPACT_CFG = {
  high:   { label: 'HIGH',   color: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  dot: '#f87171', emoji: '🔴' },
  medium: { label: 'MED',    color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)', dot: '#fbbf24', emoji: '🟡' },
  low:    { label: 'LOW',    color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)', dot: '#6b7280', emoji: '⚪' },
}

const IMPACT_FILTERS: { key: 'all' | 'high' | 'medium' | 'low'; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'high',   label: '🔴 High' },
  { key: 'medium', label: '🟡 Med' },
  { key: 'low',    label: '⚪ Low' },
]

const CURRENCY_FILTERS = ['All', 'USD', 'EUR', 'GBP', 'JPY', 'NQ']

// ─── News config ──────────────────────────────────────────────────────────────
const CATEGORY_CFG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  forex:   { label: 'Forex',   color: '#a78bfa', bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.22)',  dot: '#2563EB' },
  crypto:  { label: 'Crypto',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.22)',  dot: '#fbbf24' },
  markets: { label: 'Markets', color: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.22)',  dot: '#34d399' },
  global:  { label: 'Global',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.22)',  dot: '#60a5fa' },
  general: { label: 'General', color: '#6b7280', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',  dot: '#555'    },
}

const FILTER_TABS = [
  { key: 'all',     label: 'All'     },
  { key: 'forex',   label: 'Forex'   },
  { key: 'crypto',  label: 'Crypto'  },
  { key: 'markets', label: 'Markets' },
  { key: 'global',  label: 'Global'  },
]

const REFRESH_INTERVAL = 5 * 60 * 1000

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')       // remove all tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')        // collapse whitespace
    .trim()
}

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
  const [articles, setArticles]       = useState<Article[]>([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [filter, setFilter]           = useState('all')
  const [configured, setConfigured]   = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [impactFilter, setImpactFilter]   = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [currencyFilter, setCurrencyFilter] = useState('all')
  const [weekEvents] = useState<EconEvent[]>(() => getThisWeekEvents())

  const filteredEvents = weekEvents.filter(ev => {
    if (impactFilter !== 'all' && ev.impact !== impactFilter) return false
    if (currencyFilter !== 'all' && !ev.currencies.includes(currencyFilter)) return false
    return true
  })

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

  useEffect(() => { fetchNews(filter) }, [filter, fetchNews])
  useEffect(() => {
    const id = setInterval(() => fetchNews(filter, true), REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [filter, fetchNews])

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-12 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="page-label">Market Intelligence</p>
          <h1 className="page-title">News</h1>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>
              Updated {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
          <button
            onClick={() => fetchNews(filter, true)}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-display)',
              fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.5 : 1,
            }}
          >
            <RefreshCw style={{ width: 11, height: 11 }} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Economic Calendar ── */}
      <div style={{ marginBottom: 28 }}>
        {/* Section header */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar style={{ width: 13, height: 13, color: '#3B82F6' }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Economic Calendar
          </p>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)', marginLeft: 4 }}>
            {getWeekLabel()}
          </span>
        </div>

        {/* Impact filter row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {IMPACT_FILTERS.map(f => {
            const active = impactFilter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setImpactFilter(f.key)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? '#3B82F6' : 'rgba(255,255,255,0.04)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: active ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Currency filter row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {CURRENCY_FILTERS.map(c => {
            const key = c === 'All' ? 'all' : c
            const active = currencyFilter === key
            return (
              <button
                key={c}
                onClick={() => setCurrencyFilter(key)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? '#3B82F6' : 'rgba(255,255,255,0.04)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: active ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {c}
              </button>
            )
          })}
        </div>

        {/* Event cards */}
        {filteredEvents.length === 0 ? (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)', padding: '12px 0' }}>
            No events match your filters this week.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {filteredEvents.map((ev, i) => {
              const cfg = IMPACT_CFG[ev.impact]
              const days = daysUntil(ev.date)
              const isToday = days === 0
              const isTomorrow = days === 1
              return (
                <div
                  key={`${ev.name}-${i}`}
                  style={{
                    flexShrink: 0,
                    background: isToday ? 'rgba(29,78,216,0.12)' : '#111',
                    border: isToday ? '1px solid rgba(29,78,216,0.35)' : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14,
                    padding: '12px 16px',
                    minWidth: 170,
                    maxWidth: 200,
                  }}
                >
                  {/* Impact badge + today badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
                      fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                    }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6', fontFamily: 'var(--font-display)', background: 'rgba(29,78,216,0.15)', padding: '2px 7px', borderRadius: 5 }}>TODAY</span>
                    )}
                    {isTomorrow && !isToday && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-display)', background: 'rgba(251,191,36,0.1)', padding: '2px 7px', borderRadius: 5 }}>TMRW</span>
                    )}
                  </div>

                  {/* Event name */}
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 4 }}>
                    {ev.name}
                  </p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', lineHeight: 1.4, marginBottom: 8 }}>
                    {ev.description}
                  </p>

                  {/* Currency tags */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                    {ev.currencies.map(cur => (
                      <span key={cur} style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(139,124,248,0.1)', border: '1px solid rgba(139,124,248,0.2)',
                        color: '#3B82F6', fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
                      }}>
                        {cur}
                      </span>
                    ))}
                  </div>

                  {/* Date + countdown */}
                  <div className="flex items-center gap-1.5">
                    <Clock style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)' }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}>
                      {ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, marginLeft: 'auto',
                      color: isToday ? '#3B82F6' : isTomorrow ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `in ${days}d`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── API key notice ── */}
      {!configured && !loading && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12, marginBottom: 16, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <Settings style={{ width: 14, height: 14, marginTop: 1, flexShrink: 0, color: '#fbbf24' }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', fontFamily: 'var(--font-display)' }}>Finnhub API key not configured</p>
            <p style={{ fontSize: 12, marginTop: 3, lineHeight: 1.5, color: 'rgba(251,191,36,0.6)', fontFamily: 'var(--font-body)' }}>
              Add <code style={{ color: '#fbbf24' }}>FINNHUB_API_KEY</code> to your Vercel environment variables.
              Get a free key at{' '}
              <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', textDecoration: 'underline' }}>finnhub.io</a>
            </p>
          </div>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s',
                background: active ? '#1e1e1e' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.3)',
                border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1D4ED8' }} />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24">
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Newspaper style={{ width: 22, height: 22, color: 'rgba(29,78,216,0.6)' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)' }}>
            {configured ? 'No articles found' : 'News unavailable'}
          </p>
          <p style={{ fontSize: 12, marginTop: 6, color: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-body)' }}>
            {configured ? 'Try switching to a different category' : 'Configure your Finnhub API key to see live news'}
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
                style={{ display: 'block', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = '#141414' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.background = '#111' }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, display: 'block' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>{cfg.label}</span>
                      {article.source && <>
                        <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-body)' }}>{article.source}</span>
                      </>}
                      {article.published_at && <>
                        <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-body)' }}>{timeAgo(article.published_at)}</span>
                        <span className="hidden sm:inline" style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-body)' }}>{formatTime(article.published_at)}</span>
                      </>}
                      <ExternalLink style={{ width: 11, height: 11, marginLeft: 'auto', color: 'rgba(255,255,255,0.2)' }} />
                    </div>

                    {/* Title */}
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-display)', lineHeight: 1.45, letterSpacing: '-0.01em' }}>
                      {article.title}
                    </p>

                    {/* Summary */}
                    {article.summary && article.summary !== article.title && (
                      <p className="line-clamp-2" style={{ fontSize: 12, marginTop: 5, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', lineHeight: 1.55 }}>
                        {stripHtml(article.summary)}
                      </p>
                    )}

                    {/* Tickers */}
                    {article.tickers?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {article.tickers.map((ticker) => (
                          <span key={ticker} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: 'rgba(29,78,216,0.1)', color: '#3B82F6', border: '1px solid rgba(29,78,216,0.2)', fontFamily: 'var(--font-display)' }}>
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
