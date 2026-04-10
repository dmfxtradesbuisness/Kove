'use client'

import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, BarChart2 } from 'lucide-react'
import type { Trade } from '@/lib/types'

// ─── Time filter helpers ──────────────────────────────────────────────────────
type Period = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

const PERIODS: { label: string; key: Period }[] = [
  { label: '1D', key: '1D' },
  { label: '1W', key: '1W' },
  { label: '1M', key: '1M' },
  { label: '3M', key: '3M' },
  { label: '1Y', key: '1Y' },
  { label: 'All', key: 'ALL' },
]

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

// ─── Equity Curve SVG ─────────────────────────────────────────────────────────
function EquityCurve({ trades }: { trades: Trade[] }) {
  const closed = [...trades]
    .filter((t) => t.pnl !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  if (closed.length < 2) {
    return (
      <div className="h-[120px] flex items-center justify-center text-[#333] text-xs font-light">
        Not enough closed trades to show curve
      </div>
    )
  }

  // Build cumulative P&L
  let cum = 0
  const points = [0, ...closed.map((t) => { cum += t.pnl ?? 0; return cum })]
  const minV = Math.min(...points)
  const maxV = Math.max(...points)
  const range = maxV - minV || 1
  const W = 400
  const H = 110
  const PAD = 8

  const toX = (i: number) => (i / (points.length - 1)) * W
  const toY = (v: number) => H - PAD - ((v - minV) / range) * (H - PAD * 2)

  const pathD = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ')
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`

  const isUp = points[points.length - 1] >= 0
  const lineColor = isUp ? '#10b981' : '#ef4444'
  const stopColor = isUp ? '#10b981' : '#ef4444'
  const zeroY = toY(0)
  const showZero = minV < 0 && maxV > 0

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[110px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stopColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stopColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {showZero && (
          <line
            x1="0" y1={zeroY.toFixed(1)}
            x2={W} y2={zeroY.toFixed(1)}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )}
        <path d={areaD} fill="url(#equityGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  positive,
  neutral,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  positive?: boolean
  neutral?: boolean
}) {
  const valueColor = neutral
    ? 'text-white'
    : positive === true
    ? 'text-emerald-400'
    : positive === false
    ? 'text-red-400'
    : 'text-white'

  return (
    <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6 md:p-7 flex flex-col gap-5 hover:border-white/[0.08] transition-colors animate-fade-in-up">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-medium text-[#444] uppercase tracking-widest">{label}</p>
        <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-[#444]" />
        </div>
      </div>
      <div>
        <p className={`text-4xl md:text-5xl font-black tracking-tight ${valueColor}`}>{value}</p>
        {sub && <p className="text-xs text-[#444] mt-2 font-light">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StatsPage() {
  const [allTrades, setAllTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('ALL')

  useEffect(() => {
    fetch('/api/trades')
      .then((r) => r.json())
      .then((d) => { if (d.trades) setAllTrades(d.trades) })
      .finally(() => setLoading(false))
  }, [])

  const trades = useMemo(() => filterByPeriod(allTrades, period), [allTrades, period])

  const closedTrades = trades.filter((t) => t.pnl !== null)
  const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0)
  const losses = closedTrades.filter((t) => (t.pnl ?? 0) < 0)
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : 0
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0

  const pairStats = trades.reduce<Record<string, { count: number; pnl: number }>>((acc, t) => {
    if (!acc[t.pair]) acc[t.pair] = { count: 0, pnl: 0 }
    acc[t.pair].count++
    acc[t.pair].pnl += t.pnl ?? 0
    return acc
  }, {})
  const topPairs = Object.entries(pairStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5)
  const recentTrades = [...trades].slice(0, 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  if (allTrades.length === 0) {
    return (
      <div className="px-4 md:px-8 pt-6 md:pt-10">
        <div className="mb-8">
          <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Overview</p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Statistics</h1>
        </div>
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-16 text-center">
          <BarChart2 className="w-10 h-10 text-[#222] mx-auto mb-4" />
          <p className="text-[#444] text-sm font-light">No trades yet. Log your first trade to see stats.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Overview</p>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Statistics</h1>
          <p className="text-[#444] text-xs font-light">
            {closedTrades.length} closed {closedTrades.length === 1 ? 'trade' : 'trades'}
          </p>
        </div>
      </div>

      {/* Time filter bar */}
      <div className="flex items-center gap-1.5 mb-6 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-1.5 w-fit">
        {PERIODS.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
              period === key
                ? 'bg-white/[0.08] text-white'
                : 'text-[#444] hover:text-[#888]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Equity Curve */}
      {closedTrades.length >= 2 && (
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6 mb-4 md:mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-1">Equity Curve</p>
              <p className={`text-2xl font-black tracking-tight ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl) >= 1000 ? (totalPnl / 1000).toFixed(2) + 'k' : totalPnl.toFixed(2)}
              </p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              totalPnl >= 0
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
            }`}>
              {wins.length}W / {losses.length}L
            </span>
          </div>
          <EquityCurve trades={trades} />
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <StatCard
          label="Total Trades"
          value={String(trades.length)}
          sub={`${closedTrades.length} closed`}
          icon={Activity}
          neutral
        />
        <StatCard
          label="Win Rate"
          value={`${winRate.toFixed(0)}%`}
          sub={`${wins.length}W  /  ${losses.length}L`}
          icon={Target}
          positive={winRate >= 50}
        />
        <StatCard
          label="Total P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl) >= 1000 ? (totalPnl / 1000).toFixed(1) + 'k' : totalPnl.toFixed(0)}`}
          sub="All closed trades"
          icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          positive={totalPnl >= 0}
        />
        <StatCard
          label="Avg Win"
          value={avgWin > 0 ? `$${avgWin.toFixed(0)}` : '—'}
          sub={`${wins.length} winning trades`}
          icon={TrendingUp}
          positive={avgWin > 0 ? true : undefined}
          neutral={avgWin === 0}
        />
        <StatCard
          label="Avg Loss"
          value={avgLoss > 0 ? `$${avgLoss.toFixed(0)}` : '—'}
          sub={`${losses.length} losing trades`}
          icon={TrendingDown}
          positive={avgLoss > 0 ? false : undefined}
          neutral={avgLoss === 0}
        />
        <StatCard
          label="Profit Factor"
          value={profitFactor > 0 ? profitFactor.toFixed(2) : '—'}
          sub="Avg win / avg loss"
          icon={DollarSign}
          positive={profitFactor >= 1.5 ? true : undefined}
          neutral={profitFactor === 0}
        />
      </div>

      {/* Bottom panels */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top pairs */}
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.05]">
            <h2 className="text-sm font-bold text-white tracking-tight">Top Instruments</h2>
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
            {topPairs.length === 0 && (
              <p className="text-center text-[#444] text-sm py-10 font-light">No data for this period</p>
            )}
          </div>
        </div>

        {/* Recent trades */}
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.05]">
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Trades</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg tracking-wider ${
                    trade.type === 'BUY'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {trade.type}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{trade.pair}</p>
                    <p className="text-xs text-[#444] font-light mt-0.5">
                      {new Date(trade.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                {trade.pnl !== null ? (
                  <span className={`text-sm font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-xs text-[#333] bg-white/[0.03] px-2 py-1 rounded-lg">Open</span>
                )}
              </div>
            ))}
            {recentTrades.length === 0 && (
              <p className="text-center text-[#444] text-sm py-10 font-light">No trades in this period</p>
            )}
          </div>
        </div>
      </div>

      {/* DMFX footer */}
      <p className="text-center text-[#2a2a2a] text-[11px] font-light mt-8">
        KoveFX by DMFX · Trading ecosystem
      </p>
    </div>
  )
}
