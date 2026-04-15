'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart2, BookOpen, Sparkles, Brain, TrendingUp, Clock, Target, Zap, ArrowRight, Check } from 'lucide-react'
import KoveLogo, { KoveWordmark } from '@/components/KoveLogo'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) =>
      setPos({ x: (e.clientX / window.innerWidth - 0.5) * 30, y: (e.clientY / window.innerHeight - 0.5) * 20 })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])
  return pos
}

const TICKER = [
  { pair: 'EUR/USD', price: '1.0854', change: '+0.12%', up: true },
  { pair: 'GBP/USD', price: '1.2634', change: '-0.08%', up: false },
  { pair: 'XAU/USD', price: '2,345.10', change: '+0.54%', up: true },
  { pair: 'USD/JPY', price: '149.22', change: '+0.31%', up: true },
  { pair: 'BTC/USD', price: '68,210', change: '+1.24%', up: true },
  { pair: 'GBP/JPY', price: '192.34', change: '-0.19%', up: false },
  { pair: 'NAS100', price: '18,420', change: '+0.44%', up: true },
  { pair: 'ETH/USD', price: '3,412', change: '+0.91%', up: true },
  { pair: 'USD/CHF', price: '0.9012', change: '-0.22%', up: false },
  { pair: 'AUD/USD', price: '0.6482', change: '+0.07%', up: true },
]

const NAV_LINKS = ['Features', 'Pricing', 'FAQ']

const FEATURES = [
  {
    icon: BookOpen,
    label: 'Starter',
    tag: 'FREE',
    tagColor: 'rgba(255,255,255,0.2)',
    title: 'Log everything. Miss nothing.',
    body: 'Entry, exit, SL, TP, lot size, P&L, pair, notes. Built fast so it never interrupts your session. Unlimited trades, forever free.',
  },
  {
    icon: BarChart2,
    label: 'Performance Data',
    tag: 'FREE',
    tagColor: 'rgba(255,255,255,0.2)',
    title: 'The truth about your trading.',
    body: 'Win rate, equity curve, P&L breakdown, streak tracking. Raw data with zero interpretation. You see the numbers — Starter stops there.',
  },
  {
    icon: Brain,
    label: 'AI Intelligence',
    tag: 'PRO',
    tagColor: '#7B6CF5',
    title: 'Why you\'re losing. Exactly.',
    body: 'AI reads your entire trade history and tells you what\'s actually destroying your consistency. Behavioral patterns, emotional triggers, time-of-day leakage — named precisely.',
  },
]

const PRO_INSIGHTS = [
  { stat: '#1 Issue', value: 'Revenge trading after losses', icon: '⚠️' },
  { stat: 'Friday Effect', value: 'You lose 62% more on Fridays', icon: '📉' },
  { stat: 'Tilt Pattern', value: 'Win rate drops 18% after 3 losses', icon: '🧠' },
  { stat: 'Best Setup', value: 'Morning breakout — 71% win rate', icon: '🎯' },
]

const FREE_FEATURES = [
  'Unlimited trade logging',
  'Full trade history',
  'Basic stats (win/loss, P&L)',
  'Manual trade notes',
  'Screenshot gallery',
]

const PRO_FEATURES = [
  'AI performance breakdowns',
  'Behavioral pattern recognition',
  'Emotional trading detection',
  'Discipline score + tracking',
  'Time-of-day performance analysis',
  'Setup profitability analysis',
  'Weekly AI insights report',
  'Personalized improvement plan',
]

export default function LandingPage() {
  useReveal()
  const parallax = useParallax()
  const [tickers] = useState([...TICKER, ...TICKER])
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const BG = '#080808'
  const PURPLE = '#7B6CF5'

  return (
    <div style={{ background: BG, color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(8,8,8,0.95)' : 'rgba(8,8,8,0.4)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <KoveWordmark height={30} />
          </Link>
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="text-sm font-medium transition-colors duration-200"
                style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
              >{link}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup"
              className="hidden md:flex items-center justify-center h-9 px-5 rounded-full text-sm font-semibold"
              style={{ background: PURPLE, color: '#fff', fontFamily: 'var(--font-display)', boxShadow: '0 0 20px rgba(123,108,245,0.4)' }}
            >
              Start free
            </Link>
            <Link href="/login"
              className="hidden md:flex items-center justify-center h-9 px-5 rounded-full text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-display)', border: '1px solid rgba(255,255,255,0.12)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
            >
              Log in
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {/* Grid */}
        <div className="pointer-events-none" style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />

        {/* Orb */}
        <div className="orb-drift" style={{ position: 'absolute', left: '-8%', top: '50%', transform: `translate(${parallax.x * 0.4}px, calc(-52% + ${parallax.y * 0.4}px))`, width: 'min(80vw, 820px)', height: 'min(80vw, 820px)', borderRadius: '50%', background: 'radial-gradient(circle at 42% 42%, rgba(145,92,255,0.95) 0%, rgba(110,55,230,0.78) 15%, rgba(80,35,190,0.58) 32%, rgba(50,18,130,0.32) 52%, rgba(22,8,70,0.12) 68%, transparent 82%)', filter: 'blur(22px)' }} />
        <div className="pulse-slow" style={{ position: 'absolute', left: '4%', top: '50%', transform: `translate(${parallax.x * 0.2}px, calc(-50% + ${parallax.y * 0.2}px))`, width: 'min(28vw, 280px)', height: 'min(28vw, 280px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,145,255,0.75) 0%, rgba(140,90,255,0.35) 45%, transparent 72%)', filter: 'blur(55px)' }} />

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 10, paddingLeft: 'max(2.5rem, 5vw)', paddingBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(5.5rem, 14vw, 13rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.88, margin: 0 }}>
            <span style={{ display: 'block', color: '#ffffff' }}>Kove</span>
            <span style={{ display: 'block', color: PURPLE, textShadow: '0 0 80px rgba(123,108,245,0.6)' }}>FX</span>
          </h1>
          <p style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.875rem, 1.6vw, 1.1rem)', fontFamily: 'var(--font-body)', fontWeight: 300, letterSpacing: '0.005em', maxWidth: '440px', lineHeight: 1.6 }}>
            Stop guessing why you&apos;re losing trades.<br />
            See exactly what&apos;s destroying your consistency.
          </p>
          <div className="flex items-center gap-3 mt-8">
            <Link href="/signup"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: PURPLE, color: '#fff', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 0 40px rgba(123,108,245,0.45)', letterSpacing: '-0.01em' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#pricing"
              style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 24px', borderRadius: 999, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.22)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              See pricing
            </a>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', height: '40px', display: 'flex', alignItems: 'center' }}>
        <div className="ticker-track flex items-center gap-12" style={{ whiteSpace: 'nowrap' }}>
          {tickers.map((t, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{t.pair}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>{t.price}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: t.up ? '#34D399' : '#F87171', fontWeight: 600 }}>{t.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROBLEM STATEMENT ── */}
      <section className="py-24 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="reveal">
            <p className="page-label mb-4" style={{ color: PURPLE }}>The problem</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#fff', marginBottom: '1.5rem' }}>
              You already know you&apos;re making mistakes.<br />
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>You just don&apos;t know which ones.</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto' }}>
              Most traders log trades but never understand them. You see the numbers — but not the behavioral patterns behind them. The revenge trades, the Friday slippage, the tilt spirals. KoveFX makes those visible.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-12 md:py-16" style={{ background: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal mb-14">
            <p className="page-label mb-3" style={{ color: PURPLE }}>How it works</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', maxWidth: 600, lineHeight: 1.1 }}>
              Starter tracks data.<br />Pro understands it.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, tag, tagColor, title, body }, i) => (
              <div key={label}
                className={`reveal reveal-delay-${i + 1} transition-all duration-300`}
                style={{ background: tag === 'PRO' ? 'linear-gradient(145deg,#141030,#0f0b25)' : '#0d0d0d', border: `1px solid ${tag === 'PRO' ? 'rgba(123,108,245,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: 28, position: 'relative', boxShadow: tag === 'PRO' ? '0 0 40px rgba(123,108,245,0.1)' : 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = tag === 'PRO' ? 'rgba(123,108,245,0.5)' : 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = tag === 'PRO' ? 'rgba(123,108,245,0.3)' : 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ position: 'absolute', top: 16, right: 16, background: tag === 'PRO' ? PURPLE : 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-display)', padding: '3px 8px', borderRadius: 999, letterSpacing: '0.1em' }}>{tag}</div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ background: 'rgba(123,108,245,0.1)', border: '1px solid rgba(123,108,245,0.2)' }}>
                  <Icon className="w-4 h-4" style={{ color: PURPLE }} />
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, color: 'rgba(123,108,245,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{label}</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.3 }}>{title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRO WOW MOMENT (what you actually see) ── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(123,108,245,0.08) 0%, transparent 70%)' }} />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="reveal text-center mb-14">
            <p className="page-label mb-3" style={{ color: PURPLE }}>Pro Intelligence</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
              This is what Pro shows you<br />
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>on day one.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {PRO_INSIGHTS.map((ins, i) => (
              <div key={i}
                className={`reveal reveal-delay-${i + 1}`}
                style={{ background: 'linear-gradient(145deg,#111028,#0d0b22)', border: '1px solid rgba(123,108,245,0.2)', borderRadius: 16, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20 }}
              >
                <span style={{ fontSize: 32, flexShrink: 0 }}>{ins.icon}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'rgba(123,108,245,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{ins.stat}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{ins.value}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 reveal" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
            Generated from your actual trade history. Not generic advice.
          </p>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 md:py-32" style={{ background: '#0a0a0a' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="reveal text-center mb-14">
            <p className="page-label mb-3" style={{ color: PURPLE }}>Pricing</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em' }}>
              The difference between random trading<br />and consistent performance.
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>
              Starter is free forever. Pro is where the intelligence lives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="reveal" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32 }}>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '4px 12px', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginBottom: 16 }}>STARTER</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>$0</span>
                <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 14, marginBottom: 6 }}>/month</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24, lineHeight: 1.5 }}>Track everything. Zero intelligence layer.</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, marginBottom: 24 }}>
                {FREE_FEATURES.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>{f}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>No AI insights or behavioral analysis</span>
                </div>
              </div>
              <Link href="/signup" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 46, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.22)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
              >
                Start free — no card needed
              </Link>
            </div>

            {/* Pro */}
            <div className="reveal reveal-delay-1" style={{ background: 'linear-gradient(145deg,#141030 0%,#0f0b25 100%)', border: '1px solid rgba(123,108,245,0.35)', borderRadius: 16, padding: 32, position: 'relative', overflow: 'hidden', boxShadow: '0 0 60px rgba(123,108,245,0.15)' }}>
              {/* Glow */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,108,245,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <div style={{ display: 'inline-block', background: 'rgba(123,108,245,0.2)', border: '1px solid rgba(123,108,245,0.4)', borderRadius: 999, padding: '4px 12px', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#a89cff', letterSpacing: '0.1em', marginBottom: 16 }}>PRO</div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>$19</span>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', lineHeight: 1 }}>$29/mo</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>/month</span>
                </div>
                <div style={{ marginBottom: 8, marginLeft: 4, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#34d399' }}>SAVE 35%</div>
              </div>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, lineHeight: 1.5 }}>Turn inconsistent traders into disciplined, data-aware performers.</p>

              <div style={{ borderTop: '1px solid rgba(123,108,245,0.15)', paddingTop: 20, marginBottom: 24 }}>
                {PRO_FEATURES.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(123,108,245,0.2)', border: '1px solid rgba(123,108,245,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check className="w-2.5 h-2.5" style={{ color: '#9D8FFF' }} />
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-body)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/signup"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 48, borderRadius: 10, background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 30px rgba(123,108,245,0.4)', transition: 'all 0.15s', letterSpacing: '-0.01em' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(123,108,245,0.55)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(123,108,245,0.4)' }}
              >
                Start Pro — $19/month <ArrowRight className="w-4 h-4" />
              </Link>
              <p style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>Cancel anytime · 7-day money back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 md:py-32" style={{ background: '#0a0a0a' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="reveal text-center mb-14">
            <p className="page-label mb-3" style={{ color: '#7B6CF5' }}>FAQ</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1 }}>
              Everything you need to know.
            </h2>
          </div>
          <div className="reveal">
            {[
              {
                q: 'How do I log a trade?',
                a: 'Go to the Trade Journal from the sidebar. Tap the + button, fill in the pair, entry/exit, stop loss, take profit, lot size, and any notes. P&L calculates automatically for closed trades.',
              },
              {
                q: "What's the Discipline Score?",
                a: 'The Discipline Score (0–100) grades your trading behavior across four categories: stop loss usage, win rate, overtrading frequency, and revenge trading patterns. It updates every time you log a trade.',
              },
              {
                q: 'How does Win Rate work?',
                a: "Win rate only starts calculating after you've logged at least 10 closed trades. This prevents meaningless percentages from a small sample size.",
              },
              {
                q: 'What is the Goals tab?',
                a: 'Set monthly targets for P&L, win rate, and max drawdown. KoveFX tracks progress with visual rings and milestone checklists so you always know where you stand.',
              },
              {
                q: "What's in the Economic Calendar?",
                a: "The News tab shows this week's high-impact market events — CPI, NFP, FOMC, PPI, GDP, and more. Filter by impact level (High/Med/Low) or by currency (USD, EUR, GBP, JPY, NQ).",
              },
              {
                q: 'What is the Community tab?',
                a: 'Share trade setups, wins, losses, and market reactions with other traders. Follow people, react to posts, and see a curated feed. There\'s also a Discord server to join for live discussion.',
              },
              {
                q: 'What is the Screenshot Gallery?',
                a: 'Upload and organize your chart screenshots for trade review. Great for visual journaling and pattern recognition.',
              },
              {
                q: 'Is my data private?',
                a: 'Yes. Your trades, journal entries, and statistics are private by default. Only your Community posts are visible to others — and only when you choose to post.',
              },
              {
                q: 'Do I need a credit card to start?',
                a: 'No. Starter is completely free forever with no card required. Pro ($19/month) unlocks the full AI intelligence layer.',
              },
              {
                q: "What's the difference between Starter and Pro?",
                a: 'Starter gives you unlimited trade logging, full history, and basic stats. Pro adds behavioral AI analysis, discipline scoring, pattern detection, and personalized insights.',
              },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.4 }}>{item.q}</span>
                  <span style={{ flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: openFaq === i ? '#7B6CF5' : 'rgba(255,255,255,0.35)', lineHeight: 1, transition: 'color 0.15s' }}>
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, paddingBottom: 20, margin: 0 }}>
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUTCOME CTA ── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(123,108,245,0.1) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="reveal">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: 1.1 }}>
              Fix the habits costing you money.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '1rem', fontFamily: 'var(--font-body)', marginBottom: '2.5rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
              KoveFX Pro is the difference between random trading and consistent, disciplined performance.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/signup"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', borderRadius: 999, background: PURPLE, color: '#fff', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 0 40px rgba(123,108,245,0.4)', letterSpacing: '-0.01em', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              >
                Start free account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/signup"
                style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-display)', fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', padding: '14px 8px', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}
              >
                Or go Pro from day one →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div className="flex items-center gap-3">
          <KoveWordmark height={22} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>by DMFX · {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          {[['Features', '#features'], ['Pricing', '#pricing'], ['Sign up', '/signup'], ['Log in', '/login']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'rgba(255,255,255,0.22)', transition: 'color 0.15s', textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.22)' }}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
