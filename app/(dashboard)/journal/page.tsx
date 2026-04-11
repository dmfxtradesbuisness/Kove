'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Search, CalendarDays, TableProperties } from 'lucide-react'
import TradeForm from '@/components/TradeForm'
import TradeTable from '@/components/TradeTable'
import type { Trade } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtPnl(pnl: number): string {
  const abs = Math.abs(pnl)
  if (abs >= 10000) return `${pnl >= 0 ? '+' : '-'}$${(abs / 1000).toFixed(1)}k`
  return `${pnl >= 0 ? '+' : '-'}$${abs.toFixed(2)}`
}

function fmtPnlCompact(pnl: number): string {
  const abs = Math.abs(pnl)
  if (abs >= 1000) return `${pnl >= 0 ? '+' : '-'}${(abs / 1000).toFixed(1)}k`
  return `${pnl >= 0 ? '+' : '-'}${abs.toFixed(0)}`
}

// ─── P&L Calendar (Topstep-style) ────────────────────────────────────────────
function PnlCalendar({ trades }: { trades: Trade[] }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  // Build day → P&L map
  const dayMap = useMemo(() => {
    const map: Record<string, number> = {}
    trades.forEach((t) => {
      if (t.pnl === null) return
      const d = new Date(t.created_at)
      if (d.getMonth() !== month || d.getFullYear() !== year) return
      const key = d.getDate().toString()
      map[key] = (map[key] ?? 0) + t.pnl
    })
    return map
  }, [trades, month, year])

  const firstDay = new Date(year, month, 1).getDay() // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Monthly total
  const monthTotal = Object.values(dayMap).reduce((s, v) => s + v, 0)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  // Build rows: each row = 7 cells (Sun–Sat) + weekly total
  const allCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (allCells.length % 7 !== 0) allCells.push(null)
  const rows: (number | null)[][] = []
  for (let i = 0; i < allCells.length; i += 7) {
    rows.push(allCells.slice(i, i + 7))
  }

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="overflow-hidden rounded-[10px] mb-4" style={{ background: 'var(--surface-1)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">{monthName}</h2>
          {Object.keys(dayMap).length > 0 && (
            <p className={`text-xs font-black mt-0.5 ${monthTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmtPnl(monthTotal)} this month
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-[#444] hover:text-white hover:bg-white/[0.05] transition-all text-base leading-none"
          >
            ‹
          </button>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-[#444] hover:text-white hover:bg-white/[0.05] transition-all text-base leading-none"
          >
            ›
          </button>
        </div>
      </div>

      <div className="p-3 md:p-4 overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 min-w-[400px]">
          <thead>
            <tr>
              {DAYS.map((d) => (
                <th key={d} className="text-center text-[10px] font-medium text-[#333] uppercase tracking-wider pb-1 w-[calc(100%/8)]">
                  {d}
                </th>
              ))}
              <th className="text-center text-[10px] font-medium text-[#333] uppercase tracking-wider pb-1 w-[calc(100%/8)]">
                Week
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              const weekPnl = row.reduce((sum: number, day) => {
                if (day === null) return sum
                return sum + (dayMap[day.toString()] ?? 0)
              }, 0)
              const weekHasData = row.some((day) => day !== null && dayMap[day.toString()] !== undefined)

              return (
                <tr key={rIdx}>
                  {row.map((day, cIdx) => {
                    if (day === null) {
                      return <td key={`e-${rIdx}-${cIdx}`} className="h-12 md:h-14" />
                    }
                    const pnl = dayMap[day.toString()]
                    const hasData = pnl !== undefined
                    const isToday =
                      day === now.getDate() &&
                      month === now.getMonth() &&
                      year === now.getFullYear()

                    return (
                      <td key={day} className="p-0">
                        <div
                          className={`h-12 md:h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                            hasData
                              ? pnl >= 0
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'bg-red-500/10 border border-red-500/20'
                              : 'bg-white/[0.02] border border-transparent'
                          } ${isToday ? 'ring-1 ring-violet-500/40' : ''}`}
                        >
                          <span className={`text-[11px] font-medium leading-none mb-0.5 ${
                            isToday ? 'text-violet-400' : hasData ? 'text-white' : 'text-[#2a2a2a]'
                          }`}>
                            {day}
                          </span>
                          {hasData && (
                            <span className={`text-[9px] font-bold leading-none ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {fmtPnlCompact(pnl)}
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                  {/* Weekly total */}
                  <td className="p-0 pl-1">
                    <div className={`h-12 md:h-14 rounded-xl flex flex-col items-center justify-center border ${
                      weekHasData
                        ? weekPnl >= 0
                          ? 'bg-emerald-500/5 border-emerald-500/10'
                          : 'bg-red-500/5 border-red-500/10'
                        : 'border-transparent'
                    }`}>
                      {weekHasData && (
                        <>
                          <span className="text-[8px] text-[#333] uppercase tracking-wider font-medium leading-none mb-0.5">Wk</span>
                          <span className={`text-[10px] font-black leading-none ${weekPnl >= 0 ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                            {fmtPnlCompact(weekPnl)}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/30" />
            <span className="text-[10px] text-[#444] font-light">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-500/20 border border-red-500/30" />
            <span className="text-[10px] text-[#444] font-light">Loss</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] text-[#333] font-light">Week column = weekly total</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'table' | 'calendar'>('table')

  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch('/api/trades')
      const data = await res.json()
      if (data.trades) setTrades(data.trades)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  function handleSuccess(trade: Trade) {
    setTrades((prev) => {
      const exists = prev.find((t) => t.id === trade.id)
      if (exists) return prev.map((t) => (t.id === trade.id ? trade : t))
      return [trade, ...prev]
    })
    setShowForm(false)
    setEditingTrade(null)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/trades/${id}`, { method: 'DELETE' })
    setTrades((prev) => prev.filter((t) => t.id !== id))
  }

  function handleEdit(trade: Trade) {
    setEditingTrade(trade)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditingTrade(null)
  }

  const filtered = trades.filter(
    (t) =>
      !search ||
      t.pair.toLowerCase().includes(search.toLowerCase()) ||
      t.notes?.toLowerCase().includes(search.toLowerCase())
  )

  const closedTrades = trades.filter((t) => t.pnl !== null)
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0).length
  const winRate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-6 flex items-start justify-between">
        <div>
          <p className="page-label">Journal</p>
          <h1 className="page-title">Trade Log</h1>
          <p className="text-xs font-light mt-1" style={{ color: 'var(--text-3)' }}>
            {trades.length} {trades.length === 1 ? 'trade' : 'trades'} recorded
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {/* View toggle */}
          <div className="flex items-center bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('table')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                view === 'table' ? 'bg-white/[0.08] text-white' : 'text-[#444] hover:text-[#888]'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                view === 'calendar' ? 'bg-white/[0.08] text-white' : 'text-[#444] hover:text-[#888]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="btn-blue gap-2 !px-4 !py-2.5 !min-h-0 h-10 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Trade</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Quick stats */}
      {trades.length > 0 && (
        <div className="px-4 md:px-8 mb-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Trades', value: String(trades.length), color: 'text-white' },
              {
                label: 'Win Rate',
                value: `${winRate}%`,
                color: winRate >= 50 ? 'text-emerald-400' : 'text-red-400',
              },
              {
                label: 'Total P&L',
                value: fmtPnl(totalPnl),
                color: totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="stat-tile px-4 py-4">
                <p className="stat-tile-label">{label}</p>
                <p className={`stat-tile-value ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar or Table */}
      <div className="px-4 md:px-8">
        {view === 'calendar' ? (
          <PnlCalendar trades={trades} />
        ) : (
          <div className="overflow-hidden rounded-[10px]" style={{ background: 'var(--surface-1)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Search */}
            {trades.length > 0 && (
              <div className="px-4 md:px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="relative max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#333]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search instrument or notes…"
                    className="input pl-9 !min-h-0 h-10 !text-xs !rounded-xl !py-2.5"
                  />
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
              </div>
            ) : (
              <TradeTable trades={filtered} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        )}
      </div>

      {showForm && (
        <TradeForm trade={editingTrade} onClose={handleClose} onSuccess={handleSuccess} />
      )}
    </div>
  )
}
