'use client'

import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
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

function getUpcomingEvents(): EconEvent[] {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const cutoff = new Date(now)
  cutoff.setDate(now.getDate() + 60)

  // Exclude this week's events
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return buildEconCalendar()
    .filter(e => e.date > sunday && e.date <= cutoff)
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
  high:   { label: 'HIGH',   color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   dot: '#f87171', emoji: '🔴' },
  medium: { label: 'MED',    color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.22)',  dot: '#fbbf24', emoji: '🟡' },
  low:    { label: 'LOW',    color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)', dot: '#6b7280', emoji: '⚪' },
}

const IMPACT_FILTERS: { key: 'all' | 'high' | 'medium' | 'low'; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'high',   label: '🔴 High' },
  { key: 'medium', label: '🟡 Med' },
  { key: 'low',    label: '⚪ Low' },
]

const CURRENCY_FILTERS = ['All', 'USD', 'EUR', 'GBP', 'JPY', 'NQ']

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [impactFilter, setImpactFilter]     = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [currencyFilter, setCurrencyFilter] = useState('all')

  const allWeekEvents     = getThisWeekEvents()
  const allUpcomingEvents = getUpcomingEvents()

  function applyFilters(events: EconEvent[]) {
    return events.filter(ev => {
      if (impactFilter !== 'all' && ev.impact !== impactFilter) return false
      if (currencyFilter !== 'all' && !ev.currencies.includes(currencyFilter)) return false
      return true
    })
  }

  const weekEvents     = applyFilters(allWeekEvents)
  const upcomingEvents = applyFilters(allUpcomingEvents)

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-12 animate-fade-in">

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <p className="page-label">Market Intelligence</p>
        <h1 className="page-title">Market Events</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', marginTop: 4 }}>
          Economic calendar — key events that move the market
        </p>
      </div>

      {/* ── Filters ── */}
      <div style={{ marginBottom: 20 }}>
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
                  background: active ? '#4D90FF' : 'rgba(255,255,255,0.04)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: active ? '1px solid #4D90FF' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Currency filter row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
                  background: active ? '#4D90FF' : 'rgba(255,255,255,0.04)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: active ? '1px solid #4D90FF' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── This Week ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Calendar style={{ width: 13, height: 13, color: '#4D90FF' }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            This Week
          </p>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-body)' }}>
            {getWeekLabel()}
          </span>
        </div>

        {weekEvents.length === 0 ? (
          <div className="dash-card" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)' }}>
              No events match your filters this week.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
            {weekEvents.map((ev, i) => {
              const cfg = IMPACT_CFG[ev.impact]
              const days = daysUntil(ev.date)
              const isToday    = days === 0
              const isTomorrow = days === 1
              const isPast     = days < 0
              return (
                <div
                  key={`week-${ev.name}-${i}`}
                  style={{
                    flexShrink: 0,
                    background: isToday
                      ? 'rgba(30,110,255,0.10)'
                      : isPast
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(255,255,255,0.04)',
                    border: isToday
                      ? '1px solid rgba(30,110,255,0.30)'
                      : isPast
                      ? '1px solid rgba(255,255,255,0.04)'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    minWidth: 180,
                    maxWidth: 210,
                    opacity: isPast ? 0.45 : 1,
                  }}
                >
                  {/* Impact badge + countdown badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
                      fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                    }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#4D90FF', fontFamily: 'var(--font-display)', background: 'rgba(30,110,255,0.15)', padding: '2px 7px', borderRadius: 5 }}>
                        TODAY
                      </span>
                    )}
                    {isTomorrow && !isToday && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-display)', background: 'rgba(251,191,36,0.1)', padding: '2px 7px', borderRadius: 5 }}>
                        TMRW
                      </span>
                    )}
                    {!isToday && !isTomorrow && !isPast && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 5 }}>
                        In {days}d
                      </span>
                    )}
                  </div>

                  {/* Event name */}
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 5 }}>
                    {ev.name}
                  </p>

                  {/* Description */}
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--font-body)', lineHeight: 1.45, marginBottom: 10 }}>
                    {ev.description}
                  </p>

                  {/* Currency tags */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {ev.currencies.map(cur => (
                      <span key={cur} style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(77,144,255,0.1)', border: '1px solid rgba(77,144,255,0.2)',
                        color: '#4D90FF', fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
                      }}>
                        {cur}
                      </span>
                    ))}
                  </div>

                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.25)' }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)' }}>
                      {ev.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Upcoming Events ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Calendar style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)' }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Upcoming Events
          </p>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-body)' }}>
            Next 60 days
          </span>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="dash-card" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)' }}>
              No upcoming events match your filters.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {upcomingEvents.map((ev, i) => {
              const cfg  = IMPACT_CFG[ev.impact]
              const days = daysUntil(ev.date)
              return (
                <div
                  key={`upcoming-${ev.name}-${i}`}
                  className="dash-card"
                  style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
                >
                  {/* Impact dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: cfg.dot, flexShrink: 0,
                    boxShadow: `0 0 6px ${cfg.dot}66`,
                  }} />

                  {/* Name + description */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.88)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                      {ev.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-body)', marginTop: 2 }}>
                      {ev.description}
                    </p>
                  </div>

                  {/* Currency tags */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {ev.currencies.map(cur => (
                      <span key={cur} style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(77,144,255,0.08)', border: '1px solid rgba(77,144,255,0.18)',
                        color: '#4D90FF', fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
                      }}>
                        {cur}
                      </span>
                    ))}
                  </div>

                  {/* Impact badge */}
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5, flexShrink: 0,
                    background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
                    fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                  }}>
                    {cfg.emoji} {cfg.label}
                  </span>

                  {/* Date + countdown */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-display)' }}>
                      {ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)', marginTop: 1 }}>
                      In {days}d
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
