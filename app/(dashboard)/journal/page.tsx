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

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trade Journal</h1>
          <p className="text-[#555] text-sm mt-1">
            {trades.length} {trades.length === 1 ? 'trade' : 'trades'} logged
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Trade
        </button>
      </div>

      {/* Quick stats */}
      {trades.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card px-5 py-4">
            <p className="text-xs text-[#555] mb-1 uppercase tracking-wider font-medium">
              Total Trades
            </p>
            <p className="text-2xl font-bold text-white">{trades.length}</p>
          </div>
          <div className="card px-5 py-4">
            <p className="text-xs text-[#555] mb-1 uppercase tracking-wider font-medium">
              Win Rate
            </p>
            <p className="text-2xl font-bold text-white">{winRate}%</p>
          </div>
          <div className="card px-5 py-4">
            <p className="text-xs text-[#555] mb-1 uppercase tracking-wider font-medium">
              Total P&L
            </p>
            <p
              className={`text-2xl font-bold ${
                totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="card overflow-hidden">
        {/* Search bar */}
        {trades.length > 0 && (
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by pair or notes..."
                className="input pl-9"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <TradeTable
            trades={filtered}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <TradeForm
          trade={editingTrade}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
