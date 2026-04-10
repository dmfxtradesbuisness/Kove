'use client'

import { useState, useEffect } from 'react'
import { Loader2, Target, TrendingUp, ShieldAlert, Sparkles, Lock } from 'lucide-react'

interface Goals {
  monthly_pnl_target: number | null
  win_rate_target: number | null
  max_drawdown_target: number | null
  notes: string | null
}

interface Trade {
  pnl: number | null
  created_at: string
}

function ProgressBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  const done = pct >= 100
  return (
    <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-emerald-500' : color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goals | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [subscription, setSubscription] = useState<{ active: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ monthly_pnl_target: '', win_rate_target: '', max_drawdown_target: '', notes: '' })

  useEffect(() => {
    async function load() {
      const [goalsRes, tradesRes, subRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/trades'),
        fetch('/api/stripe/subscription-status'),
      ])
      const [goalsData, tradesData, subData] = await Promise.all([
        goalsRes.json(), tradesRes.json(), subRes.json(),
      ])
      if (goalsData.goals) {
        setGoals(goalsData.goals)
        setForm({
          monthly_pnl_target: goalsData.goals.monthly_pnl_target ?? '',
          win_rate_target: goalsData.goals.win_rate_target ?? '',
          max_drawdown_target: goalsData.goals.max_drawdown_target ?? '',
          notes: goalsData.goals.notes ?? '',
        })
      }
      if (tradesData.trades) setTrades(tradesData.trades)
      setSubscription(subData)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.goals) setGoals(data.goals)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Current month stats
  const now = new Date()
  const monthTrades = trades.filter((t) => {
    const d = new Date(t.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthClosed = monthTrades.filter((t) => t.pnl !== null)
  const monthPnl = monthClosed.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const monthWins = monthClosed.filter((t) => (t.pnl ?? 0) > 0).length
  const monthWinRate = monthClosed.length > 0 ? Math.round((monthWins / monthClosed.length) * 100) : 0

  // Max drawdown this month
  let peak = 0, maxDD = 0, running = 0
  monthClosed.forEach((t) => {
    running += t.pnl ?? 0
    if (running > peak) peak = running
    const dd = peak - running
    if (dd > maxDD) maxDD = dd
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  if (!subscription?.active) {
    return (
      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-8">
        <div className="mb-8">
          <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Pro Feature</p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Goals</h1>
        </div>
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-12 text-center max-w-md">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6 text-blue-400/70" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2 tracking-tight">Pro Feature</h2>
          <p className="text-[#444] text-sm font-light leading-relaxed mb-6">
            Set monthly P&L targets, win rate goals, and max drawdown limits. Track your progress visually every day.
          </p>
          <a href="/account" className="btn-blue inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade to Pro
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-8 animate-fade-in">
      <div className="mb-8">
        <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Pro</p>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Goals & Milestones</h1>
        <p className="text-[#444] text-xs font-light mt-1">
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} progress
        </p>
      </div>

      <div className="max-w-2xl flex flex-col gap-5">

        {/* Progress cards */}
        {goals && (goals.monthly_pnl_target || goals.win_rate_target || goals.max_drawdown_target) && (
          <div className="grid grid-cols-1 gap-3">

            {/* P&L target */}
            {goals.monthly_pnl_target && (
              <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400/70" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Monthly P&L Target</p>
                      <p className="text-[10px] text-[#444] font-light">
                        ${monthPnl.toFixed(0)} of ${Number(goals.monthly_pnl_target).toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${monthPnl >= goals.monthly_pnl_target ? 'text-emerald-400' : 'text-white'}`}>
                    {Math.min(100, Math.round((monthPnl / goals.monthly_pnl_target) * 100))}%
                  </span>
                </div>
                <ProgressBar value={monthPnl} max={goals.monthly_pnl_target} color="bg-emerald-500" />
                {monthPnl >= goals.monthly_pnl_target && (
                  <p className="text-emerald-400 text-xs mt-2 font-medium">🎯 Target reached!</p>
                )}
              </div>
            )}

            {/* Win rate target */}
            {goals.win_rate_target && (
              <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-blue-400/70" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Win Rate Target</p>
                      <p className="text-[10px] text-[#444] font-light">
                        {monthWinRate}% of {Number(goals.win_rate_target).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${monthWinRate >= goals.win_rate_target ? 'text-emerald-400' : 'text-white'}`}>
                    {Math.min(100, Math.round((monthWinRate / goals.win_rate_target) * 100))}%
                  </span>
                </div>
                <ProgressBar value={monthWinRate} max={goals.win_rate_target} color="bg-blue-500" />
                {monthWinRate >= goals.win_rate_target && (
                  <p className="text-emerald-400 text-xs mt-2 font-medium">🎯 Target reached!</p>
                )}
              </div>
            )}

            {/* Max drawdown */}
            {goals.max_drawdown_target && (
              <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400/70" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Max Drawdown Limit</p>
                      <p className="text-[10px] text-[#444] font-light">
                        ${maxDD.toFixed(0)} drawn of ${Number(goals.max_drawdown_target).toFixed(0)} limit
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${maxDD >= goals.max_drawdown_target ? 'text-red-400' : 'text-white'}`}>
                    {Math.min(100, Math.round((maxDD / goals.max_drawdown_target) * 100))}%
                  </span>
                </div>
                <ProgressBar value={maxDD} max={goals.max_drawdown_target} color="bg-orange-500" />
                {maxDD >= goals.max_drawdown_target && (
                  <p className="text-red-400 text-xs mt-2 font-medium">⚠️ Drawdown limit hit — consider stopping trading today.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Set goals form */}
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6 md:p-7">
          <h2 className="text-sm font-bold text-white tracking-tight mb-6">Set Your Targets</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="label">Monthly P&L Target ($)</label>
                <input
                  type="number"
                  step="any"
                  value={form.monthly_pnl_target}
                  onChange={(e) => setForm((p) => ({ ...p, monthly_pnl_target: e.target.value }))}
                  placeholder="e.g. 1000"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label">Win Rate Target (%)</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max="100"
                  value={form.win_rate_target}
                  onChange={(e) => setForm((p) => ({ ...p, win_rate_target: e.target.value }))}
                  placeholder="e.g. 60"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label">Max Drawdown Limit ($)</label>
                <input
                  type="number"
                  step="any"
                  value={form.max_drawdown_target}
                  onChange={(e) => setForm((p) => ({ ...p, max_drawdown_target: e.target.value }))}
                  placeholder="e.g. 500"
                  className="input"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Notes / Rules</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. No trading after 2 losses in a row. Max 3 trades per day…"
                rows={3}
                className="input resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="btn-blue gap-2 self-start">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save Goals'}
              </button>
              {saved && <span className="text-emerald-400 text-xs font-medium">✓ Saved</span>}
            </div>
          </form>
        </div>

        {/* Notes display */}
        {goals?.notes && (
          <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6">
            <p className="text-[10px] font-medium text-[#444] uppercase tracking-widest mb-3">Your Trading Rules</p>
            <p className="text-sm text-[#888] font-light leading-relaxed whitespace-pre-wrap">{goals.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
