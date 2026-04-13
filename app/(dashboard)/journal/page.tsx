'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Search, BarChart2, Images, Sparkles, Bell, ListChecks, ChevronDown, Trash2 } from 'lucide-react'
import Link from 'next/link'
import TradeForm from '@/components/TradeForm'
import TradeTable from '@/components/TradeTable'
import type { Trade } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── P&L Line Chart ───────────────────────────────────────────────────────────
function PnlChart({ trades }: { trades: Trade[] }) {
  const points = useMemo(() => {
    const closed = trades
      .filter((t) => t.pnl !== null)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-40)
    let cum = 0
    return closed.map((t) => { cum += t.pnl!; return cum })
  }, [trades])

  if (points.length < 2) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: '140px', color: 'rgba(255,255,255,0.14)', fontSize: '13px', fontFamily: 'var(--font-display)' }}
      >
        Log trades to see your equity curve
      </div>
    )
  }

  const W = 600; const H = 140; const PAD = 16
  const min = Math.min(0, ...points)
  const max = Math.max(0, ...points)
  const range = max - min || 1
  const xS = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2)
  const yS = (v: number) => PAD + (1 - (v - min) / range) * (H - PAD * 2)
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xS(i).toFixed(1)} ${yS(p).toFixed(1)}`).join(' ')
  const area = `${d} L ${xS(points.length - 1).toFixed(1)} ${H} L ${xS(0).toFixed(1)} ${H} Z`
  const last = points[points.length - 1]
  const color = last >= 0 ? '#34D399' : '#F87171'
  const zero = yS(0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '140px', display: 'block' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {zero > PAD && zero < H - PAD && (
        <line x1={PAD} y1={zero} x2={W - PAD} y2={zero} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4 4" />
      )}
      <path d={area} fill="url(#chartGrad)" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xS(points.length - 1)} cy={yS(last)} r="4" fill={color} />
    </svg>
  )
}

// ─── P&L Calendar ─────────────────────────────────────────────────────────────
function PnlCalendar({ trades }: { trades: Trade[] }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

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

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthTotal = Object.values(dayMap).reduce((s, v) => s + v, 0)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1)
  }

  const allCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (allCells.length % 7 !== 0) allCells.push(null)
  const rows: (number | null)[][] = []
  for (let i = 0; i < allCells.length; i += 7) rows.push(allCells.slice(i, i + 7))
  const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{monthName}</h3>
          {Object.keys(dayMap).length > 0 && (
            <p style={{ fontSize: '11px', fontWeight: 700, color: monthTotal >= 0 ? '#34D399' : '#F87171', margin: 0, marginTop: '1px' }}>
              {fmtPnl(monthTotal)} this month
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[['‹', prevMonth], ['›', nextMonth]].map(([ch, fn]) => (
            <button
              key={ch as string}
              onClick={fn as () => void}
              className="w-6 h-6 rounded flex items-center justify-center transition-all text-sm"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#fff'; ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'; ;(e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {ch as string}
            </button>
          ))}
        </div>
      </div>
      <div className="p-3">
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '2px' }}>
          <thead>
            <tr>
              {DAYS.map((d, i) => (
                <th key={i} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '4px' }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((day, cIdx) => {
                  if (day === null) return <td key={`e-${rIdx}-${cIdx}`} style={{ height: '34px' }} />
                  const pnl = dayMap[day.toString()]
                  const hasData = pnl !== undefined
                  const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
                  return (
                    <td key={day} style={{ padding: 0 }}>
                      <div style={{
                        height: '34px', borderRadius: '6px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: hasData ? (pnl >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)') : 'rgba(255,255,255,0.02)',
                        border: isToday ? '1px solid rgba(139,124,248,0.5)' : hasData ? `1px solid ${pnl >= 0 ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` : '1px solid transparent',
                      }}>
                        <span style={{ fontSize: '10px', fontWeight: 500, color: isToday ? '#8B7CF8' : hasData ? '#fff' : 'rgba(255,255,255,0.18)', lineHeight: 1 }}>{day}</span>
                        {hasData && (
                          <span style={{ fontSize: '8px', fontWeight: 700, color: pnl >= 0 ? '#34D399' : '#F87171', lineHeight: 1 }}>{fmtPnlCompact(pnl)}</span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Pre-Trade Checklist ───────────────────────────────────────────────────────
function ChecklistWidget() {
  const [items, setItems] = useState<{ id: string; label: string }[]>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [name, setName] = useState('Pre-Trade Checklist')
  const [editing, setEditing] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/checklist')
      .then((r) => r.json())
      .then((d) => {
        if (d.checklist) setName(d.checklist.name || 'Pre-Trade Checklist')
        if (d.items?.length) setItems(d.items.map((i: { id: string; label: string }) => ({ id: i.id, label: i.label })))
      })
      .finally(() => setLoading(false))
  }, [])

  async function saveChecklist(updatedItems: { label: string }[]) {
    setSaving(true)
    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, items: updatedItems.map((i) => i.label) }),
    })
    const d = await res.json()
    if (d.items) setItems(d.items.map((i: { id: string; label: string }) => ({ id: i.id, label: i.label })))
    setSaving(false)
  }

  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function removeItem(id: string) {
    const updated = items.filter((i) => i.id !== id)
    setItems(updated)
    saveChecklist(updated)
  }

  async function addItem() {
    if (!newLabel.trim()) return
    const updated = [...items, { id: Date.now().toString(), label: newLabel.trim() }]
    setItems(updated)
    setNewLabel('')
    await saveChecklist(updated)
  }

  const allChecked = items.length > 0 && items.every((i) => checked.has(i.id))

  if (loading) {
    return (
      <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px' }}>
        <div className="w-4 h-4 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <ListChecks className="w-3.5 h-3.5" style={{ color: allChecked && items.length > 0 ? '#34D399' : 'rgba(255,255,255,0.35)' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{name}</h3>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px' }}
          onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#fff'; ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; ;(e.currentTarget as HTMLElement).style.background = 'none' }}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

      <div className="px-4 py-3">
        {items.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '8px 0' }}>
            Add checklist items below
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5 group">
                <button
                  onClick={() => toggleCheck(item.id)}
                  className="flex-shrink-0 w-4 h-4 rounded transition-all"
                  style={{
                    border: checked.has(item.id) ? '2px solid #34D399' : '2px solid rgba(255,255,255,0.18)',
                    background: checked.has(item.id) ? '#34D399' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {checked.has(item.id) && <span style={{ fontSize: '8px', color: '#000', fontWeight: 700 }}>✓</span>}
                </button>
                <span style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  color: checked.has(item.id) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.65)',
                  textDecoration: checked.has(item.id) ? 'line-through' : 'none',
                  flex: 1,
                  lineHeight: 1.4,
                }}>
                  {item.label}
                </span>
                {editing && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {allChecked && items.length > 0 && (
          <p style={{ fontSize: '11px', color: '#34D399', fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: '10px', textAlign: 'center' }}>
            ✓ All checks passed
          </p>
        )}

        {/* Add item */}
        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addItem() }}
            placeholder="Add item…"
            style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: '#fff',
              fontFamily: 'var(--font-body)', outline: 'none',
            }}
          />
          <button
            onClick={addItem}
            disabled={saving}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px',
              padding: '5px 10px', fontSize: '11px', fontFamily: 'var(--font-display)',
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {saving ? '…' : '+ Add'}
          </button>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => setChecked(new Set())}
            style={{ marginTop: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', padding: 0 }}
            onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
            onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)' }}
          >
            Reset checks
          </button>
        )}
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
  const [showSearch, setShowSearch] = useState(false)

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
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Top Header ── */}
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Journal
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.28)', margin: 0, marginTop: '2px' }}>
            Track your edge, every trade.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Desktop search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.22)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trades…"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                height: '36px',
                paddingLeft: '32px',
                paddingRight: '12px',
                fontSize: '12px',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                width: '200px',
                outline: 'none',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(108,93,211,0.4)' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
            />
          </div>
          {/* Bell */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#fff'; ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)' }}
            onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <Bell className="w-4 h-4" />
          </button>
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #7B6CF5, #5C4ED4)', color: '#fff', fontFamily: 'var(--font-display)' }}
          >
            K
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 p-5 md:p-6">

        {/* Quick Actions */}
        <div className="mb-5">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Quick-Action
          </p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 h-10 rounded-lg text-[13px] font-semibold transition-all duration-150"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'var(--accent)',
                border: 'none',
                color: '#fff',
                boxShadow: '0 0 20px rgba(108,93,211,0.35)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.background = '#8B7CF8' }}
              onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.background = 'var(--accent)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Log Trade
            </button>
            {[
              { icon: BarChart2, label: 'Statistics', href: '/stats' },
              { icon: Sparkles, label: 'AI Analysis', href: '/ai' },
              { icon: Images, label: 'Gallery', href: '/gallery' },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 px-4 h-10 rounded-lg text-[13px] font-medium transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)',
                }}
                onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#fff'; ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)' }}
                onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Stat Tiles */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Trades', value: String(trades.length), sub: `${closedTrades.length} closed`, color: '#fff' },
            { label: 'Win Rate', value: `${winRate}%`, sub: `${wins} wins`, color: winRate >= 50 ? '#34D399' : '#F87171' },
            { label: 'Total P&L', value: closedTrades.length > 0 ? fmtPnl(totalPnl) : '—', sub: 'all time', color: totalPnl >= 0 ? '#34D399' : '#F87171' },
          ].map(({ label, value, sub, color }) => (
            <div
              key={label}
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px 18px' }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', margin: '0 0 8px 0' }}>
                {label}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color, letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
                {value}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px', margin: '4px 0 0 0' }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Main grid: chart + right sidebar */}
        <div className="flex gap-4 mb-5">

          {/* Performance Chart */}
          <div
            className="flex-1 min-w-0"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '18px' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                  Performance
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '2px', margin: '2px 0 0 0' }}>{today}</p>
              </div>
              {closedTrades.length > 0 && (
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                  color: totalPnl >= 0 ? '#34D399' : '#F87171',
                  background: totalPnl >= 0 ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                  border: `1px solid ${totalPnl >= 0 ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)'}`,
                  borderRadius: '6px', padding: '4px 10px',
                }}>
                  {fmtPnl(totalPnl)}
                </div>
              )}
            </div>
            <PnlChart trades={trades} />
            {closedTrades.length > 0 && (
              <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34D399' }} />
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-display)' }}>Equity curve</span>
                </div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-body)' }}>Last {Math.min(40, closedTrades.length)} closed trades · cumulative P&L</span>
              </div>
            )}
          </div>

          {/* Right column: Calendar + Checklist */}
          <div className="w-[260px] shrink-0 hidden lg:flex flex-col gap-4">
            <PnlCalendar trades={trades} />
            <ChecklistWidget />
          </div>
        </div>

        {/* Trade Table */}
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
              Trade Log
            </h2>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Mobile search */}
          <div className="md:hidden px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trades…"
                className="input pl-9 !min-h-0 h-10 !text-xs !rounded-lg !py-2.5 w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
          ) : (
            <TradeTable trades={filtered} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>

        {/* Mobile: Calendar + Checklist stacked */}
        <div className="lg:hidden flex flex-col gap-4 mt-4">
          <PnlCalendar trades={trades} />
          <ChecklistWidget />
        </div>
      </div>

      {showForm && (
        <TradeForm trade={editingTrade} onClose={handleClose} onSuccess={handleSuccess} />
      )}
    </div>
  )
}
