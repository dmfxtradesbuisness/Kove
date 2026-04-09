'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, BarChart2 } from 'lucide-react'
import type { Trade } from '@/lib/types'

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

export default function StatsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/trades')
      .then((r) => r.json())
      .then((d) => { if (d.trades) setTrades(d.trades) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

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

  if (trades.length === 0) {
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
      <div className="mb-8 md:mb-10">
        <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Overview</p>
        <div className="flex items-end justify-between">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Statistics</h1>
          <p className="text-[#444] text-xs font-light">
            {closedTrades.length} closed {closedTrades.length === 1 ? 'trade' : 'trades'}
          </p>
        </div>
      </div>

      {/* Stat cards — big numbers like reference */}
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
            <h2 className="text-sm font-bold text-white tracking-tight">Top Pairs</h2>
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
              <p className="text-center text-[#444] text-sm py-10 font-light">No pair data</p>
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
          </div>
        </div>
      </div>
    </div>
  )
}
