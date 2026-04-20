'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Trade } from '@/lib/types'

interface UserPrefs {
  biggest_problem?: string
  daily_trade_limit?: number
}

interface Insight {
  message: string
  severity: 'info' | 'warning' | 'danger'
}

function getInsight(trade: Trade, allTrades: Trade[], prefs: UserPrefs): Insight {
  const todayStr  = new Date().toDateString()
  const todayTrades = allTrades.filter(t => new Date(t.created_at).toDateString() === todayStr)
  const todayCount  = todayTrades.length

  // Check daily trade limit
  const limit = prefs.daily_trade_limit
  if (limit && todayCount >= limit) {
    return {
      message: `You've hit your daily limit of ${limit} trade${limit !== 1 ? 's' : ''}. This is exactly the pattern that costs you — stepping away now protects your account.`,
      severity: 'danger',
    }
  }
  if (limit && todayCount === limit - 1) {
    return {
      message: `1 trade left before your daily limit. Make it count.`,
      severity: 'warning',
    }
  }

  // Behavioral pattern checks
  const closedRecent = allTrades
    .filter(t => t.pnl !== null)
    .slice(0, 4)

  const recentLossStreak = (() => {
    let streak = 0
    for (const t of closedRecent) {
      if ((t.pnl ?? 0) < 0) streak++
      else break
    }
    return streak
  })()

  if (prefs.biggest_problem === 'revenge_trading' && recentLossStreak >= 2 && (trade.pnl ?? 0) < 0) {
    return {
      message: `${recentLossStreak} losses in a row. You flagged revenge trading as your biggest issue — this is the moment it happens. Consider stepping back.`,
      severity: 'danger',
    }
  }

  if (prefs.biggest_problem === 'overtrading' && todayCount >= 4) {
    return {
      message: `${todayCount} trades today. You flagged overtrading as your issue. More trades doesn't mean more profit — it usually means the opposite.`,
      severity: 'warning',
    }
  }

  if (prefs.biggest_problem === 'cutting_winners' && trade.pnl !== null && trade.pnl > 0 && trade.take_profit && trade.exit_price) {
    const hitTp = trade.exit_price >= trade.take_profit * 0.95
    if (!hitTp) {
      return {
        message: `Win logged, but you closed before your take profit. You flagged cutting winners short as your problem — watch this pattern.`,
        severity: 'warning',
      }
    }
  }

  if (recentLossStreak >= 3) {
    return {
      message: `3 losses in a row. Data shows most traders perform worse after a streak like this. A break now is a trade in itself.`,
      severity: 'warning',
    }
  }

  // Positive feedback
  const todayClosed = todayTrades.filter(t => t.pnl !== null)
  const todayWins   = todayClosed.filter(t => (t.pnl ?? 0) > 0)
  const todayWR     = todayClosed.length > 0 ? Math.round((todayWins.length / todayClosed.length) * 100) : null

  if (trade.outcome === 'win' && todayWR !== null && todayWR >= 70 && todayClosed.length >= 2) {
    return {
      message: `${todayWR}% win rate today across ${todayClosed.length} trades. Consistent. Don't get overconfident — protect it.`,
      severity: 'info',
    }
  }

  if (trade.outcome === 'win') {
    return {
      message: `Trade ${todayCount} logged. Win recorded. Keep logging — patterns only show up with data.`,
      severity: 'info',
    }
  }

  return {
    message: `Trade ${todayCount} logged. Every entry builds your pattern profile — the more you log, the sharper the coaching gets.`,
    severity: 'info',
  }
}

const SEV_COLORS = {
  info:    { border: 'rgba(30,110,255,0.3)',  bg: 'rgba(30,110,255,0.07)',  accent: '#4D90FF' },
  warning: { border: 'rgba(251,191,36,0.35)', bg: 'rgba(251,191,36,0.07)', accent: '#fbbf24' },
  danger:  { border: 'rgba(239,68,68,0.4)',   bg: 'rgba(239,68,68,0.08)',  accent: '#f87171' },
}

interface Props {
  trade: Trade
  allTrades: Trade[]
  onDismiss: () => void
}

export default function PostTradeCoach({ trade, allTrades, onDismiss }: Props) {
  const [prefs,   setPrefs]   = useState<UserPrefs>({})
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/onboarding')
      .then(r => r.json())
      .then(({ prefs: p }) => { if (p) setPrefs(p) })
      .catch(() => {})
    // Slide in after a short delay
    timerRef.current = setTimeout(() => setVisible(true), 350)
    // Auto-dismiss after 12 seconds
    const autoDismiss = setTimeout(() => handleDismiss(), 12350)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      clearTimeout(autoDismiss)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleDismiss() {
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  const insight = getInsight(trade, allTrades, prefs)
  const col = SEV_COLORS[insight.severity]

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(12px); }
        }
        .coach-card-enter { animation: slideUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards; }
        .coach-card-exit  { animation: slideDown 0.25s ease forwards; }
      `}</style>

      <div
        className={visible ? 'coach-card-enter' : 'coach-card-exit'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 'min(360px, calc(100vw - 48px))',
          background: 'linear-gradient(145deg, #0d0d1a, #0a0a14)',
          border: `1px solid ${col.border}`,
          borderRadius: 16,
          padding: '16px 18px',
          boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'linear-gradient(135deg,rgba(30,110,255,0.7),rgba(10,40,140,0.8))',
              border: '1px solid rgba(30,110,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles style={{ width: 13, height: 13, color: '#fff' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: col.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Coach
            </span>
          </div>
          <button
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.22)', padding: 2 }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Message */}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, margin: '0 0 12px' }}>
          {insight.message}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            {trade.pair} · {trade.type}
            {trade.pnl !== null && (
              <span style={{ color: trade.pnl >= 0 ? '#34D399' : '#F87171', marginLeft: 4 }}>
                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
              </span>
            )}
          </span>
          <Link
            href="/ai"
            onClick={handleDismiss}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
              color: '#4D90FF', textDecoration: 'none',
            }}
          >
            Ask Coach
            <ArrowRight style={{ width: 11, height: 11 }} />
          </Link>
        </div>
      </div>
    </>
  )
}
