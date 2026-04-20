'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, Calendar } from 'lucide-react'
import type { CalendarEvent } from '@/app/api/news/calendar/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toYMD(d: Date): string {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function startOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

// ─── Colors: red / orange / yellow only ───────────────────────────────────────
const IMPACT_CFG = {
  high:   { label: 'HIGH',   color: '#f87171', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.22)',  dot: '#f87171', tag: 'bg-red-500/20 text-red-400 border-red-500/30' },
  medium: { label: 'MED',    color: '#fb923c', bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.22)', dot: '#fb923c', tag: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  low:    { label: 'LOW',    color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.18)', dot: '#fbbf24', tag: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ─── Single event card ────────────────────────────────────────────────────────
function EventCard({ ev }: { ev: CalendarEvent }) {
  const cfg = IMPACT_CFG[ev.impact]
  const isPast    = ev.actual != null
  const hasPrev   = ev.prev     != null
  const hasEst    = ev.estimate != null

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderLeft: `3px solid ${cfg.dot}`,
      borderRadius: 12,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Top row: name + time + impact badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {ev.name}
          </p>
          {ev.time && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
              {ev.time}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.color, fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
          }}>
            {cfg.label}
          </span>
          {isPast && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', fontFamily: 'var(--font-display)' }}>
              RELEASED
            </span>
          )}
        </div>
      </div>

      {/* Numbers row */}
      {(ev.actual != null || ev.estimate != null || ev.prev != null) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ev.actual   != null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(52,211,153,0.7)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Actual</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {ev.actual}{ev.unit ?? ''}
              </span>
            </div>
          )}
          {ev.estimate != null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: ev.actual != null ? 16 : 0 }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(77,144,255,0.7)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Forecast</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#4D90FF', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {ev.estimate}{ev.unit ?? ''}
              </span>
            </div>
          )}
          {hasPrev && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: (ev.actual != null || ev.estimate != null) ? 16 : 0 }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Previous</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {ev.prev}{ev.unit ?? ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Currencies */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {ev.currencies.map(c => (
          <span key={c} style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
            background: 'rgba(77,144,255,0.08)', border: '1px solid rgba(77,144,255,0.15)',
            color: 'rgba(77,144,255,0.8)', fontFamily: 'var(--font-display)',
          }}>
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Week strip — shows dots for days with events ────────────────────────────
function WeekStrip({ currentDate, events, onSelect }: {
  currentDate: Date
  events: CalendarEvent[]
  onSelect: (d: Date) => void
}) {
  // Build Mon–Sun of the week containing currentDate
  const dow = currentDate.getDay()
  const monday = new Date(currentDate)
  monday.setDate(currentDate.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)

  const todayStr   = toYMD(startOfDay(new Date()))
  const currentStr = toYMD(startOfDay(currentDate))

  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
      {Array.from({ length: 7 }, (_, i) => {
        const d      = addDays(monday, i)
        const dStr   = toYMD(d)
        const isToday   = dStr === todayStr
        const isActive  = dStr === currentStr
        const hasEvents = events.some(e => e.date === dStr)
        const dayLabel  = DAY_NAMES[d.getDay()]

        return (
          <button
            key={i}
            onClick={() => onSelect(d)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 5, padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
              background: isActive ? 'rgba(30,110,255,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isActive ? 'rgba(30,110,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.15s',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700,
              color: isActive ? '#4D90FF' : 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>
              {dayLabel}
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800,
              color: isActive ? '#fff' : isToday ? '#4D90FF' : 'rgba(255,255,255,0.55)',
              lineHeight: 1,
            }}>
              {d.getDate()}
            </span>
            {/* Event dot */}
            <div style={{
              width: 4, height: 4, borderRadius: '50%',
              background: hasEvents ? (isActive ? '#4D90FF' : 'rgba(255,255,255,0.25)') : 'transparent',
            }} />
          </button>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [events,     setEvents]     = useState<CalendarEvent[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [stale,      setStale]      = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [currentDay, setCurrentDay] = useState<Date>(startOfDay(new Date()))

  async function fetchEvents(bust = false) {
    bust ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const res  = await fetch(bust ? '/api/news/calendar?bust=1' : '/api/news/calendar')
      const data = await res.json()
      if (data.error && !data.events?.length) {
        setError(data.error)
      } else {
        // Only keep high + medium + low (no grey — low is now yellow)
        setEvents((data.events ?? []).filter((e: CalendarEvent) => ['high','medium','low'].includes(e.impact)))
        setStale(!!data.stale)
      }
    } catch {
      setError('Could not load calendar.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])

  // Days that have events (for smart prev/next skipping)
  const eventDates = useMemo(() => new Set(events.map(e => e.date)), [events])

  const todayStr     = toYMD(startOfDay(new Date()))
  const currentStr   = toYMD(currentDay)
  const isToday      = currentStr === todayStr

  // Events for the selected day — exclude low unless explicitly toggled
  const dayEvents = useMemo(
    () => events.filter(e => e.date === currentStr && e.impact !== 'low'),
    [events, currentStr],
  )

  const allDayEvents = useMemo(
    () => events.filter(e => e.date === currentStr),
    [events, currentStr],
  )

  const [showLow, setShowLow] = useState(false)
  const displayedEvents = showLow ? allDayEvents : dayEvents

  // Navigate to prev/next day that has events (or adjacent day)
  function go(dir: 1 | -1) {
    let d = addDays(currentDay, dir)
    // Try to jump to next/prev day with events (up to 14 days)
    for (let i = 0; i < 14; i++) {
      if (eventDates.has(toYMD(d))) break
      d = addDays(d, dir)
    }
    setCurrentDay(startOfDay(d))
  }

  const dayLabel = `${DAY_NAMES[currentDay.getDay()]}, ${MONTH_NAMES[currentDay.getMonth()]} ${currentDay.getDate()}`

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-12 animate-fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p className="page-label">Economic Calendar</p>
          <h1 className="page-title">Market Events</h1>
        </div>
        <button
          onClick={() => fetchEvents(true)}
          disabled={refreshing}
          title="Refresh"
          style={{
            width: 32, height: 32, borderRadius: 8, marginTop: 6, flexShrink: 0,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: refreshing ? 'not-allowed' : 'pointer', color: 'rgba(255,255,255,0.35)',
          }}
        >
          <RefreshCw style={{ width: 13, height: 13 }} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {stale && (
        <div style={{ marginBottom: 16, fontSize: 11, color: '#fbbf24', fontFamily: 'var(--font-body)', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)', borderRadius: 8, padding: '6px 12px' }}>
          Showing cached data — click ↻ to refresh.
        </div>
      )}

      {/* ── Week strip ── */}
      {!loading && !error && (
        <WeekStrip currentDate={currentDay} events={events} onSelect={d => setCurrentDay(startOfDay(d))} />
      )}

      {/* ── Day navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={() => go(-1)}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {dayLabel}
          </p>
          {isToday && (
            <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#4D90FF', background: 'rgba(30,110,255,0.12)', border: '1px solid rgba(30,110,255,0.25)', borderRadius: 999, padding: '2px 8px', letterSpacing: '0.06em' }}>
              TODAY
            </span>
          )}
          {!isToday && (
            <button
              onClick={() => setCurrentDay(startOfDay(new Date()))}
              style={{ display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
            >
              ← back to today
            </button>
          )}
        </div>

        <button
          onClick={() => go(1)}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
        >
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#f87171', fontFamily: 'var(--font-body)', marginBottom: 8 }}>{error}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>
            Add <span style={{ color: '#fff' }}>FINNHUB_API_KEY</span> to your env vars.{' '}
            <a href="https://finnhub.io" target="_blank" rel="noreferrer" style={{ color: '#4D90FF' }}>Get a free key →</a>
          </p>
        </div>
      )}

      {/* ── Events ── */}
      {!loading && !error && (
        displayedEvents.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '40px 24px', textAlign: 'center' }}>
            <Calendar style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.08)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>
              No high or medium impact events today.
            </p>
            {allDayEvents.length > 0 && !showLow && (
              <button
                onClick={() => setShowLow(true)}
                style={{ marginTop: 10, fontSize: 11, color: '#fbbf24', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)' }}
              >
                Show {allDayEvents.length} low-impact event{allDayEvents.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Count + toggle low */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {displayedEvents.length} event{displayedEvents.length !== 1 ? 's' : ''}
              </span>
              {allDayEvents.length > dayEvents.length && (
                <button
                  onClick={() => setShowLow(v => !v)}
                  style={{ fontSize: 11, color: showLow ? 'rgba(255,255,255,0.3)' : '#fbbf24', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)' }}
                >
                  {showLow ? 'Hide low impact' : `+ ${allDayEvents.length - dayEvents.length} low impact`}
                </button>
              )}
            </div>
            {displayedEvents.map((ev, i) => <EventCard key={i} ev={ev} />)}
          </div>
        )
      )}
    </div>
  )
}
