'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, BarChart2 } from 'lucide-react'
import type { Trade } from '@/lib/types'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = 'default',
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color?: 'default' | 'green' | 'red' | 'blue'
}) {
  const iconColors = {
    default: 'text-[#555] bg-white/5',
    green: 'text-emerald-400 bg-emerald-500/10',
    red: 'text-red-400 bg-red-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium text-[#555] uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[#555] mt-1.5">{sub}</p>}
    </div>
  )
}

export default function StatsPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/trades')
      .then((r) => r.json())
      .then((d) => {
        if (d.trades) setTrades(d.trades)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const closedTrades = trades.filter((t) => t.pnl !== null)
  const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0)
  const losses = closedTrades.filter((t) => (t.pnl ?? 0) < 0)
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const winRate =
    closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0
  const avgWin =
    wins.length > 0
      ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length
      : 0
  const avgLoss =
    losses.length > 0
      ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length)
      : 0
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0

  const pairStats = trades.reduce<Record<string, { count: number; pnl: number }>>((acc, t) => {
    if (!acc[t.pair]) acc[t.pair] = { count: 0, pnl: 0 }
    acc[t.pair].count++
    acc[t.pair].pnl += t.pnl ?? 0
    return acc
  }, {})

  const topPairs = Object.entries(pairStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)

  const recentTrades = [...trades].slice(0, 10)

  if (trades.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Statistics</h1>
          <p className="text-[#555] text-sm mt-1">Performance overview</p>
        </div>
        <div className="card p-16 text-center">
          <BarChart2 className="w-10 h-10 text-[#333] mx-auto mb-4" />
          <p className="text-[#555] text-sm">
            No trades yet. Log your first trade to see stats.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Statistics</h1>
        <p className="text-[#555] text-sm mt-1">
          Based on {closedTrades.length} closed {closedTrades.length === 1 ? 'trade' : 'trades'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Trades"
          value={String(trades.length)}
          sub={`${closedTrades.length} closed`}
          icon={Activity}
          color="blue"
        />
        <StatCard
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          sub={`${wins.length}W / ${losses.length}L`}
          icon={Target}
          color={winRate >= 50 ? 'green' : 'red'}
        />
        <StatCard
          label="Total P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`}
          sub="All closed trades"
          icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          color={totalPnl >= 0 ? 'green' : 'red'}
        />
        <StatCard
          label="Avg Win"
          value={avgWin > 0 ? `+$${avgWin.toFixed(2)}` : '—'}
          sub={`${wins.length} winning trades`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Avg Loss"
          value={avgLoss > 0 ? `-$${avgLoss.toFixed(2)}` : '—'}
          sub={`${losses.length} losing trades`}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          label="Profit Factor"
          value={profitFactor > 0 ? profitFactor.toFixed(2) : '—'}
          sub="Avg win / avg loss"
          icon={DollarSign}
          color={profitFactor >= 1.5 ? 'green' : profitFactor > 0 ? 'default' : 'default'}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top pairs */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-semibold text-white">Top Pairs</h2>
          </div>
          <div className="divide-y divide-[#111]">
            {topPairs.map(([pair, { count, pnl }]) => (
              <div key={pair} className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{pair}</p>
                  <p className="text-xs text-[#555]">{count} trades</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                </span>
              </div>
            ))}
            {topPairs.length === 0 && (
              <p className="text-center text-[#555] text-sm py-8">No pair data</p>
            )}
          </div>
        </div>

        {/* Recent trades */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-semibold text-white">Recent Trades</h2>
          </div>
          <div className="divide-y divide-[#111]">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      trade.type === 'BUY'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {trade.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{trade.pair}</p>
                    <p className="text-xs text-[#555]">
                      {new Date(trade.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {trade.pnl !== null ? (
                  <span
                    className={`text-sm font-semibold ${
                      trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-xs text-[#444]">Open</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
