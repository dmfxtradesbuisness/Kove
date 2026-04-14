'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, ShieldAlert, Target, Sparkles, Lock } from 'lucide-react'

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

// ─── Ring progress component ──────────────────────────────────────────────────
function RingProgress({
  pct,
  color,
  size = 100,
  stroke = 8,
  children,
}: {
  pct: number
  color: string
  size?: number
  stroke?: number
  children?: React.ReactNode
}) {
  const r     = (size - stroke) / 2
  const circ  = 2 * Math.PI * r
  const dash  = Math.min(1, pct / 100) * circ

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={pct >= 100 ? '#34d399' : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0 }}>
        {children}
      </div>
    </div>
  )
}

// ─── Goal card ────────────────────────────────────────────────────────────────
function GoalCard({
  icon: Icon,
  label,
  subtitle,
  current,
  target,
  pct,
  color,
  reached,
  reachedText,
  warning,
}: {
  icon: React.ElementType
  label: string
  subtitle: string
  current: string
  target: string
  pct: number
  color: string
  reached: boolean
  reachedText: string
  warning?: boolean
}) {
  const displayColor = reached ? '#34d399' : warning && pct >= 80 ? '#f87171' : color

  return (
    <div
      style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '28px 28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)')}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: 18, height: 18, color }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{label}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', marginTop: 1 }}>{subtitle}</p>
          </div>
        </div>
        {reached && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
            REACHED
          </span>
        )}
        {warning && pct >= 80 && !reached && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
            WARNING
          </span>
        )}
      </div>

      {/* Ring + numbers */}
      <div className="flex items-center gap-8">
        <RingProgress pct={pct} color={displayColor} size={100} stroke={9}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: displayColor, lineHeight: 1, letterSpacing: '-0.02em' }}>{pct}%</span>
        </RingProgress>
        <div className="flex-1">
          <div className="flex flex-col gap-3">
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Current</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>{current}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Target</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1 }}>{target}</p>
            </div>
          </div>
        </div>
      </div>

      {reached && (
        <p style={{ fontSize: 12, color: '#34d399', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{reachedText}</p>
      )}
    </div>
  )
}

export default function GoalsPage() {
  const [goals, setGoals]             = useState<Goals | null>(null)
  const [trades, setTrades]           = useState<Trade[]>([])
  const [subscription, setSubscription] = useState<{ active: boolean } | null>(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [loadError, setLoadError]     = useState('')
  const [form, setForm]               = useState({ monthly_pnl_target: '', win_rate_target: '', max_drawdown_target: '', notes: '' })

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
      // noop
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
  const monthClosed  = monthTrades.filter((t) => t.pnl !== null)
  const monthPnl     = monthClosed.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const monthWins    = monthClosed.filter((t) => (t.pnl ?? 0) > 0).length
  const monthWinRate = monthClosed.length > 0 ? Math.round((monthWins / monthClosed.length) * 100) : 0

  // Max drawdown
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
        <div className="mb-8">
          <p className="page-label">Pro Feature</p>
          <h1 className="page-title">Goals</h1>
        </div>
        <div style={{ maxWidth: 400 }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '36px 32px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(108,93,211,0.1)', border: '1px solid rgba(108,93,211,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock style={{ width: 20, height: 20, color: '#8B7CF8' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 10 }}>Pro Feature</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 28 }}>
              Set monthly P&amp;L targets, win rate goals, and max drawdown limits. Track your progress visually every day.
            </p>
            <a href="/account" className="btn-blue inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade to Pro
            </a>
          </div>
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

  const hasGoals = goals && (goals.monthly_pnl_target || goals.win_rate_target || goals.max_drawdown_target)

  return (
    <div className="px-5 md:px-8 pt-6 md:pt-10 pb-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="page-label">Pro · {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <h1 className="page-title">Goals &amp; Milestones</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', marginTop: 6 }}>
          Track your monthly trading targets — P&amp;L, win rate, and discipline.
        </p>
      </div>

      <div style={{ maxWidth: 720 }} className="flex flex-col gap-6">

        {/* Progress cards */}
        {hasGoals && (
          <div className="flex flex-col gap-4">
            {goals.monthly_pnl_target ? (
              <GoalCard
                icon={TrendingUp}
                label="Monthly P&L Target"
                subtitle={`${now.toLocaleDateString('en-US', { month: 'long' })} progress`}
                current={`$${monthPnl >= 0 ? '' : '-'}${Math.abs(monthPnl).toFixed(0)}`}
                target={`$${Number(goals.monthly_pnl_target).toFixed(0)}`}
                pct={pnlPct}
                color="#34d399"
                reached={monthPnl >= goals.monthly_pnl_target}
                reachedText="Target reached this month!"
              />
            ) : null}

            {goals.win_rate_target ? (
              <GoalCard
                icon={Target}
                label="Win Rate Target"
                subtitle={`Based on ${monthClosed.length} closed trades`}
                current={`${monthWinRate}%`}
                target={`${Number(goals.win_rate_target).toFixed(0)}%`}
                pct={wrPct}
                color="#8B7CF8"
                reached={monthWinRate >= goals.win_rate_target}
                reachedText="Win rate target achieved!"
              />
            ) : null}

            {goals.max_drawdown_target ? (
              <GoalCard
                icon={ShieldAlert}
                label="Max Drawdown Limit"
                subtitle="Accumulated loss from peak this month"
                current={`$${maxDD.toFixed(0)}`}
                target={`$${Number(goals.max_drawdown_target).toFixed(0)} limit`}
                pct={ddPct}
                color="#f97316"
                reached={maxDD >= goals.max_drawdown_target}
                reachedText="Drawdown limit hit — consider pausing today."
                warning
              />
            ) : null}
          </div>
        )}

        {/* Set goals form */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '20px 28px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>Set Your Targets</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', marginTop: 4 }}>Define your monthly goals — reset at the start of each month</p>
          </div>
          <form onSubmit={handleSave} style={{ padding: '24px 28px' }} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="label">Monthly P&amp;L Target ($)</label>
                <input
                  type="number" step="any"
                  value={form.monthly_pnl_target}
                  onChange={(e) => setForm((p) => ({ ...p, monthly_pnl_target: e.target.value }))}
                  placeholder="e.g. 1000"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label">Win Rate Target (%)</label>
                <input
                  type="number" step="any" min="1" max="100"
                  value={form.win_rate_target}
                  onChange={(e) => setForm((p) => ({ ...p, win_rate_target: e.target.value }))}
                  placeholder="e.g. 60"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label">Max Drawdown Limit ($)</label>
                <input
                  type="number" step="any"
                  value={form.max_drawdown_target}
                  onChange={(e) => setForm((p) => ({ ...p, max_drawdown_target: e.target.value }))}
                  placeholder="e.g. 500"
                  className="input"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Trading Rules &amp; Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. No trading after 2 losses in a row. Max 3 trades per day. Always use a stop loss…"
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
                <span style={{ color: '#34d399', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500 }}>✓ Saved</span>
              )}
            </div>
          </form>
        </div>

        {/* Rules display */}
        {goals?.notes && (
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px 28px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Your Trading Rules</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {goals.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
