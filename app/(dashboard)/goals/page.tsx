'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2, TrendingUp, ShieldAlert, Target, Sparkles, Lock, ChevronRight, Settings2, Flame, Trophy, Zap } from 'lucide-react'
import { useJournal } from '@/lib/journal-context'

interface Goals {
  monthly_pnl_target: number | null
  win_rate_target: number | null
  max_drawdown_target: number | null
  notes: string | null
}
interface Trade { pnl: number | null; outcome: string | null; stop_loss: number | null; created_at: string }

// ─── Analytics helpers (sourced from stats page) ──────────────────────────────
function calcDisciplineScore(trades: Trade[]): { score: number; breakdown: { label: string; pts: number; max: number; tip: string }[] } {
  const closed = trades.filter((t) => t.pnl !== null)
  if (closed.length === 0) return { score: 0, breakdown: [] }
  const withSL = trades.filter((t) => t.stop_loss !== null && Number(t.stop_loss) > 0).length
  const slRate = trades.length > 0 ? withSL / trades.length : 0
  const slPts = Math.round(slRate * 25)
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length
  const winRate = closed.length > 0 ? wins / closed.length : 0
  const wrPts = Math.round(Math.min(1, winRate / 0.6) * 25)
  const daySet = new Set(trades.map((t) => new Date(t.created_at).toDateString()))
  const avgPerDay = daySet.size > 0 ? trades.length / daySet.size : 0
  const otPts = avgPerDay <= 2 ? 25 : avgPerDay <= 3 ? 20 : avgPerDay <= 4 ? 13 : avgPerDay <= 5 ? 6 : 0
  const sorted = [...closed].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  let revengeTrades = 0
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1], curr = sorted[i]
    const gap = (new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()) / 60000
    if ((prev.pnl ?? 0) < 0 && gap <= 30) revengeTrades++
  }
  const revengeRate = closed.length > 1 ? revengeTrades / (closed.length - 1) : 0
  const rvPts = Math.round(Math.max(0, 1 - revengeRate * 2) * 25)
  const score = slPts + wrPts + otPts + rvPts
  return {
    score,
    breakdown: [
      { label: 'Risk Management', pts: slPts, max: 25, tip: `${Math.round(slRate * 100)}% of trades have a stop loss` },
      { label: 'Win Rate',        pts: wrPts, max: 25, tip: `${Math.round(winRate * 100)}% win rate` },
      { label: 'Overtrading',     pts: otPts, max: 25, tip: `${avgPerDay.toFixed(1)} trades/day avg` },
      { label: 'Discipline',      pts: rvPts, max: 25, tip: `${revengeTrades} potential revenge trade${revengeTrades !== 1 ? 's' : ''}` },
    ],
  }
}

function calcStreaks(trades: Trade[]) {
  const closed = [...trades].filter((t) => t.pnl !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  let currentStreak = 0, bestStreak = 0, temp = 0
  for (let i = closed.length - 1; i >= 0; i--) {
    if ((closed[i].pnl ?? 0) > 0) { currentStreak++; } else break
  }
  for (const t of closed) {
    if ((t.pnl ?? 0) > 0) { temp++; if (temp > bestStreak) bestStreak = temp; } else temp = 0
  }
  // Green day streak
  const byDay: Record<string, number> = {}
  for (const t of closed) {
    const d = new Date(t.created_at).toDateString()
    byDay[d] = (byDay[d] ?? 0) + (t.pnl ?? 0)
  }
  const sortedDays = Object.entries(byDay).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
  let greenDayStreak = 0
  for (let i = sortedDays.length - 1; i >= 0; i--) {
    if (sortedDays[i][1] > 0) greenDayStreak++; else break
  }
  return { currentStreak, bestStreak, greenDayStreak }
}

// ─── Multi-ring donut ─────────────────────────────────────────────────────────
function MultiRing({ rings }: { rings: { pct: number; color: string; r: number; stroke: number }[] }) {
  const SIZE = 180
  const cx = SIZE / 2, cy = SIZE / 2
  return (
    <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
      {rings.map(({ pct, color, r, stroke }) => {
        const circ = 2 * Math.PI * r
        const dash = Math.min(1, Math.max(0, pct) / 100) * circ
        return (
          <g key={r}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
            <circle
              cx={cx} cy={cy} r={r} fill="none"
              stroke={pct >= 100 ? '#34d399' : color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }}
            />
          </g>
        )
      })}
    </svg>
  )
}

// ─── Thin ring (single goal card) ─────────────────────────────────────────────
function ThinRing({ pct, color, size = 56, stroke = 5 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.min(1, Math.max(0, pct) / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={pct >= 100 ? '#34d399' : color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: pct >= 100 ? '#34d399' : color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function Bar({ pct, color, warning }: { pct: number; color: string; warning?: boolean }) {
  const col = pct >= 100 ? '#34d399' : warning && pct >= 80 ? '#f87171' : color
  return (
    <div style={{ width: '100%', height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 999,
        width: `${Math.min(100, Math.max(0, pct))}%`,
        background: col,
        boxShadow: `0 0 10px ${col}55`,
        transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
      }} />
    </div>
  )
}

// ─── Goal list card (left sidebar style from reference) ───────────────────────
function GoalListCard({
  accent, icon: Icon, label, sub, pct, color, badge, badgeColor, badgeBg,
  onClick, active,
}: {
  accent: string; icon: React.ElementType; label: string; sub: string
  pct: number; color: string; badge?: string; badgeColor?: string; badgeBg?: string
  onClick: () => void; active: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.06)',
        borderLeft: `3px solid ${accent}`,
        borderRadius: 14, padding: '14px 16px',
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon style={{ width: 15, height: 15, color: accent }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{label}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', marginTop: 2 }}>{sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: badgeBg, color: badgeColor, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', flexShrink: 0 }}>
              {badge}
            </span>
          )}
          <ThinRing pct={pct} color={color} size={44} stroke={4} />
        </div>
      </div>
      <Bar pct={pct} color={color} warning={label.includes('Drawdown')} />
    </button>
  )
}

// ─── Big detail card ──────────────────────────────────────────────────────────
function DetailCard({
  accent, icon: Icon, label, currentLabel, current, targetLabel, target,
  pct, color, reached, warning, milestones,
}: {
  accent: string; icon: React.ElementType; label: string
  currentLabel: string; current: string; targetLabel: string; target: string
  pct: number; color: string; reached: boolean; warning?: boolean
  milestones: { label: string; value: string; done: boolean }[]
}) {
  const displayColor = reached ? '#34d399' : warning && pct >= 80 ? '#f87171' : color
  const badge = reached ? 'REACHED' : warning && pct >= 80 ? 'AT RISK' : pct >= 50 ? 'ON TRACK' : 'IN PROGRESS'
  const badgePalette =
    reached           ? { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.3)' }
    : warning && pct >= 80 ? { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.3)'  }
    : pct >= 50        ? { bg: 'rgba(52,211,153,0.1)',   color: '#6ee7b7', border: 'rgba(52,211,153,0.2)' }
    :                    { bg: 'rgba(30,110,255,0.12)',  color: '#a78bfa', border: 'rgba(30,110,255,0.25)' }

  return (
    <div style={{
      background: '#111', border: '1px solid rgba(255,255,255,0.08)',
      borderTop: `3px solid ${accent}`,
      borderRadius: '0 0 20px 20px', padding: '24px 24px 28px',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${accent}18`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: 20, height: 20, color: accent }} />
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{label}</p>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: badgePalette.bg, color: badgePalette.color, border: `1px solid ${badgePalette.border}`, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', display: 'inline-block', marginTop: 4 }}>
              {badge}
            </span>
          </div>
        </div>
        {/* Big pct */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 48, fontWeight: 900, color: displayColor, fontFamily: 'var(--font-display)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {pct}<span style={{ fontSize: 20, fontWeight: 700 }}>%</span>
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', marginTop: 2 }}>of target</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: displayColor, fontFamily: 'var(--font-display)' }}>{Math.min(100, pct)}%</span>
        </div>
        <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999,
            width: `${Math.min(100, Math.max(0, pct))}%`,
            background: `linear-gradient(90deg, ${displayColor}cc, ${displayColor})`,
            boxShadow: `0 0 16px ${displayColor}55`,
            transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
      </div>

      {/* Current vs Target */}
      <div className="grid grid-cols-2 gap-3">
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{currentLabel}</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>{current}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{targetLabel}</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>{target}</p>
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Milestones</p>
          {milestones.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: m.done ? `${accent}0d` : 'rgba(255,255,255,0.02)', border: `1px solid ${m.done ? accent + '22' : 'rgba(255,255,255,0.05)'}` }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${m.done ? accent : 'rgba(255,255,255,0.15)'}`, background: m.done ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {m.done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: m.done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)', textDecoration: m.done ? 'line-through' : 'none' }}>{m.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: m.done ? accent : 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)' }}>{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Streaks section ──────────────────────────────────────────────────────────
function StreaksSection({ currentStreak, bestStreak, greenDayStreak }: { currentStreak: number; bestStreak: number; greenDayStreak: number }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Win Streaks</p>
      <div className="grid grid-cols-3 xl:grid-cols-1 gap-3">
        {[
          { label: 'Current Streak', value: currentStreak, unit: 'W', icon: Flame, iconColor: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.15)' },
          { label: 'Best Ever', value: bestStreak, unit: 'W', icon: Trophy, iconColor: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)' },
          { label: 'Green Days', value: greenDayStreak, unit: 'd', icon: TrendingUp, iconColor: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)' },
        ].map(({ label, value, unit, icon: Icon, iconColor, bg, border }) => (
          <div key={label} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: 15, height: 15, color: iconColor }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {value}<span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>{unit}</span>
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Discipline section ────────────────────────────────────────────────────────
function DisciplineSection({ discScore, discScoreColor, discScoreLabel, discBreakdown }: {
  discScore: number; discScoreColor: string; discScoreLabel: string
  discBreakdown: { label: string; pts: number; max: number; tip: string }[]
}) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Discipline Score</p>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${discScoreColor}`, borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={discScoreColor} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${discScore} 100`}
                style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 16, height: 16, color: discScoreColor }} />
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, color: discScoreColor, lineHeight: 1, letterSpacing: '-0.03em' }}>{discScore}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>out of 100 · {discScoreLabel}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {discBreakdown.map((item) => {
            const pct = (item.pts / item.max) * 100
            const barColor = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171'
            return (
              <div key={item.label}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)' }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>{item.pts}/{item.max}</span>
                </div>
                <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)' }} />
                </div>
              </div>
            )
          })}
        </div>
        {discBreakdown.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {discBreakdown[0]?.pts < 20 && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>📍 Set a stop loss on every trade.</p>}
            {discBreakdown[2]?.pts < 20 && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>🧘 Quality over quantity — {discBreakdown[2]?.tip}.</p>}
            {discBreakdown[3]?.pts < 20 && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>⏸️ 30-min break after a loss before re-entering.</p>}
            {discScore >= 75 && <p style={{ fontSize: 12, color: '#34d399', fontFamily: 'var(--font-body)' }}>🔥 Excellent discipline. Keep following your rules.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const { activeJournalId, activeJournal } = useJournal()
  const [goals, setGoals]             = useState<Goals | null>(null)
  const [trades, setTrades]           = useState<Trade[]>([])
  const [subscription, setSubscription] = useState<{ active: boolean } | null>(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [loadError, setLoadError]     = useState('')
  const [activeGoal, setActiveGoal]   = useState<'pnl' | 'wr' | 'dd'>('pnl')
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState({ monthly_pnl_target: '', win_rate_target: '', max_drawdown_target: '', notes: '' })
  const [mounted, setMounted]         = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t) }, [goals])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const jParam = activeJournalId ? `?journal_id=${activeJournalId}` : ''
        const [goalsRes, tradesRes, subRes] = await Promise.all([
          fetch(`/api/goals${jParam}`),
          fetch(`/api/trades${jParam}`),
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
        } else {
          setGoals(null)
          setForm({ monthly_pnl_target: '', win_rate_target: '', max_drawdown_target: '', notes: '' })
        }
        if (tradesData.trades) setTrades(tradesData.trades)
        setSubscription(subData)
      } catch { setLoadError('Failed to load. Please refresh.') }
      finally { setLoading(false) }
    }
    load()
  }, [activeJournalId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, journal_id: activeJournalId ?? null }),
      })
      const data = await res.json()
      if (data.goals) { setGoals(data.goals); setShowForm(false) }
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch { /* noop */ } finally { setSaving(false) }
  }

  const now = new Date()
  const monthTrades  = trades.filter((t) => { const d = new Date(t.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
  const monthClosed  = monthTrades.filter((t) => t.pnl !== null)
  const monthPnl     = monthClosed.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const monthWins    = monthClosed.filter((t) => (t.pnl ?? 0) > 0).length
  const monthWinRate = monthClosed.length > 0 ? Math.round((monthWins / monthClosed.length) * 100) : 0

  let peak = 0, maxDD = 0, running = 0
  monthClosed.forEach((t) => { running += t.pnl ?? 0; if (running > peak) peak = running; const dd = peak - running; if (dd > maxDD) maxDD = dd })

  // Discipline + streaks (computed from all trades)
  const { score: discScore, breakdown: discBreakdown } = useMemo(() => calcDisciplineScore(trades), [trades])
  const { currentStreak, bestStreak, greenDayStreak } = useMemo(() => calcStreaks(trades), [trades])
  const discScoreColor = discScore >= 75 ? '#34d399' : discScore >= 50 ? '#fbbf24' : '#f87171'
  const discScoreLabel = discScore >= 75 ? 'Excellent' : discScore >= 60 ? 'Good' : discScore >= 40 ? 'Fair' : 'Needs Work'

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(77,144,255,0.6)' }} /></div>
  if (loadError) return <div className="flex items-center justify-center min-h-[60vh]"><p style={{ color: '#f87171', fontSize: 13 }}>{loadError}</p></div>

  if (!subscription?.active) {
    return (
      <div className="px-5 md:px-8 pt-6 md:pt-10 pb-8">
        <div className="mb-8"><p className="page-label">Pro Feature</p><h1 className="page-title">Goals</h1></div>
        <div style={{ maxWidth: 420 }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '48px 36px', textAlign: 'center' }}>
            {/* Illustration */}
            <div style={{ margin: '0 auto 28px', position: 'relative', width: 96, height: 96 }}>
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
                <circle cx="48" cy="48" r="44" stroke="rgba(30,110,255,0.15)" strokeWidth="3" />
                <circle cx="48" cy="48" r="44" stroke="rgba(30,110,255,0.6)" strokeWidth="3" strokeLinecap="round" strokeDasharray="90 186" style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px' }} />
                <circle cx="48" cy="48" r="32" stroke="rgba(52,211,153,0.15)" strokeWidth="3" />
                <circle cx="48" cy="48" r="32" stroke="rgba(52,211,153,0.6)" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 141" style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px' }} />
                <circle cx="48" cy="48" r="20" stroke="rgba(251,191,36,0.15)" strokeWidth="3" />
                <circle cx="48" cy="48" r="20" stroke="rgba(251,191,36,0.6)" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 86" style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px' }} />
                <circle cx="48" cy="48" r="5" fill="rgba(30,110,255,0.5)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock style={{ width: 18, height: 18, color: '#4D90FF' }} />
              </div>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>Goals &amp; Milestones</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 28 }}>
              Set monthly P&amp;L targets, win rate goals, and drawdown limits. Track your progress with beautiful visuals.
            </p>
            <a href="/account" className="btn-blue inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    )
  }

  const pnlPct  = goals?.monthly_pnl_target  ? Math.min(100, Math.round((monthPnl      / goals.monthly_pnl_target)  * 100)) : 0
  const wrPct   = goals?.win_rate_target      ? Math.min(100, Math.round((monthWinRate  / goals.win_rate_target)      * 100)) : 0
  const ddPct   = goals?.max_drawdown_target  ? Math.min(100, Math.round((maxDD         / goals.max_drawdown_target)  * 100)) : 0
  const hasGoals = goals && (goals.monthly_pnl_target || goals.win_rate_target || goals.max_drawdown_target)

  const avgPctValues = hasGoals && goals ? [
    goals.monthly_pnl_target ? pnlPct : null,
    goals.win_rate_target ? wrPct : null,
    goals.max_drawdown_target ? (100 - ddPct) : null,
  ].filter((v): v is number => v !== null) : []
  const avgPct = avgPctValues.length > 0
    ? Math.round(avgPctValues.reduce((s, v) => s + v, 0) / avgPctValues.length)
    : 0

  // Milestones for each goal
  function pnlMilestones() {
    if (!goals?.monthly_pnl_target) return []
    const t = goals.monthly_pnl_target
    return [
      { label: '25% of target', value: `$${(t * 0.25).toFixed(0)}`, done: monthPnl >= t * 0.25 },
      { label: '50% of target', value: `$${(t * 0.5).toFixed(0)}`,  done: monthPnl >= t * 0.5  },
      { label: '75% of target', value: `$${(t * 0.75).toFixed(0)}`, done: monthPnl >= t * 0.75 },
      { label: 'Target hit! 🎯', value: `$${t.toFixed(0)}`,         done: monthPnl >= t        },
    ]
  }
  function wrMilestones() {
    if (!goals?.win_rate_target) return []
    const t = goals.win_rate_target
    return [
      { label: 'First 5 wins',    value: `${Math.round(t * 0.5)}%`,  done: monthWinRate >= t * 0.5  },
      { label: '75% of target',   value: `${Math.round(t * 0.75)}%`, done: monthWinRate >= t * 0.75 },
      { label: 'Target achieved', value: `${t}%`,                    done: monthWinRate >= t        },
    ]
  }
  function ddMilestones() {
    if (!goals?.max_drawdown_target) return []
    const t = goals.max_drawdown_target
    return [
      { label: 'Within 25% limit', value: `$${(t * 0.25).toFixed(0)}`, done: maxDD < t * 0.25 },
      { label: 'Within 50% limit', value: `$${(t * 0.5).toFixed(0)}`,  done: maxDD < t * 0.5  },
      { label: 'Month complete',   value: 'Stay safe',                  done: false            },
    ]
  }

  const GOALS_CFG = [
    {
      key:   'pnl' as const,
      icon:  TrendingUp,
      accent: '#34d399',
      color:  '#34d399',
      label:  'P&L Target',
      sub:    goals?.monthly_pnl_target ? `$${monthPnl.toFixed(0)} / $${Number(goals.monthly_pnl_target).toFixed(0)}` : 'Not set',
      pct:    mounted ? pnlPct : 0,
      badge:  pnlPct >= 100 ? 'REACHED' : pnlPct >= 50 ? 'ON TRACK' : 'IN PROGRESS',
      badgeBg: pnlPct >= 100 ? 'rgba(52,211,153,0.2)' : pnlPct >= 50 ? 'rgba(52,211,153,0.1)' : 'rgba(30,110,255,0.12)',
      badgeColor: pnlPct >= 100 ? '#34d399' : pnlPct >= 50 ? '#6ee7b7' : '#a78bfa',
      enabled: !!goals?.monthly_pnl_target,
    },
    {
      key:   'wr' as const,
      icon:  Target,
      accent: '#4D90FF',
      color:  '#4D90FF',
      label:  'Win Rate',
      sub:    goals?.win_rate_target ? `${monthWinRate}% / ${Number(goals.win_rate_target).toFixed(0)}%` : 'Not set',
      pct:    mounted ? wrPct : 0,
      badge:  wrPct >= 100 ? 'REACHED' : wrPct >= 50 ? 'ON TRACK' : 'IN PROGRESS',
      badgeBg: wrPct >= 100 ? 'rgba(52,211,153,0.2)' : 'rgba(30,110,255,0.12)',
      badgeColor: wrPct >= 100 ? '#34d399' : '#a78bfa',
      enabled: !!goals?.win_rate_target,
    },
    {
      key:   'dd' as const,
      icon:  ShieldAlert,
      accent: '#f97316',
      color:  '#f97316',
      label:  'Drawdown Limit',
      sub:    goals?.max_drawdown_target ? `$${maxDD.toFixed(0)} / $${Number(goals.max_drawdown_target).toFixed(0)}` : 'Not set',
      pct:    mounted ? ddPct : 0,
      badge:  ddPct >= 100 ? 'LIMIT HIT' : ddPct >= 80 ? 'AT RISK' : 'SAFE',
      badgeBg: ddPct >= 100 ? 'rgba(239,68,68,0.2)' : ddPct >= 80 ? 'rgba(239,68,68,0.12)' : 'rgba(52,211,153,0.1)',
      badgeColor: ddPct >= 80 ? '#f87171' : '#6ee7b7',
      enabled: !!goals?.max_drawdown_target,
    },
  ]

  const active = GOALS_CFG.find(g => g.key === activeGoal)!

  return (
    <div className="px-5 md:px-8 pt-6 md:pt-10 pb-10 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="page-label">Pro · {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}{activeJournal ? ` · ${activeJournal.name}` : ''}</p>
          <h1 className="page-title">Goals &amp; Milestones</h1>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, background: showForm ? 'rgba(30,110,255,0.15)' : 'rgba(255,255,255,0.05)', border: showForm ? '1px solid rgba(30,110,255,0.3)' : '1px solid rgba(255,255,255,0.08)', color: showForm ? '#4D90FF' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          <Settings2 style={{ width: 13, height: 13 }} /> Set Targets
        </button>
      </div>

      {/* ── Set targets form (collapsible) ── */}
      {showForm && (
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', marginBottom: 28 }} className="animate-fade-in">
          <div style={{ padding: '18px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>Set Your Targets</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', marginTop: 3 }}>Resets and tracks monthly</p>
          </div>
          <form onSubmit={handleSave} style={{ padding: '20px 24px' }} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="label" style={{ color: '#34d399' }}>Monthly P&amp;L ($)</label>
                <input type="number" step="any" value={form.monthly_pnl_target} onChange={(e) => setForm(p => ({ ...p, monthly_pnl_target: e.target.value }))} placeholder="e.g. 1000" className="input" style={{ borderColor: 'rgba(52,211,153,0.2)' }} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label" style={{ color: '#4D90FF' }}>Win Rate (%)</label>
                <input type="number" step="any" min="1" max="100" value={form.win_rate_target} onChange={(e) => setForm(p => ({ ...p, win_rate_target: e.target.value }))} placeholder="e.g. 60" className="input" style={{ borderColor: 'rgba(77,144,255,0.2)' }} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label" style={{ color: '#f97316' }}>Max Drawdown ($)</label>
                <input type="number" step="any" value={form.max_drawdown_target} onChange={(e) => setForm(p => ({ ...p, max_drawdown_target: e.target.value }))} placeholder="e.g. 500" className="input" style={{ borderColor: 'rgba(249,115,22,0.2)' }} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Trading Rules</label>
              <textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. No trading after 2 losses in a row…" rows={2} className="input resize-none" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="btn-blue gap-2 self-start">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save Goals'}
              </button>
              {saved && <span style={{ color: '#34d399', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500 }}>✓ Saved</span>}
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary !min-h-0 !py-2 !px-4 !text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!hasGoals && !showForm ? (
        /* ── Empty state ── */
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '52px 36px', textAlign: 'center', maxWidth: 440 }}>
          <div style={{ margin: '0 auto 24px', position: 'relative', width: 88, height: 88 }}>
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
              <circle cx="44" cy="44" r="40" stroke="rgba(30,110,255,0.12)" strokeWidth="3" strokeDasharray="6 6" />
              <circle cx="44" cy="44" r="28" stroke="rgba(52,211,153,0.12)" strokeWidth="3" strokeDasharray="6 6" />
              <circle cx="44" cy="44" r="16" stroke="rgba(251,191,36,0.12)" strokeWidth="3" strokeDasharray="6 6" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.2)' }} />
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 8 }}>No goals set yet</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: 24 }}>Set your monthly P&amp;L target, win rate, and drawdown limit to start tracking progress.</p>
          <button onClick={() => setShowForm(true)} className="btn-blue gap-2 inline-flex">
            <Target className="w-3.5 h-3.5" /> Set First Goal
          </button>
        </div>
      ) : hasGoals ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start" style={{ maxWidth: 1280 }}>
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-6">
          {/* ── Top row: overview donut + goal list ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Multi-ring overview */}
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Monthly Overview</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                  {now.toLocaleDateString('en-US', { month: 'long' })} Progress
                </p>
              </div>
              <div className="flex items-center gap-6">
                {/* Rings */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <MultiRing rings={[
                    { pct: goals?.monthly_pnl_target ? (mounted ? pnlPct : 0) : 0, color: '#34d399', r: 78, stroke: 11 },
                    { pct: goals?.win_rate_target     ? (mounted ? wrPct : 0)  : 0, color: '#4D90FF', r: 60, stroke: 11 },
                    { pct: goals?.max_drawdown_target ? Math.max(0, 100 - (mounted ? ddPct : 0)) : 0, color: '#f97316', r: 42, stroke: 11 },
                  ]} />
                  {/* Center text */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>{avgPct}%</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>overall</span>
                  </div>
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  {GOALS_CFG.map(g => (
                    <div key={g.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.accent, boxShadow: `0 0 6px ${g.accent}88` }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: g.enabled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-display)' }}>{g.label}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: g.enabled ? g.accent : 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-display)' }}>{g.enabled ? `${g.pct}%` : '—'}</span>
                      </div>
                      <Bar pct={g.enabled ? g.pct : 0} color={g.accent} warning={g.key === 'dd'} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Goal selector list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {GOALS_CFG.map(g => (
                <GoalListCard
                  key={g.key}
                  accent={g.accent}
                  icon={g.icon}
                  label={g.label}
                  sub={g.sub}
                  pct={g.enabled ? g.pct : 0}
                  color={g.color}
                  badge={g.enabled ? g.badge : 'NOT SET'}
                  badgeColor={g.enabled ? g.badgeColor : 'rgba(255,255,255,0.25)'}
                  badgeBg={g.enabled ? g.badgeBg : 'rgba(255,255,255,0.05)'}
                  onClick={() => setActiveGoal(g.key)}
                  active={activeGoal === g.key}
                />
              ))}
            </div>
          </div>

          {/* ── Detail panel for active goal ── */}
          <div className="animate-fade-in" key={activeGoal}>
            <div style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '14px 24px 12px', borderTop: `3px solid ${active.accent}`, borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'between', gap: 12 }}>
              <div className="flex items-center gap-2 flex-1">
                {GOALS_CFG.map(g => (
                  <button key={g.key} onClick={() => setActiveGoal(g.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: activeGoal === g.key ? `${g.accent}18` : 'transparent', border: activeGoal === g.key ? `1px solid ${g.accent}33` : '1px solid transparent', color: activeGoal === g.key ? g.accent : 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <g.icon style={{ width: 12, height: 12 }} />{g.label}
                  </button>
                ))}
              </div>
            </div>
            {activeGoal === 'pnl' && goals?.monthly_pnl_target && (
              <DetailCard
                accent="#34d399" icon={TrendingUp} label="Monthly P&L Target"
                currentLabel="This Month" current={`${monthPnl >= 0 ? '+' : '-'}$${Math.abs(monthPnl).toFixed(0)}`}
                targetLabel="Target" target={`$${Number(goals.monthly_pnl_target).toFixed(0)}`}
                pct={mounted ? pnlPct : 0} color="#34d399" reached={monthPnl >= goals.monthly_pnl_target}
                milestones={pnlMilestones()}
              />
            )}
            {activeGoal === 'wr' && goals?.win_rate_target && (
              <DetailCard
                accent="#4D90FF" icon={Target} label="Win Rate Target"
                currentLabel="Current Win Rate" current={`${monthWinRate}%`}
                targetLabel="Target" target={`${Number(goals.win_rate_target).toFixed(0)}%`}
                pct={mounted ? wrPct : 0} color="#4D90FF" reached={monthWinRate >= goals.win_rate_target}
                milestones={wrMilestones()}
              />
            )}
            {activeGoal === 'dd' && goals?.max_drawdown_target && (
              <DetailCard
                accent="#f97316" icon={ShieldAlert} label="Max Drawdown Limit"
                currentLabel="Current Drawdown" current={`$${maxDD.toFixed(0)}`}
                targetLabel="Max Allowed" target={`$${Number(goals.max_drawdown_target).toFixed(0)}`}
                pct={mounted ? ddPct : 0} color="#f97316" reached={maxDD >= goals.max_drawdown_target} warning
                milestones={ddMilestones()}
              />
            )}
            {!active.enabled && (
              <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, fontFamily: 'var(--font-body)' }}>No target set for this goal.</p>
                <button onClick={() => setShowForm(true)} style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4D90FF', fontFamily: 'var(--font-display)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Set target <ChevronRight style={{ width: 13, height: 13 }} />
                </button>
              </div>
            )}
          </div>

          {/* ── Rules ── */}
          {goals?.notes && (
            <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '3px solid rgba(30,110,255,0.5)', borderRadius: 16, padding: '18px 22px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#4D90FF', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Trading Rules</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-body)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{goals.notes}</p>
            </div>
          )}

          {/* ── Streaks + Discipline (mobile only — shown below on desktop) ── */}
          <div className="flex flex-col gap-6 xl:hidden">
            {trades.length > 0 && <StreaksSection currentStreak={currentStreak} bestStreak={bestStreak} greenDayStreak={greenDayStreak} />}
            {trades.length >= 5 && <DisciplineSection discScore={discScore} discScoreColor={discScoreColor} discScoreLabel={discScoreLabel} discBreakdown={discBreakdown} />}
          </div>

          </div>{/* end LEFT COLUMN */}

          {/* ── RIGHT COLUMN — streaks + discipline (desktop only) ── */}
          <div className="hidden xl:flex flex-col gap-6 sticky top-6">
            {trades.length > 0 && <StreaksSection currentStreak={currentStreak} bestStreak={bestStreak} greenDayStreak={greenDayStreak} />}
            {trades.length >= 5 && <DisciplineSection discScore={discScore} discScoreColor={discScoreColor} discScoreLabel={discScoreLabel} discBreakdown={discBreakdown} />}
            {trades.length === 0 && (
              <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px 20px', textAlign: 'center' }}>
                <Flame style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-display)' }}>Log trades to see your streaks &amp; discipline score</p>
              </div>
            )}
          </div>

        </div>
      ) : null}
    </div>
  )
}
