'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, Activity, DollarSign, Target,
  BarChart2, Zap, Flame, Trophy, Calendar,
} from 'lucide-react'
import type { Trade } from '@/lib/types'
import { ProGate } from '@/components/ProGate'

// ─── Types ───────────────────────────────────────────────────────────────────
type Period = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

interface WeeklyWrap {
  label: string
  pnl: number
  trades: number
  wins: number
  closed: number
  best: number
  worst: number
}

const PERIODS: { label: string; key: Period }[] = [
  { label: '1D', key: '1D' },
  { label: '1W', key: '1W' },
  { label: '1M', key: '1M' },
  { label: '3M', key: '3M' },
  { label: '1Y', key: '1Y' },
  { label: 'All', key: 'ALL' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function filterByPeriod(trades: Trade[], period: Period): Trade[] {
  if (period === 'ALL') return trades
  const now = new Date()
  const cutoff = new Date(now)
  switch (period) {
    case '1D': cutoff.setDate(now.getDate() - 1); break
    case '1W': cutoff.setDate(now.getDate() - 7); break
    case '1M': cutoff.setMonth(now.getMonth() - 1); break
    case '3M': cutoff.setMonth(now.getMonth() - 3); break
    case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break
  }
  return trades.filter((t) => new Date(t.created_at) >= cutoff)
}

function calcDisciplineScore(trades: Trade[]): { score: number; breakdown: { label: string; pts: number; max: number; tip: string }[] } {
  const closed = trades.filter((t) => t.pnl !== null)
  if (closed.length === 0) return { score: 0, breakdown: [] }

  // 1. Risk Management — % of trades with stop loss set (25pts)
  const withSL = trades.filter((t) => t.stop_loss !== null && Number(t.stop_loss) > 0).length
  const slRate = trades.length > 0 ? withSL / trades.length : 0
  const slPts = Math.round(slRate * 25)

  // 2. Win Rate component (25pts)
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length
  const winRate = closed.length > 0 ? wins / closed.length : 0
  const wrPts = Math.round(Math.min(1, winRate / 0.6) * 25)

  // 3. Overtrading — trades per active day (25pts)
  const daySet = new Set(trades.map((t) => new Date(t.created_at).toDateString()))
  const avgPerDay = daySet.size > 0 ? trades.length / daySet.size : 0
  const otPts = avgPerDay <= 2 ? 25 : avgPerDay <= 3 ? 20 : avgPerDay <= 4 ? 13 : avgPerDay <= 5 ? 6 : 0

  // 4. Revenge trading — trade within 30min of a loss (25pts)
  const sorted = [...closed].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  let revengeTrades = 0
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    const gap = (new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()) / 60000
    if ((prev.pnl ?? 0) < 0 && gap <= 30) revengeTrades++
  }
  const revengeRate = closed.length > 1 ? revengeTrades / (closed.length - 1) : 0
  const rvPts = Math.round(Math.max(0, 1 - revengeRate * 2) * 25)

  const score = slPts + wrPts + otPts + rvPts

  return {
    score,
    breakdown: [
      { label: 'Risk Management', pts: slPts, max: 25, tip: `${Math.round(slRate * 100)}% of trades have a stop loss` },
      { label: 'Win Rate', pts: wrPts, max: 25, tip: `${Math.round(winRate * 100)}% win rate` },
      { label: 'Overtrading', pts: otPts, max: 25, tip: `${avgPerDay.toFixed(1)} trades/day avg` },
      { label: 'Discipline', pts: rvPts, max: 25, tip: `${revengeTrades} potential revenge trade${revengeTrades !== 1 ? 's' : ''}` },
    ],
  }
}

function calcStreaks(trades: Trade[]) {
  const closed = [...trades]
    .filter((t) => t.pnl !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  let currentStreak = 0, bestStreak = 0, temp = 0
  for (let i = closed.length - 1; i >= 0; i--) {
    if ((closed[i].pnl ?? 0) > 0) {
      currentStreak++
    } else break
  }
  for (const t of closed) {
    if ((t.pnl ?? 0) > 0) {
      temp++
      if (temp > bestStreak) bestStreak = temp
    } else temp = 0
  }

  // Green day streak
  const dayPnl: Record<string, number> = {}
  for (const t of closed) {
    const key = new Date(t.created_at).toDateString()
    dayPnl[key] = (dayPnl[key] ?? 0) + (t.pnl ?? 0)
  }
  const days = Object.entries(dayPnl).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
  let greenDayStreak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i][1] > 0) greenDayStreak++
    else break
  }

  return { currentStreak, bestStreak, greenDayStreak }
}

function calcPerformanceWrap(trades: Trade[]) {
  const now = new Date()
  const thisMonth = trades.filter((t) => {
    const d = new Date(t.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1)
  const lastMonth = trades.filter((t) => {
    const d = new Date(t.created_at)
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear()
  })

  const calc = (ts: Trade[]) => {
    const closed = ts.filter((t) => t.pnl !== null)
    const wins = closed.filter((t) => (t.pnl ?? 0) > 0)
    const pnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0)
    const wr = closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0
    const best  = closed.length > 0 ? closed.reduce((m, t) => Math.max(m, t.pnl ?? 0), -Infinity) : 0
    const worst = closed.length > 0 ? closed.reduce((m, t) => Math.min(m, t.pnl ?? 0),  Infinity) : 0
    return { trades: ts.length, closed: closed.length, pnl, wr, best, worst }
  }

  return { thisMonth: calc(thisMonth), lastMonth: calc(lastMonth) }
}

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function calcWeeklyWrap(trades: Trade[]): WeeklyWrap[] {
  const weekMap: Record<string, { pnl: number; trades: number; wins: number; closed: number; best: number; worst: number; start: Date }> = {}

  for (const t of trades) {
    const d = new Date(t.created_at)
    const key = getISOWeek(d)
    if (!weekMap[key]) {
      // Find Monday of this week for label
      const monday = new Date(d)
      const day = monday.getDay()
      monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1))
      weekMap[key] = { pnl: 0, trades: 0, wins: 0, closed: 0, best: 0, worst: 0, start: monday }
    }
    weekMap[key].trades++
    if (t.pnl !== null) {
      weekMap[key].closed++
      weekMap[key].pnl += t.pnl
      if (t.pnl > 0) weekMap[key].wins++
      if (t.pnl > weekMap[key].best) weekMap[key].best = t.pnl
      if (t.pnl < weekMap[key].worst) weekMap[key].worst = t.pnl
    }
  }

  return Object.entries(weekMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)
    .map(([, v]) => ({
      label: v.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pnl: v.pnl,
      trades: v.trades,
      wins: v.wins,
      closed: v.closed,
      best: v.best,
      worst: v.worst,
    }))
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, positive, neutral }: {
  label: string; value: string; sub?: string; icon: React.ElementType; positive?: boolean; neutral?: boolean
}) {
  const valueColor = neutral
    ? 'var(--text-1)'
    : positive === true
    ? '#34d399'
    : positive === false
    ? '#f87171'
    : 'var(--text-1)'
  return (
    <div
      className="dash-card p-5 flex flex-col gap-4 transition-colors"
      style={{ cursor: 'default' }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)')}
    >
      <div className="flex items-start justify-between">
        <p className="stat-tile-label">{label}</p>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 13, height: 13, color: 'var(--text-3)' }} />
        </div>
      </div>
      <div>
        <p
          className="stat-tile-value"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: valueColor }}
        >
          {value}
        </p>
        {sub && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-body)' }}>{sub}</p>}
      </div>
    </div>
  )
}

function EquityCurve({ trades }: { trades: Trade[] }) {
  const closed = [...trades].filter((t) => t.pnl !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  if (closed.length < 2) return (
    <div className="h-[110px] flex items-center justify-center text-[#333] text-xs">Not enough data</div>
  )
  let cum = 0
  const points = [0, ...closed.map((t) => { cum += t.pnl ?? 0; return cum })]
  const minV = points.reduce((m, v) => Math.min(m, v),  Infinity)
  const maxV = points.reduce((m, v) => Math.max(m, v), -Infinity)
  const range = maxV - minV || 1
  const W = 400, H = 110, PAD = 8
  const toX = (i: number) => (i / (points.length - 1)) * W
  const toY = (v: number) => H - PAD - ((v - minV) / range) * (H - PAD * 2)
  const pathD = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ')
  const isUp = points[points.length - 1] >= 0
  const col = isUp ? '#10b981' : '#ef4444'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[110px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.2" />
          <stop offset="100%" stopColor={col} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {minV < 0 && maxV > 0 && (
        <line x1="0" y1={toY(0).toFixed(1)} x2={W} y2={toY(0).toFixed(1)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
      )}
      <path d={`${pathD} L ${W} ${H} L 0 ${H} Z`} fill="url(#eg)" />
      <path d={pathD} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── P&L Calendar ─────────────────────────────────────────────────────────────
function PnlCalendar({ trades }: { trades: Trade[] }) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const dayMap: Record<number, { pnl: number; count: number }> = {}
  trades.forEach((t) => {
    if (t.pnl === null) return
    const d = new Date(t.created_at)
    if (d.getMonth() !== month || d.getFullYear() !== year) return
    const day = d.getDate()
    if (!dayMap[day]) dayMap[day] = { pnl: 0, count: 0 }
    dayMap[day].pnl += t.pnl
    dayMap[day].count++
  })

  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today       = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year

  // Mon-first: S M T W T F S → M T W T F S S
  const DOW_LABELS = ['M','T','W','T','F','S','S']
  // Shift firstDow: Sun=0 → col 6, Mon=1 → col 0
  const startCol = (firstDow + 6) % 7

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthPnl   = Object.values(dayMap).reduce((s, d) => s + d.pnl, 0)
  const tradeDays  = Object.keys(dayMap).length

  // Intensity-based coloring (no text inside cells)
  function cellStyle(pnl: number, isToday: boolean, isFuture: boolean, hasData: boolean): React.CSSProperties {
    if (isToday && !hasData) return { background: 'rgba(108,93,211,0.12)', border: '1.5px solid rgba(108,93,211,0.5)' }
    if (!hasData) return { background: isFuture ? 'transparent' : 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }
    if (pnl > 0) {
      const i = pnl > 500 ? 0.55 : pnl > 200 ? 0.38 : pnl > 50 ? 0.22 : 0.12
      return { background: `rgba(52,211,153,${i})`, border: `1px solid rgba(52,211,153,${i + 0.15})`, boxShadow: pnl > 200 ? '0 0 8px rgba(52,211,153,0.12)' : 'none' }
    }
    const i = pnl < -500 ? 0.55 : pnl < -200 ? 0.38 : pnl < -50 ? 0.22 : 0.12
    return { background: `rgba(239,68,68,${i})`, border: `1px solid rgba(239,68,68,${i + 0.15})`, boxShadow: pnl < -200 ? '0 0 8px rgba(239,68,68,0.12)' : 'none' }
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  return (
    <div className="dash-card" style={{ padding: '16px 18px', maxWidth: 420 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
            {monthLabel}
          </p>
          {tradeDays > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: monthPnl >= 0 ? '#34d399' : '#f87171',
              background: monthPnl >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${monthPnl >= 0 ? 'rgba(52,211,153,0.25)' : 'rgba(239,68,68,0.25)'}`,
              borderRadius: 6, padding: '1px 7px',
              fontFamily: 'var(--font-display)',
            }}>
              {monthPnl >= 0 ? '+' : ''}${Math.abs(monthPnl) >= 1000 ? (monthPnl / 1000).toFixed(1) + 'k' : Math.abs(monthPnl).toFixed(0)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontFamily: 'var(--font-display)' }}>‹</button>
          <button onClick={nextMonth} disabled={isCurrentMonth} style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', color: isCurrentMonth ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontFamily: 'var(--font-display)' }}>›</button>
        </div>
      </div>

      {/* DOW labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
        {DOW_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {Array.from({ length: startCol }).map((_, i) => <div key={`e${i}`} />)}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const data    = dayMap[day]
          const isToday = isCurrentMonth && today.getDate() === day
          const isFuture = isCurrentMonth && day > today.getDate()
          const s = cellStyle(data?.pnl ?? 0, isToday, isFuture, !!data)
          const tooltip = data
            ? `${new Date(year, month, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${data.pnl >= 0 ? '+' : ''}$${data.pnl.toFixed(2)} · ${data.count} trade${data.count !== 1 ? 's' : ''}`
            : undefined

          return (
            <div
              key={day}
              title={tooltip}
              style={{
                aspectRatio: '1',
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s, opacity 0.1s',
                cursor: data ? 'default' : 'default',
                ...s,
              }}
              onMouseEnter={(e) => { if (data) (e.currentTarget as HTMLElement).style.transform = 'scale(1.12)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            >
              <span style={{
                fontSize: 9,
                fontWeight: isToday ? 800 : 500,
                lineHeight: 1,
                color: data
                  ? (data.pnl >= 0 ? 'rgba(52,211,153,0.9)' : 'rgba(239,68,68,0.9)')
                  : isToday
                    ? 'rgba(139,124,248,0.8)'
                    : isFuture ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.22)',
                fontFamily: 'var(--font-display)',
              }}>
                {day}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3">
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>Less</span>
        {[0.1, 0.22, 0.38, 0.55].map((o, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: `rgba(52,211,153,${o})`, border: `1px solid rgba(52,211,153,${o + 0.1})` }} />
        ))}
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>More profit</span>
        <div style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />
        {[0.1, 0.22, 0.38, 0.55].map((o, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: `rgba(239,68,68,${o})`, border: `1px solid rgba(239,68,68,${o + 0.1})` }} />
        ))}
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>Loss</span>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StatsPage() {
  const [allTrades, setAllTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState<boolean | null>(null)
  const [period, setPeriod] = useState<Period>('ALL')
  const [tab, setTab] = useState<'overview' | 'discipline' | 'streaks' | 'wrap' | 'leaderboard'>('overview')
  const [leaderboard, setLeaderboard] = useState<{ rank: number; label: string; winRate: number; totalPnl: number; totalTrades: number; isYou: boolean }[]>([])
  const [lbLoading, setLbLoading] = useState(false)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/trades').then((r) => r.json()),
      fetch('/api/stripe/subscription-status').then((r) => r.json()),
    ]).then(([tradesData, subData]) => {
      if (tradesData.trades) setAllTrades(tradesData.trades)
      setSubscribed(subData.active === true)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'leaderboard' && leaderboard.length === 0) {
      setLbLoading(true)
      fetch('/api/leaderboard')
        .then((r) => r.json())
        .then((d) => { setLeaderboard(d.leaderboard ?? []); setUserRank(d.userRank) })
        .finally(() => setLbLoading(false))
    }
  }, [tab, leaderboard.length])

  const trades = useMemo(() => filterByPeriod(allTrades, period), [allTrades, period])
  const closedTrades = trades.filter((t) => t.pnl !== null)
  const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0)
  const losses = closedTrades.filter((t) => (t.pnl ?? 0) < 0)
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : 0
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0

  const { score: discScore, breakdown } = useMemo(() => calcDisciplineScore(allTrades), [allTrades])
  const { currentStreak, bestStreak, greenDayStreak } = useMemo(() => calcStreaks(allTrades), [allTrades])
  const { thisMonth, lastMonth } = useMemo(() => calcPerformanceWrap(allTrades), [allTrades])
  const weeklyWrap = useMemo(() => calcWeeklyWrap(allTrades), [allTrades])

  const pairStats = trades.reduce<Record<string, { count: number; pnl: number }>>((acc, t) => {
    if (!acc[t.pair]) acc[t.pair] = { count: 0, pnl: 0 }
    acc[t.pair].count++; acc[t.pair].pnl += t.pnl ?? 0
    return acc
  }, {})
  const topPairs = Object.entries(pairStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  if (allTrades.length === 0) return (
    <div className="px-4 md:px-8 pt-6 md:pt-10">
      <div className="mb-8">
        <p className="page-label">Statistics</p>
        <h1 className="page-title">Statistics</h1>
      </div>
      <div className="dash-card p-16 text-center">
        <BarChart2 className="w-10 h-10 text-[#222] mx-auto mb-4" />
        <p className="text-[#444] text-sm font-light">Log your first trade to see stats.</p>
      </div>
    </div>
  )

  const scoreColor = discScore >= 75 ? 'text-emerald-400' : discScore >= 50 ? 'text-yellow-400' : 'text-red-400'
  const scoreLabel = discScore >= 75 ? 'Excellent' : discScore >= 60 ? 'Good' : discScore >= 40 ? 'Fair' : 'Needs Work'

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-10">
      {/* Header */}
      <div className="mb-6">
        <p className="page-label">Statistics</p>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <h1 className="page-title">Statistics</h1>
          <p className="text-xs font-light mt-1" style={{ color: 'var(--text-3)' }}>{closedTrades.length} closed trades</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-5 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-1 w-full overflow-x-auto scroll-smooth-mobile">
        {([
          { key: 'overview', label: 'Overview', icon: BarChart2 },
          { key: 'discipline', label: 'Discipline', icon: Zap },
          { key: 'streaks', label: 'Streaks', icon: Flame },
          { key: 'wrap', label: 'Wrap', icon: Calendar },
          { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
              tab === key ? 'bg-white/[0.08] text-white' : 'text-[#444] hover:text-[#888]'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          {/* Time filter */}
          <div className="flex items-center gap-1.5 mb-5 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-1.5 w-fit">
            {PERIODS.map(({ label, key }) => (
              <button key={key} onClick={() => setPeriod(key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${period === key ? 'bg-white/[0.08] text-white' : 'text-[#444] hover:text-[#888]'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Equity curve */}
          {closedTrades.length >= 2 && (
            <div className="dash-card p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-1">Equity Curve</p>
                  <p className={`text-2xl font-black tracking-tight ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl) >= 1000 ? (totalPnl / 1000).toFixed(2) + 'k' : totalPnl.toFixed(2)}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${totalPnl >= 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                  {wins.length}W / {losses.length}L
                </span>
              </div>
              <EquityCurve trades={trades} />
            </div>
          )}

          {/* P&L Calendar */}
          <div className="mb-4">
            <PnlCalendar trades={allTrades} />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            <StatCard label="Total Trades" value={String(trades.length)} sub={`${closedTrades.length} closed`} icon={Activity} neutral />
            <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} sub={`${wins.length}W / ${losses.length}L`} icon={Target} positive={winRate >= 50} />
            <StatCard label="Total P&L" value={`${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl) >= 10000 ? (totalPnl / 1000).toFixed(2) + 'k' : totalPnl.toFixed(2)}`} sub="All closed" icon={totalPnl >= 0 ? TrendingUp : TrendingDown} positive={totalPnl >= 0} />
            <StatCard label="Avg Win" value={avgWin > 0 ? `$${avgWin.toFixed(2)}` : '—'} sub={`${wins.length} winners`} icon={TrendingUp} positive={avgWin > 0 || undefined} neutral={avgWin === 0} />
            <StatCard label="Avg Loss" value={avgLoss > 0 ? `$${avgLoss.toFixed(2)}` : '—'} sub={`${losses.length} losers`} icon={TrendingDown} positive={avgLoss > 0 ? false : undefined} neutral={avgLoss === 0} />
            <StatCard label="Profit Factor" value={profitFactor > 0 ? profitFactor.toFixed(2) : '—'} sub="Win / loss ratio" icon={DollarSign} positive={profitFactor >= 1.5 || undefined} neutral={profitFactor === 0} />
          </div>

          {/* Top pairs + recent */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="dash-card overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <h2 className="text-sm font-bold text-white">Top Instruments</h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {topPairs.map(([pair, { count, pnl }]) => (
                  <div key={pair} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{pair}</p>
                      <p className="text-xs text-[#444] font-light mt-0.5">{count} trades</p>
                    </div>
                    <span className={`text-sm font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </span>
                  </div>
                ))}
                {topPairs.length === 0 && <p className="text-center text-[#444] text-sm py-10 font-light">No data</p>}
              </div>
            </div>

            <div className="dash-card overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <h2 className="text-sm font-bold text-white">Recent Trades</h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {trades.slice(0, 8).map((trade) => (
                  <div key={trade.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg tracking-wider ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{trade.type}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{trade.pair}</p>
                        <p className="text-xs text-[#444] font-light">{new Date(trade.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    {trade.pnl !== null ? (
                      <span className={`text-sm font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}</span>
                    ) : (
                      <span className="text-xs text-[#333] bg-white/[0.03] px-2 py-1 rounded-lg">Open</span>
                    )}
                  </div>
                ))}
                {trades.length === 0 && <p className="text-center text-[#444] text-sm py-10 font-light">No trades in this period</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DISCIPLINE ── */}
      {tab === 'discipline' && subscribed === false && (
        <ProGate
          title="Behavioral Analysis"
          description="Your discipline score, revenge trading detection, overtrading alerts, and pattern breakdown — all Pro intelligence."
          compact={false}
        />
      )}
      {tab === 'discipline' && subscribed === true && (
        <div className="flex flex-col gap-4 max-w-2xl">
          {/* Score card */}
          <div className="dash-card p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-1">Overall Score</p>
                <p className={`text-6xl font-black tracking-tight ${scoreColor}`}>{discScore}</p>
                <p className="text-xs text-[#444] font-light mt-1">out of 100 · {scoreLabel}</p>
              </div>
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={discScore >= 75 ? '#10b981' : discScore >= 50 ? '#eab308' : '#ef4444'}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${discScore} 100`}
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className={`w-5 h-5 ${scoreColor}`} />
                </div>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="flex flex-col gap-4">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-white">{item.label}</span>
                    <span className="text-xs text-[#444] font-light">{item.pts}/{item.max}pts · {item.tip}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${item.pts / item.max >= 0.75 ? 'bg-emerald-500' : item.pts / item.max >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${(item.pts / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="dash-card p-6">
            <p className="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-4">How to improve</p>
            <div className="flex flex-col gap-3">
              {breakdown[0]?.pts < 20 && <p className="text-sm text-[#888] font-light">📍 Set a stop loss on every trade — it&apos;s the single biggest risk management habit.</p>}
              {breakdown[2]?.pts < 20 && <p className="text-sm text-[#888] font-light">🧘 You&apos;re averaging more than 3 trades/day — quality over quantity always wins.</p>}
              {breakdown[3]?.pts < 20 && <p className="text-sm text-[#888] font-light">⏸️ Take a 30-minute break after a loss before entering another trade.</p>}
              {breakdown[1]?.pts < 20 && <p className="text-sm text-[#888] font-light">🎯 Focus on high probability setups only — a 50%+ win rate is the baseline target.</p>}
              {discScore >= 75 && <p className="text-sm text-emerald-400 font-light">🔥 Excellent discipline! Keep following your rules consistently.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── STREAKS ── */}
      {tab === 'streaks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          <div className="dash-card p-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-400/70" />
              </div>
              <p className="text-xs font-medium text-[#444] uppercase tracking-widest">Current Streak</p>
            </div>
            <p className="text-5xl font-black text-white">{currentStreak}<span className="text-xl text-[#444] font-light ml-1">W</span></p>
            <p className="text-xs text-[#444] font-light">Consecutive wins right now</p>
          </div>

          <div className="dash-card p-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-400/70" />
              </div>
              <p className="text-xs font-medium text-[#444] uppercase tracking-widest">Best Ever</p>
            </div>
            <p className="text-5xl font-black text-white">{bestStreak}<span className="text-xl text-[#444] font-light ml-1">W</span></p>
            <p className="text-xs text-[#444] font-light">Longest win streak all time</p>
          </div>

          <div className="dash-card p-7 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400/70" />
              </div>
              <p className="text-xs font-medium text-[#444] uppercase tracking-widest">Green Days</p>
            </div>
            <p className="text-5xl font-black text-white">{greenDayStreak}<span className="text-xl text-[#444] font-light ml-1">d</span></p>
            <p className="text-xs text-[#444] font-light">Consecutive profitable days</p>
          </div>
        </div>
      )}

      {/* ── WRAP ── */}
      {tab === 'wrap' && (
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="dash-card overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Monthly Wrap</h2>
              <span className="text-[10px] text-[#444] uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Trades', this: thisMonth.trades, last: lastMonth.trades, fmt: (v: number) => String(v) },
                { label: 'Win Rate', this: thisMonth.wr, last: lastMonth.wr, fmt: (v: number) => `${v}%` },
                { label: 'Total P&L', this: thisMonth.pnl, last: lastMonth.pnl, fmt: (v: number) => `${v >= 0 ? '+' : ''}$${Math.abs(v).toFixed(2)}` },
                { label: 'Best Trade', this: thisMonth.best, last: lastMonth.best, fmt: (v: number) => `+$${v.toFixed(2)}` },
              ].map(({ label, this: cur, last: prev, fmt }) => {
                const up = cur >= prev
                return (
                  <div key={label} className="bg-[#080808] border border-white/[0.04] rounded-2xl p-4">
                    <p className="text-[10px] text-[#444] uppercase tracking-widest mb-2">{label}</p>
                    <p className="text-2xl font-black text-white mb-1">{fmt(cur)}</p>
                    <p className={`text-[10px] font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {up ? '▲' : '▼'} vs {fmt(prev)} last month
                    </p>
                  </div>
                )
              })}
            </div>

            {thisMonth.worst < 0 && (
              <div className="mx-6 mb-6 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                <p className="text-[10px] text-[#444] uppercase tracking-widest mb-1">Worst Trade This Month</p>
                <p className="text-xl font-black text-red-400">${thisMonth.worst.toFixed(2)}</p>
              </div>
            )}
          </div>

          {thisMonth.trades === 0 && (
            <p className="text-center text-[#444] text-sm font-light py-4">No trades logged this month yet.</p>
          )}

          {/* Weekly Breakdown */}
          {weeklyWrap.length > 0 && (
            <div className="dash-card overflow-hidden">
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <h2 className="text-sm font-bold text-white">Weekly Breakdown</h2>
                <p className="text-[10px] text-[#444] font-light mt-0.5">Last 12 weeks · exact P&L per week</p>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {weeklyWrap.map((week, i) => {
                  const wr = week.closed > 0 ? Math.round((week.wins / week.closed) * 100) : 0
                  return (
                    <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white">Week of {week.label}</p>
                        <p className="text-[10px] text-[#444] font-light mt-0.5">
                          {week.trades} trade{week.trades !== 1 ? 's' : ''} · {wr}% WR
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-black ${week.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {week.pnl >= 0 ? '+' : ''}${Math.abs(week.pnl).toFixed(2)}
                        </p>
                        {week.best !== 0 && (
                          <p className="text-[10px] text-[#333] font-light mt-0.5">
                            Best: +${week.best.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {tab === 'leaderboard' && (
        <div className="max-w-lg">
          {userRank && (
            <div className="flex items-center gap-3 bg-violet-500/8 border border-violet-500/15 rounded-2xl px-5 py-4 mb-4 text-violet-400 text-sm font-light">
              <Trophy className="w-4 h-4 flex-shrink-0" />
              You are ranked <span className="font-bold text-white ml-1 mr-1">#{userRank}</span> on the leaderboard
            </div>
          )}

          <div className="dash-card overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.05]">
              <h2 className="text-sm font-bold text-white">Global Leaderboard</h2>
              <p className="text-[10px] text-[#444] font-light mt-0.5">Ranked by win rate · min 5 closed trades · anonymous</p>
            </div>

            {lbLoading ? (
              <div className="py-16 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-16 text-center">
                <Trophy className="w-8 h-8 text-[#222] mx-auto mb-3" />
                <p className="text-[#444] text-sm font-light">No traders qualify yet — need 5+ closed trades.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {leaderboard.map((entry) => (
                  <div key={entry.rank} className={`px-6 py-4 flex items-center justify-between ${entry.isYou ? 'bg-violet-500/[0.04]' : ''}`}>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-black w-6 text-center ${entry.rank <= 3 ? 'text-yellow-400' : 'text-[#444]'}`}>
                        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {entry.label}
                          {entry.isYou && <span className="ml-2 text-[10px] text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full">YOU</span>}
                        </p>
                        <p className="text-xs text-[#444] font-light mt-0.5">{entry.totalTrades} trades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{entry.winRate}%</p>
                      <p className={`text-xs font-medium ${entry.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {entry.totalPnl >= 0 ? '+' : ''}${entry.totalPnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-center text-[11px] font-light mt-10" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>KoveFX</p>
    </div>
  )
}
