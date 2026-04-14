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

function ProgressBar({ value, max, color = '#6C5DD3' }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  const done = pct >= 100
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          borderRadius: 999,
          width: `${pct}%`,
          background: done ? '#34d399' : color,
          transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    </div>
  )
}

function GoalCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  pct,
  barColor,
  reached,
  reachedText,
  isWarning,
}: {
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  subtitle: string
  pct: number
  barColor: string
  reached: boolean
  reachedText: string
  isWarning?: boolean
}) {
  return (
    <div className="dash-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: iconBg, border: `1px solid ${iconColor}30` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>{title}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-body)', marginTop: 1 }}>{subtitle}</p>
          </div>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 18,
            color: reached ? '#34d399' : isWarning && pct >= 80 ? '#f87171' : 'var(--text-1)',
            letterSpacing: '-0.02em',
          }}
        >
          {pct}%
        </span>
      </div>
      <ProgressBar value={pct} max={100} color={barColor} />
      {reached && (
        <p style={{ color: '#34d399', fontSize: 11, marginTop: 8, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
          {reachedText}
        </p>
      )}
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
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState({ monthly_pnl_target: '', win_rate_target: '', max_drawdown_target: '', notes: '' })

  useEffect(() => {
    async function load() {
      try {
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
      } catch {
        setLoadError('Failed to load data. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.goals) setGoals(data.goals)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // silently fail — rare
    } finally {
      setSaving(false)
    }
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
        <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(139,124,248,0.6)' }} />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p style={{ color: '#f87171', fontFamily: 'var(--font-body)', fontSize: 13 }}>{loadError}</p>
      </div>
    )
  }

  if (!subscription?.active) {
    return (
      <div className="px-5 md:px-8 pt-6 md:pt-10 pb-8">
        {/* Page header */}
        <div className="mb-8">
          <p className="page-label">Pro Feature</p>
          <h1 className="page-title mt-1">Goals</h1>
        </div>

        {/* Upgrade gate */}
        <div
          className="card p-8 text-center"
          style={{ maxWidth: 400, background: 'var(--surface-1)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(108,93,211,0.1)', border: '1px solid rgba(108,93,211,0.2)' }}
          >
            <Lock className="w-5 h-5" style={{ color: '#8B7CF8' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-1)', marginBottom: 8 }}>
            Pro Feature
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 24 }}>
            Set monthly P&amp;L targets, win rate goals, and max drawdown limits. Track your progress visually every day.
          </p>
          <a href="/account" className="btn-blue inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade to Pro
          </a>
        </div>
      </div>
    )
  }

  const pnlPct = goals?.monthly_pnl_target
    ? Math.min(100, Math.round((monthPnl / goals.monthly_pnl_target) * 100))
    : 0
  const wrPct = goals?.win_rate_target
    ? Math.min(100, Math.round((monthWinRate / goals.win_rate_target) * 100))
    : 0
  const ddPct = goals?.max_drawdown_target
    ? Math.min(100, Math.round((maxDD / goals.max_drawdown_target) * 100))
    : 0

  return (
    <div className="px-5 md:px-8 pt-6 md:pt-10 pb-8 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <p className="page-label">Pro · {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <h1 className="page-title mt-1">Goals &amp; Milestones</h1>
      </div>

      <div style={{ maxWidth: 680 }} className="flex flex-col gap-4">

        {/* Progress cards */}
        {goals && (goals.monthly_pnl_target || goals.win_rate_target || goals.max_drawdown_target) && (
          <div className="grid grid-cols-1 gap-3">
            {goals.monthly_pnl_target ? (
              <GoalCard
                icon={TrendingUp}
                iconColor="#34d399"
                iconBg="rgba(52,211,153,0.1)"
                title="Monthly P&L Target"
                subtitle={`$${monthPnl.toFixed(0)} of $${Number(goals.monthly_pnl_target).toFixed(0)}`}
                pct={pnlPct}
                barColor="#34d399"
                reached={monthPnl >= goals.monthly_pnl_target}
                reachedText="🎯 Target reached!"
              />
            ) : null}

            {goals.win_rate_target ? (
              <GoalCard
                icon={Target}
                iconColor="#8B7CF8"
                iconBg="rgba(108,93,211,0.1)"
                title="Win Rate Target"
                subtitle={`${monthWinRate}% of ${Number(goals.win_rate_target).toFixed(0)}%`}
                pct={wrPct}
                barColor="#8B7CF8"
                reached={monthWinRate >= goals.win_rate_target}
                reachedText="🎯 Target reached!"
              />
            ) : null}

            {goals.max_drawdown_target ? (
              <GoalCard
                icon={ShieldAlert}
                iconColor="#f87171"
                iconBg="rgba(239,68,68,0.1)"
                title="Max Drawdown Limit"
                subtitle={`$${maxDD.toFixed(0)} of $${Number(goals.max_drawdown_target).toFixed(0)} limit`}
                pct={ddPct}
                barColor="#f97316"
                reached={maxDD >= goals.max_drawdown_target}
                reachedText="⚠️ Drawdown limit hit — consider stopping today."
                isWarning
              />
            ) : null}
          </div>
        )}

        {/* Set goals form */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Set Your Targets</span>
          </div>
          <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="label">Monthly P&amp;L ($)</label>
                <input
                  type="number"
                  step="any"
                  value={form.monthly_pnl_target}
                  onChange={(e) => setForm((p) => ({ ...p, monthly_pnl_target: e.target.value }))}
                  placeholder="e.g. 1000"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Win Rate (%)</label>
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
              <div className="flex flex-col gap-1.5">
                <label className="label">Max Drawdown ($)</label>
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
            <div className="flex flex-col gap-1.5">
              <label className="label">Notes / Trading Rules</label>
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
              {saved && (
                <span style={{ color: '#34d399', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                  ✓ Saved
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Rules display */}
        {goals?.notes && (
          <div className="dash-card p-5">
            <p className="page-label mb-3">Your Trading Rules</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-body)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
              {goals.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
