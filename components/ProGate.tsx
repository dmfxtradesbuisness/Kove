'use client'

import { useState } from 'react'
import { Loader2, ArrowRight, Lock, Brain, TrendingUp, Target, Zap, Clock } from 'lucide-react'

interface ProGateProps {
  title?: string
  description?: string
  compact?: boolean
}

const PRO_BULLETS = [
  { icon: Brain,      text: 'Behavioral pattern recognition' },
  { icon: TrendingUp, text: 'Time-of-day performance analysis' },
  { icon: Target,     text: 'Setup profitability breakdown' },
  { icon: Zap,        text: 'Emotional trading detection' },
  { icon: Clock,      text: 'Weekly AI insights report' },
]

const WOW_PREVIEWS = [
  { icon: '⚠️', label: 'Your #1 issue', value: 'Revenge trading after losses' },
  { icon: '📉', label: 'Hidden leak',   value: 'You lose 62% more on Fridays' },
  { icon: '🧠', label: 'Tilt pattern',  value: 'Win rate drops 18% after 3 losses' },
  { icon: '🎯', label: 'Best setup',    value: 'Morning breakouts — 71% win rate' },
]

export function ProGate({ title = 'Pro Intelligence', description = 'Upgrade to unlock AI-powered behavioral analysis of your trading.', compact = false }: ProGateProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ?? 'Something went wrong')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <div style={{ background: 'linear-gradient(145deg,#0f0d28,#0c0a20)', border: '1px solid rgba(123,108,245,0.25)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(123,108,245,0.15)', border: '1px solid rgba(123,108,245,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Lock className="w-4 h-4" style={{ color: '#4D90FF' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2 }}>{title}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>{description}</p>
        </div>
        <button onClick={handleUpgrade} disabled={loading}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 0 16px rgba(123,108,245,0.3)', whiteSpace: 'nowrap' }}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Upgrade — $19/mo
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(55,38,130,0.55) 0%, rgba(25,15,70,0.2) 55%, transparent 100%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, width: '100%' }}>

        {/* Lock icon */}
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(123,108,245,0.12)', border: '1px solid rgba(123,108,245,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Lock className="w-6 h-6" style={{ color: '#4D90FF' }} />
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#fff', letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.2 }}>
          {title}
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 28 }}>
          {description}
        </p>

        {/* Pro preview cards — what they'll actually see */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 28 }}>
          {WOW_PREVIEWS.map((p) => (
            <div key={p.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', filter: 'blur(0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'rgba(123,108,245,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.label}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3, filter: 'blur(3.5px)', userSelect: 'none' }}>{p.value}</p>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginBottom: 20, textAlign: 'center' }}>
          ↑ Unlock to see your actual insights
        </p>

        {/* Feature list */}
        <div style={{ marginBottom: 28 }}>
          {PRO_BULLETS.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7B6CF5' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Upgrade button */}
        <button onClick={handleUpgrade} disabled={loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 0 32px rgba(123,108,245,0.4)', transition: 'transform 0.15s' }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Upgrade to Pro — $19/month
        </button>

        {/* Anchor price */}
        <p style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          <span style={{ textDecoration: 'line-through', marginRight: 6 }}>$29/month</span>
          Save 35% · Cancel anytime
        </p>

        {error && (
          <p style={{ textAlign: 'center', marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 12, color: '#f87171' }}>{error}</p>
        )}
      </div>
    </div>
  )
}
