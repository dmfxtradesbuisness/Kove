'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { KoveWordmark } from '@/components/KoveLogo'

const BLUE      = '#1E6EFF'
const BLUE_HI   = '#4D90FF'
const BLUE_GLOW = 'rgba(30,110,255,0.28)'

// ─── Data ─────────────────────────────────────────────────────────────────────

const MARKETS = [
  { value: 'forex',   label: 'Forex',          sub: 'EUR/USD, GBP/USD, XAU/USD…' },
  { value: 'crypto',  label: 'Crypto',          sub: 'BTC, ETH, altcoins…' },
  { value: 'stocks',  label: 'Stocks',          sub: 'Equities, options…' },
  { value: 'futures', label: 'Futures / Index', sub: 'NQ, ES, US30…' },
  { value: 'mixed',   label: 'Mixed',           sub: 'I trade multiple markets' },
]

const ACCOUNT_TYPES = [
  { value: 'prop',  label: 'Prop Firm',          sub: 'FTMO, MyFundedFX, Apex…' },
  { value: 'live',  label: 'Personal Live',       sub: 'My own capital' },
  { value: 'both',  label: 'Both',                sub: 'Prop + personal accounts' },
]

const PROBLEMS = [
  { value: 'overtrading',      label: 'Overtrading',              sub: 'I take too many setups' },
  { value: 'revenge_trading',  label: 'Revenge trading',          sub: 'I trade to recover losses' },
  { value: 'bad_entries',      label: 'Bad entries',              sub: 'I get in too early or too late' },
  { value: 'cutting_winners',  label: 'Cutting winners short',    sub: 'I close profitable trades too soon' },
  { value: 'emotional',        label: 'Emotional decisions',      sub: 'Fear, FOMO, or impulsive trading' },
]

// ─── Selection Card ────────────────────────────────────────────────────────────

function SelectCard({
  label, sub, selected, onClick,
}: { label: string; sub: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px 20px',
        borderRadius: 12,
        border: selected
          ? `1.5px solid ${BLUE}`
          : '1px solid rgba(255,255,255,0.08)',
        background: selected
          ? 'rgba(30,110,255,0.08)'
          : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        boxShadow: selected ? `0 0 20px ${BLUE_GLOW}` : 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)'
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
        }
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
          color: selected ? '#fff' : 'rgba(255,255,255,0.7)',
          margin: 0, lineHeight: 1.3,
        }}>{label}</p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 12,
          color: selected ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.28)',
          margin: '3px 0 0',
        }}>{sub}</p>
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        border: selected ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
        background: selected ? BLUE : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        {selected && <Check style={{ width: 11, height: 11, color: '#fff' }} />}
      </div>
    </button>
  )
}

// ─── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i + 1 === current ? 20 : 6,
          height: 6, borderRadius: 999,
          background: i + 1 <= current ? BLUE : 'rgba(255,255,255,0.12)',
          transition: 'all 0.25s',
        }} />
      ))}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step,              setStep]              = useState(1)
  const [market,            setMarket]            = useState('')
  const [accountType,       setAccountType]       = useState('')
  const [biggestProblem,    setBiggestProblem]    = useState('')
  const [dailyTradeLimit,   setDailyTradeLimit]   = useState('5')
  const [monthlyTarget,     setMonthlyTarget]     = useState('')
  const [accountBalance,    setAccountBalance]    = useState('')
  const [saving,            setSaving]            = useState(false)
  const [checking,          setChecking]          = useState(true)

  // Redirect if already onboarded
  useEffect(() => {
    fetch('/api/onboarding')
      .then(r => r.json())
      .then(({ prefs }) => {
        if (prefs?.onboarding_completed) router.replace('/journal')
        else setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [router])

  async function complete() {
    setSaving(true)
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market,
          account_type: accountType,
          biggest_problem: biggestProblem,
          daily_trade_limit: dailyTradeLimit ? Number(dailyTradeLimit) : null,
          monthly_pnl_target: monthlyTarget ? Number(monthlyTarget) : null,
          account_balance: accountBalance ? Number(accountBalance) : null,
        }),
      })
      router.push('/journal')
    } catch {
      setSaving(false)
    }
  }

  const canNext =
    (step === 1 && !!market) ||
    (step === 2 && !!accountType) ||
    (step === 3 && !!biggestProblem) ||
    step === 4

  if (checking) {
    return (
      <div style={{ background: '#030408', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.5)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-content { animation: stepIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ background: '#030408', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column' }}>

        {/* Nav */}
        <nav style={{ padding: '0 max(24px,5vw)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <KoveWordmark height={22} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>
            Step {step} of 4
          </span>
        </nav>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px max(24px,5vw) 40px' }}>
          <div style={{ width: '100%', maxWidth: 480 }}>

            <div key={step} className="step-content">
              <ProgressDots total={4} current={step} />
              <div style={{ marginTop: 32, marginBottom: 32 }}>

                {step === 1 && (
                  <>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                      Markets
                    </p>
                    <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 8, color: '#fff' }}>
                      What do you trade?
                    </h1>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
                      Kove uses this to personalize your coaching and pair suggestions.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {MARKETS.map(m => (
                        <SelectCard key={m.value} label={m.label} sub={m.sub} selected={market === m.value} onClick={() => setMarket(m.value)} />
                      ))}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                      Account
                    </p>
                    <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 8, color: '#fff' }}>
                      How do you trade?
                    </h1>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
                      Prop firm traders get drawdown-aware coaching. Personal accounts focus on pure P&L growth.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {ACCOUNT_TYPES.map(a => (
                        <SelectCard key={a.value} label={a.label} sub={a.sub} selected={accountType === a.value} onClick={() => setAccountType(a.value)} />
                      ))}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                      Your challenge
                    </p>
                    <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 8, color: '#fff' }}>
                      What&apos;s your biggest problem right now?
                    </h1>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
                      Be honest. Kove will watch for this pattern in every trade you log and flag it the moment it appears.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {PROBLEMS.map(p => (
                        <SelectCard key={p.value} label={p.label} sub={p.sub} selected={biggestProblem === p.value} onClick={() => setBiggestProblem(p.value)} />
                      ))}
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                      Your rules
                    </p>
                    <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 8, color: '#fff' }}>
                      Set your trading rules.
                    </h1>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
                      These become the backbone of your discipline score. You can change them anytime in Goals.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>
                          Daily trade limit
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <input
                            type="number"
                            min={1} max={50}
                            value={dailyTradeLimit}
                            onChange={e => setDailyTradeLimit(e.target.value)}
                            placeholder="5"
                            style={{
                              width: 80,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: 10,
                              padding: '12px 16px',
                              fontSize: 16,
                              fontWeight: 600,
                              color: '#fff',
                              fontFamily: 'var(--font-body)',
                              outline: 'none',
                              textAlign: 'center',
                            }}
                            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = BLUE }}
                            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
                          />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                            trades per day maximum
                          </span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>
                          Kove will warn you when you approach this number.
                        </p>
                      </div>

                      <div>
                        <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>
                          Monthly P&L target <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>(optional)</span>
                        </label>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>$</span>
                          <input
                            type="number"
                            min={0}
                            value={monthlyTarget}
                            onChange={e => setMonthlyTarget(e.target.value)}
                            placeholder="1000"
                            style={{
                              width: 140,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: 10,
                              padding: '12px 16px 12px 28px',
                              fontSize: 16,
                              fontWeight: 600,
                              color: '#fff',
                              fontFamily: 'var(--font-body)',
                              outline: 'none',
                            }}
                            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = BLUE }}
                            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>
                          Starting balance <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>(optional)</span>
                        </label>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>$</span>
                          <input
                            type="number"
                            min={0}
                            value={accountBalance}
                            onChange={e => setAccountBalance(e.target.value)}
                            placeholder="10000"
                            style={{
                              width: 140,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: 10,
                              padding: '12px 16px 12px 28px',
                              fontSize: 16,
                              fontWeight: 600,
                              color: '#fff',
                              fontFamily: 'var(--font-body)',
                              outline: 'none',
                            }}
                            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = BLUE }}
                            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                {step > 1 ? (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '12px 20px', borderRadius: 10,
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.45)',
                      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)' }}
                  >
                    <ArrowLeft style={{ width: 14, height: 14 }} />
                    Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button
                    onClick={() => canNext && setStep(s => s + 1)}
                    disabled={!canNext}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '12px 28px', borderRadius: 10,
                      background: canNext ? BLUE : 'rgba(255,255,255,0.06)',
                      border: 'none',
                      color: canNext ? '#fff' : 'rgba(255,255,255,0.2)',
                      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                      cursor: canNext ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s',
                      boxShadow: canNext ? `0 0 24px ${BLUE_GLOW}` : 'none',
                    }}
                    onMouseEnter={e => { if (canNext) (e.currentTarget as HTMLElement).style.background = BLUE_HI }}
                    onMouseLeave={e => { if (canNext) (e.currentTarget as HTMLElement).style.background = BLUE }}
                  >
                    Continue
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </button>
                ) : (
                  <button
                    onClick={complete}
                    disabled={saving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '12px 28px', borderRadius: 10,
                      background: BLUE, border: 'none',
                      color: '#fff',
                      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      transition: 'all 0.15s',
                      boxShadow: `0 0 28px ${BLUE_GLOW}`,
                    }}
                    onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = BLUE_HI }}
                    onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = BLUE }}
                  >
                    {saving ? 'Setting up…' : 'Start improving'}
                    {!saving && <ArrowRight style={{ width: 14, height: 14 }} />}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div style={{ textAlign: 'center', padding: '0 24px 32px', flexShrink: 0 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
            You can update all of this anytime in your account settings.
          </p>
        </div>
      </div>
    </>
  )
}
