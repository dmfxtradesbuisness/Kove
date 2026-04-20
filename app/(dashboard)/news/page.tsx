'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import type { CalendarEvent } from '@/app/api/news/calendar/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekStart(offset: number): Date {
  const now = new Date()
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
}

function toYMD(d: Date): string {
  // YYYY-MM-DD in local time
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const IMPACT_CFG = {
  high:   { label: 'HIGH', color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',  dot: '#f87171', emoji: '🔴' },
  medium: { label: 'MED',  color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)', dot: '#fbbf24', emoji: '🟡' },
  low:    { label: 'LOW',  color: '#6b7280', bg: 'rgba(107,114,128,0.08)',border: 'rgba(107,114,128,0.18)',dot: '#6b7280', emoji: '⚪' },
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventPill({ ev, compact = false }: { ev: CalendarEvent; compact?: boolean }) {
  const cfg = IMPACT_CFG[ev.impact]
  const hasNumbers = ev.actual != null || ev.estimate != null || ev.prev != null

  if (compact) {
    return (
      <div
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 7, padding: '6px 8px' }}
        title={ev.description}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: cfg.color, lineHeight: 1.2, marginBottom: 2 }}>
          {cfg.emoji} {ev.name}
        </p>
        {ev.time && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{ev.time}</p>
        )}
        {hasNumbers && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
            {ev.actual   != null && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'rgba(52,211,153,0.15)', color: '#34d399', fontFamily: 'var(--font-display)' }}>A: {ev.actual}{ev.unit ?? ''}</span>}
            {ev.estimate != null && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'rgba(77,144,255,0.12)', color: '#4D90FF', fontFamily: 'var(--font-display)' }}>E: {ev.estimate}{ev.unit ?? ''}</span>}
            {ev.prev     != null && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>P: {ev.prev}{ev.unit ?? ''}</span>}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: hasNumbers ? 3 : 4 }}>
          {ev.currencies.slice(0, 2).map(c => (
            <span key={c} style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'rgba(77,144,255,0.1)', color: '#4D90FF', fontFamily: 'var(--font-display)' }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Mobile full card
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 12, padding: '12px 14px',
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, marginTop: 5, flexShrink: 0, boxShadow: `0 0 6px ${cfg.dot}88` }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff' }}>{ev.name}</p>
          {ev.time && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{ev.time}</span>}
        </div>
        {/* Numbers row */}
        {hasNumbers && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            {ev.actual   != null && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(52,211,153,0.15)', color: '#34d399', fontFamily: 'var(--font-display)' }}>Actual: {ev.actual}{ev.unit ?? ''}</span>}
            {ev.estimate != null && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(77,144,255,0.12)', color: '#4D90FF', fontFamily: 'var(--font-display)' }}>Est: {ev.estimate}{ev.unit ?? ''}</span>}
            {ev.prev     != null && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>Prev: {ev.prev}{ev.unit ?? ''}</span>}
          </div>
        )}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, marginBottom: 6 }}>{ev.description}</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {ev.currencies.map(c => (
            <span key={c} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(77,144,255,0.1)', border: '1px solid rgba(77,144,255,0.18)', color: '#4D90FF', fontFamily: 'var(--font-display)' }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [weekOffset,   setWeekOffset]   = useState(0)
  const [events,       setEvents]       = useState<CalendarEvent[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [stale,        setStale]        = useState(false)
  const [refreshing,   setRefreshing]   = useState(false)

  async function fetchEvents(bustCache = false) {
    bustCache ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const url = bustCache ? '/api/news/calendar?bust=1' : '/api/news/calendar'
      const res  = await fetch(url)
      const data = await res.json()
      if (data.error && !data.events?.length) {
        setError(data.error)
      } else {
        setEvents(data.events ?? [])
        setStale(!!data.stale)
      }
    } catch {
      setError('Could not load calendar. Check your connection.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])

  const weekStart = getWeekStart(weekOffset)
  const weekDays  = getWeekDays(weekStart)
  const today     = new Date(); today.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const weekEvents = useMemo(() => {
    const startStr = toYMD(weekStart)
    const endStr   = toYMD(weekEnd)
    return events
      .filter(e => e.date >= startStr && e.date <= endStr)
      .filter(e => impactFilter === 'all' || e.impact === impactFilter)
  }, [events, weekStart, weekEnd, impactFilter])

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const weekLabel    = `${fmt(weekStart)} – ${fmt(weekEnd)}`
  const isCurrentWeek = weekOffset === 0
  const todayStr     = toYMD(today)

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-12 animate-fade-in">

      {/* ── Header ── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p className="page-label">Economic Calendar</p>
          <h1 className="page-title">Market Events</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', marginTop: 4 }}>
            Live economic data — events that move the market
          </p>
        </div>
        <button
          onClick={() => fetchEvents(true)}
          disabled={refreshing}
          title="Refresh calendar"
          style={{
            width: 32, height: 32, borderRadius: 8, marginTop: 6,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: refreshing ? 'not-allowed' : 'pointer', color: 'rgba(255,255,255,0.35)',
            flexShrink: 0,
          }}
        >
          <RefreshCw style={{ width: 13, height: 13 }} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {stale && (
        <div style={{ marginBottom: 16, fontSize: 11, color: '#fbbf24', fontFamily: 'var(--font-body)', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '6px 12px' }}>
          Showing cached data — live refresh failed. Click ↻ to retry.
        </div>
      )}

      {/* ── Week nav + impact filter ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        {/* Week navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setWeekOffset(v => v - 1)}
            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronLeft style={{ width: 15, height: 15 }} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>
              {isCurrentWeek ? 'This Week' : weekOffset > 0 ? `In ${weekOffset} week${weekOffset > 1 ? 's' : ''}` : `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago`}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{weekLabel}</p>
          </div>
          <button
            onClick={() => setWeekOffset(v => v + 1)}
            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronRight style={{ width: 15, height: 15 }} />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(30,110,255,0.1)', border: '1px solid rgba(30,110,255,0.2)', color: '#4D90FF', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer' }}
            >
              Today
            </button>
          )}
        </div>

        {/* Impact filter */}
        <div style={{ display: 'flex', gap: 5 }}>
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setImpactFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s',
                background: impactFilter === f ? '#4D90FF' : 'rgba(255,255,255,0.04)',
                color: impactFilter === f ? '#fff' : 'rgba(255,255,255,0.4)',
                border: impactFilter === f ? '1px solid #4D90FF' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {f === 'all' ? 'All' : f === 'high' ? '🔴 High' : f === 'medium' ? '🟡 Med' : '⚪ Low'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#f87171', fontFamily: 'var(--font-body)', marginBottom: 10 }}>{error}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>
            Add a <span style={{ color: '#fff' }}>FINNHUB_API_KEY</span> to your environment variables to enable live data.
            Get a free key at <a href="https://finnhub.io" target="_blank" rel="noreferrer" style={{ color: '#4D90FF' }}>finnhub.io</a>.
          </p>
        </div>
      )}

      {/* ── Calendar ── */}
      {!loading && !error && (
        weekEvents.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
            <Calendar style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.1)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)' }}>
              No events match your filters this week.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: 7-column grid */}
            <div className="hidden md:grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {weekDays.map((day, i) => {
                const dayStr  = toYMD(day)
                const isToday = dayStr === todayStr
                const isPast  = day < today && !isToday
                const dayEvents = weekEvents.filter(e => e.date === dayStr)
                const isWeekend = i >= 5
                return (
                  <div key={i}>
                    {/* Day header */}
                    <div style={{
                      padding: '8px 10px', borderRadius: '10px 10px 0 0', marginBottom: 4,
                      background: isToday ? 'rgba(30,110,255,0.15)' : isWeekend ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isToday ? 'rgba(30,110,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      borderBottom: 'none',
                    }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: isToday ? '#4D90FF' : isPast ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {DAYS[i]}
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: isToday ? '#fff' : isPast ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', lineHeight: 1.1, marginTop: 1 }}>
                        {day.getDate()}
                      </p>
                      {isToday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4D90FF', marginTop: 4 }} />}
                    </div>
                    {/* Events */}
                    <div style={{
                      minHeight: 120, padding: 6, borderRadius: '0 0 10px 10px',
                      background: isToday ? 'rgba(30,110,255,0.05)' : isWeekend ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isToday ? 'rgba(30,110,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      display: 'flex', flexDirection: 'column', gap: 4,
                      opacity: isPast ? 0.55 : 1,
                    }}>
                      {dayEvents.length === 0 && (
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.1)', fontFamily: 'var(--font-body)', textAlign: 'center', marginTop: 12 }}>—</p>
                      )}
                      {dayEvents.map((ev, j) => <EventPill key={j} ev={ev} compact />)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile: day sections */}
            <div className="flex flex-col gap-3 md:hidden">
              {weekDays.map((day, i) => {
                const dayStr    = toYMD(day)
                const isToday   = dayStr === todayStr
                const isPast    = day < today && !isToday
                const dayEvents = weekEvents.filter(e => e.date === dayStr)
                if (dayEvents.length === 0) return null
                return (
                  <div key={i} style={{ opacity: isPast ? 0.55 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: isToday ? 'rgba(30,110,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isToday ? 'rgba(30,110,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 700, color: isToday ? '#4D90FF' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', lineHeight: 1 }}>{DAYS[i]}</p>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: isToday ? '#fff' : 'rgba(255,255,255,0.6)', lineHeight: 1 }}>{day.getDate()}</p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                        {day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        {isToday && <span style={{ marginLeft: 6, color: '#4D90FF', fontWeight: 700 }}>· Today</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {dayEvents.map((ev, j) => <EventPill key={j} ev={ev} />)}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )
      )}
    </div>
  )
}
