'use client'

import { useState, useEffect } from 'react'
import { Sparkles, X, AlertTriangle, ShieldAlert, TrendingUp, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { DailyCheckResult } from '@/app/api/ai/daily-check/route'

const SEV_CFG = {
  info:    { border: 'rgba(30,110,255,0.25)',  bg: 'rgba(30,110,255,0.07)',  icon: TrendingUp,     iconColor: '#4D90FF',  label: '#4D90FF'  },
  warning: { border: 'rgba(251,191,36,0.3)',  bg: 'rgba(251,191,36,0.07)',  icon: AlertTriangle,  iconColor: '#fbbf24',  label: '#fbbf24'  },
  danger:  { border: 'rgba(239,68,68,0.35)',  bg: 'rgba(239,68,68,0.08)',   icon: ShieldAlert,    iconColor: '#f87171',  label: '#f87171'  },
}

export default function AiDailyBanner() {
  const [data,       setData]       = useState<DailyCheckResult | null>(null)
  const [dismissed,  setDismissed]  = useState<Set<string>>(new Set())
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    fetch('/api/ai/daily-check')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) return null

  const visible = data.alerts.filter((a) => !dismissed.has(a.type))
  if (visible.length === 0) return null

  // Show most severe first
  const sorted = [...visible].sort((a, b) => {
    const order = { danger: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })

  const top = sorted[0]
  const cfg = SEV_CFG[top.severity]
  const Icon = cfg.icon

  return (
    <div
      style={{
        margin: '0 24px 0',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        position: 'relative',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Kove AI badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, paddingTop: 1 }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg,rgba(30,110,255,0.8),rgba(10,40,140,0.85))', border: '1px solid rgba(30,110,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles style={{ width: 12, height: 12, color: '#fff' }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <Icon style={{ width: 12, height: 12, color: cfg.iconColor, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: cfg.label, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            KoveAI
          </span>
          {sorted.length > 1 && (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: '1px 6px' }}>
              +{sorted.length - 1} more
            </span>
          )}
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
          {top.message}
        </p>
        {sorted.length > 1 && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sorted.slice(1).map((a) => {
              const c = SEV_CFG[a.severity]
              return (
                <p key={a.type} style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${c.border}` }}>
                  {a.message}
                </p>
              )
            })}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <Link
            href="/ai"
            style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#4D90FF', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Sparkles style={{ width: 10, height: 10 }} />
            Open AI Chat
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>·</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            {data.todayCount} trade{data.todayCount !== 1 ? 's' : ''} today
            {data.winRateToday !== null && ` · ${data.winRateToday}% WR`}
          </span>
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed((prev) => new Set([...prev, top.type]))}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: 4, flexShrink: 0, marginTop: -2 }}
        title="Dismiss"
      >
        <X style={{ width: 13, height: 13 }} />
      </button>
    </div>
  )
}
