'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import TradeForm from '@/components/TradeForm'
import TradeTable from '@/components/TradeTable'
import type { Trade } from '@/lib/types'

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [search, setSearch] = useState('')

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

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length
  const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-6 flex items-start justify-between">
        <div>
          <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Journal</p>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Trade Log</h1>
          <p className="text-[#444] text-xs font-light mt-1">
            {trades.length} {trades.length === 1 ? 'trade' : 'trades'} recorded
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-blue gap-2 !px-4 !py-2.5 !min-h-0 h-10 text-xs mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Trade</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Quick stats */}
      {trades.length > 0 && (
        <div className="px-4 md:px-8 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Trades', value: String(trades.length), color: 'text-white' },
              { label: 'Win Rate', value: `${winRate}%`, color: winRate >= 50 ? 'text-emerald-400' : 'text-red-400' },
              {
                label: 'P&L',
                value: `${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl) >= 1000 ? (totalPnl / 1000).toFixed(1) + 'k' : totalPnl.toFixed(0)}`,
                color: totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#0f0f0f] border border-white/[0.05] rounded-2xl px-4 py-4">
                <p className="text-[10px] text-[#444] mb-2 uppercase tracking-widest font-medium">{label}</p>
                <p className={`text-2xl md:text-3xl font-black tracking-tight ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="px-4 md:px-8">
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl overflow-hidden">
          {/* Search */}
          {trades.length > 0 && (
            <div className="px-4 md:px-6 py-4 border-b border-white/[0.04]">
              <div className="relative max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#333]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pair or notes…"
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
      </div>

      {showForm && (
        <TradeForm trade={editingTrade} onClose={handleClose} onSuccess={handleSuccess} />
      )}
    </div>
  )
}
