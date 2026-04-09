'use client'

import { useState } from 'react'
import { Pencil, Trash2, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react'
import type { Trade } from '@/lib/types'

interface TradeTableProps {
  trades: Trade[]
  onEdit: (trade: Trade) => void
  onDelete: (id: string) => void
}

type SortKey = 'created_at' | 'pair' | 'pnl' | 'type'
type SortDir = 'asc' | 'desc'

export default function TradeTable({ trades, onEdit, onDelete }: TradeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...trades].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'pnl') {
      return ((a.pnl ?? 0) - (b.pnl ?? 0)) * dir
    }
    if (sortKey === 'created_at') {
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir
    }
    return (a[sortKey] > b[sortKey] ? 1 : -1) * dir
  })

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return <ChevronUp className="w-3 h-3 text-[#333]" />
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-blue-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-400" />
    )
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-16 text-[#555]">
        <p className="text-sm">No trades logged yet. Click &quot;Log Trade&quot; to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1a1a1a]">
            {[
              { label: 'Date', key: 'created_at' as SortKey },
              { label: 'Pair', key: 'pair' as SortKey },
              { label: 'Type', key: 'type' as SortKey },
              { label: 'Entry', key: null },
              { label: 'Exit', key: null },
              { label: 'SL', key: null },
              { label: 'TP', key: null },
              { label: 'Lots', key: null },
              { label: 'P&L', key: 'pnl' as SortKey },
              { label: '', key: null },
            ].map(({ label, key }) => (
              <th
                key={label}
                onClick={() => key && handleSort(key)}
                className={`text-left px-4 py-3 text-xs font-medium text-[#555] uppercase tracking-wider whitespace-nowrap ${key ? 'cursor-pointer hover:text-white select-none' : ''}`}
              >
                <span className="flex items-center gap-1">
                  {label}
                  {key && <SortIcon col={key} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((trade) => (
            <tr
              key={trade.id}
              className="border-b border-[#111] hover:bg-white/[0.02] transition-colors group"
            >
              <td className="px-4 py-3.5 text-[#666] whitespace-nowrap">
                {new Date(trade.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3.5 text-white font-medium">{trade.pair}</td>
              <td className="px-4 py-3.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    trade.type === 'BUY'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {trade.type}
                </span>
              </td>
              <td className="px-4 py-3.5 text-[#ccc] font-mono text-xs">
                {trade.entry_price}
              </td>
              <td className="px-4 py-3.5 text-[#ccc] font-mono text-xs">
                {trade.exit_price ?? <span className="text-[#444]">—</span>}
              </td>
              <td className="px-4 py-3.5 text-[#ccc] font-mono text-xs">
                {trade.stop_loss ?? <span className="text-[#444]">—</span>}
              </td>
              <td className="px-4 py-3.5 text-[#ccc] font-mono text-xs">
                {trade.take_profit ?? <span className="text-[#444]">—</span>}
              </td>
              <td className="px-4 py-3.5 text-[#ccc] font-mono text-xs">
                {trade.lot_size ?? <span className="text-[#444]">—</span>}
              </td>
              <td className="px-4 py-3.5 font-semibold">
                {trade.pnl !== null ? (
                  <span
                    className={
                      trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }
                  >
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-[#444]">—</span>
                )}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {trade.screenshot_url && (
                    <a
                      href={trade.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-[#555] hover:text-white hover:bg-white/5 transition-all"
                      title="View screenshot"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => onEdit(trade)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-[#555] hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {confirmDelete === trade.id ? (
                    <button
                      onClick={() => {
                        onDelete(trade.id)
                        setConfirmDelete(null)
                      }}
                      className="px-2 h-7 text-xs rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(trade.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
