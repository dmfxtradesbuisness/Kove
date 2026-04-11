'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, BarChart2, BookOpen, Sparkles } from 'lucide-react'
import KoveLogo from '@/components/KoveLogo'

/* ── Scroll-reveal ── */
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

/* ── Mouse parallax ── */
function useParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) =>
      setPos({ x: (e.clientX / window.innerWidth - 0.5) * 32, y: (e.clientY / window.innerHeight - 0.5) * 20 })
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

const NAV_LINKS = ['Pricing', 'Features', 'DMFX']

const FEATURES = [
  { icon: BookOpen, label: 'Trade Journal', title: 'Log every trade. Nothing gets missed.', body: 'Entry, exit, SL, TP, lot size, P&L, screenshots. Built fast so it never interrupts your session.' },
  { icon: BarChart2, label: 'Performance Analytics', title: 'Data that tells you the truth.', body: 'Equity curve, win rate, discipline score, streaks, pair breakdown — all in one view.' },
  { icon: Sparkles, label: 'AI Insights', title: 'Pattern detection, not motivation.', body: 'AI reads your trade history and surfaces real mistakes, recurring patterns, and behavioral tendencies.' },
]

export default function LandingPage() {
  useReveal()
  const parallax = useParallax()
  const [tickers] = useState([...TICKER, ...TICKER])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const BASE = '#060611'
  const PURPLE = '#7B6CF5'
  const PURPLE_DIM = '#6C5DD3'

  return (
    <div style={{ background: BASE, color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(6,6,17,0.9)' : 'rgba(6,6,17,0.6)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
          {/* Left — brand */}
          <div
            className="text-xs leading-tight font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}
          >
            A DMFX<br />Product
          </div>

          {/* Center — links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium transition-all duration-200 relative group"
                style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
              >
                {link}
                <span
                  className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                  style={{ background: PURPLE }}
                />
              </a>
            ))}
          </div>

          {/* Right — CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
              style={{
                fontFamily: 'var(--font-display)',
                background: PURPLE_DIM,
                color: '#fff',
                boxShadow: `0 2px 12px rgba(108,93,211,0.4)`,
              }}
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium transition-all duration-200"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col" style={{ overflow: 'hidden' }}>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Large orb — left center */}
        <div
          className="absolute pointer-events-none orb-drift"
          style={{
            width: 'min(70vw, 700px)',
            height: 'min(70vw, 700px)',
            borderRadius: '50%',
            left: '-10%',
            top: '50%',
            transform: `translate(${parallax.x * 0.4}px, calc(-50% + ${parallax.y * 0.3}px))`,
            background: 'radial-gradient(circle at 40% 40%, #2d1b69 0%, #1a0f3a 35%, #0d0826 65%, transparent 85%)',
            filter: 'blur(1px)',
          }}
        />

        {/* Secondary glow */}
        <div
          className="absolute pointer-events-none pulse-slow"
          style={{
            width: 'min(45vw, 500px)',
            height: 'min(45vw, 500px)',
            borderRadius: '50%',
            left: '5%',
            top: '55%',
            transform: `translate(${parallax.x * 0.2}px, calc(-50% + ${parallax.y * 0.2}px))`,
            background: 'radial-gradient(circle at 50% 50%, rgba(108,93,211,0.25) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Hero content */}
        <div className="relative flex-1 flex flex-col justify-end pb-[12vh] pt-[100px] px-6 md:px-12 max-w-7xl mx-auto w-full">

          {/* "Learn More" pill — right side, desktop only */}
          <Link
            href="#features"
            className="hidden lg:flex items-center justify-center absolute right-12 top-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              width: '200px',
              height: '60px',
              borderRadius: '999px',
              background: PURPLE_DIM,
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: `0 4px 24px rgba(108,93,211,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`,
              letterSpacing: '-0.01em',
            }}
          >
            Learn More
          </Link>

          {/* Main headline */}
          <div className="animate-fade-in-up max-w-[min(90vw,900px)]">
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(4rem, 14vw, 11rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                margin: 0,
              }}
            >
              <span style={{ color: '#ffffff' }}>Kove </span>
              <span style={{ color: PURPLE }}> FX</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="mt-6 animate-fade-in-up"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 400,
              maxWidth: '520px',
              lineHeight: 1.6,
              animationDelay: '0.1s',
            }}
          >
            The Ai Trading Journal That actually helps you improve.
          </p>

          {/* Mobile CTAs */}
          <div className="flex items-center gap-3 mt-8 lg:hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ fontFamily: 'var(--font-display)', background: PURPLE_DIM, color: '#fff', boxShadow: `0 2px 16px rgba(108,93,211,0.45)` }}
            >
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium px-5 py-3 rounded-full transition-all"
              style={{ fontFamily: 'var(--font-display)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${BASE})` }}
        />
      </section>

      {/* ── TICKER ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(12,13,30,0.8)' }}
      >
        <div className="flex gap-12 ticker-track whitespace-nowrap">
          {tickers.map((t, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <span className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.7)' }}>{t.pair}</span>
              <span className="text-[13px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.price}</span>
              <span className="text-[11px] font-semibold" style={{ color: t.up ? '#34D399' : '#F87171' }}>{t.change}</span>
            </div>
          ))}
        </div>
        <div className="absolute left-0 inset-y-0 w-20 pointer-events-none" style={{ background: `linear-gradient(to right, ${BASE}, transparent)` }} />
        <div className="absolute right-0 inset-y-0 w-20 pointer-events-none" style={{ background: `linear-gradient(to left, ${BASE}, transparent)` }} />
      </div>

      {/* ── DASHBOARD PREVIEW ──────────────────────────────── */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-5xl mx-auto reveal">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: '1px solid rgba(108,93,211,0.2)',
              background: 'var(--surface-1)',
              boxShadow: '0 0 0 1px rgba(108,93,211,0.1), 0 40px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Chrome bar */}
            <div
              className="flex items-center gap-1.5 px-4 py-3"
              style={{ background: 'var(--surface-2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              {['#FF5F57','#FEBC2E','#28C840'].map((c) => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.7 }} />
              ))}
              <div
                className="flex-1 mx-3 h-6 rounded text-[11px] flex items-center px-3"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}
              >
                app.kovefx.com/journal
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="p-5 grid md:grid-cols-[160px_1fr] gap-5">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col gap-1 border-r pr-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                    <KoveLogo size={16} />
                  </div>
                  <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>KoveFX</span>
                </div>
                {['Journal','Stats','Goals','Gallery','AI Insights'].map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium"
                    style={{
                      fontFamily: 'var(--font-display)',
                      background: i === 0 ? 'rgba(108,93,211,0.15)' : 'transparent',
                      color: i === 0 ? '#8B7CF8' : 'rgba(255,255,255,0.25)',
                      borderLeft: i === 0 ? '2px solid #6C5DD3' : '2px solid transparent',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Main */}
              <div className="flex flex-col gap-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total P&L', value: '+$4,820.00', color: '#34D399' },
                    { label: 'Win Rate', value: '63.2%', color: '#34D399' },
                    { label: 'Trades', value: '47', color: '#fff' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg p-3.5" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-[10px] mb-2" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                      <p className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Equity curve */}
                <div className="rounded-lg p-4" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] mb-3" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Equity Curve</p>
                  <svg viewBox="0 0 300 56" className="w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6C5DD3" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6C5DD3" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d="M0 48 L30 42 L60 46 L90 36 L120 40 L150 28 L180 20 L210 16 L240 10 L270 6 L300 3 L300 56 L0 56 Z" fill="url(#grad)" />
                    <path d="M0 48 L30 42 L60 46 L90 36 L120 40 L150 28 L180 20 L210 16 L240 10 L270 6 L300 3" fill="none" stroke="#7B6CF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Trade rows */}
                <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    { pair:'EUR/USD', type:'BUY', pnl:'+$240.00', pos:true, date:'Apr 9' },
                    { pair:'XAU/USD', type:'SELL', pnl:'-$80.00', pos:false, date:'Apr 8' },
                    { pair:'GBP/USD', type:'BUY', pnl:'+$185.50', pos:true, date:'Apr 7' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-display)', background: t.type==='BUY' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: t.type==='BUY' ? '#34D399' : '#F87171' }}>{t.type}</span>
                        <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>{t.pair}</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{t.date}</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-display)', color: t.pos ? '#34D399' : '#F87171' }}>{t.pnl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="py-20 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 reveal">
            <p className="text-[11px] font-medium mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              What it does
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', lineHeight: 1.1 }}
            >
              Everything a serious trader needs.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Nothing they don&apos;t.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, title, body }, i) => (
              <div
                key={label}
                className={`reveal reveal-delay-${i + 1} p-6 rounded-xl flex flex-col gap-4 transition-all duration-300 hover:-translate-y-0.5`}
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,93,211,0.3)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(108,93,211,0.15)', border: '1px solid rgba(108,93,211,0.25)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#8B7CF8' }} />
                </div>
                <div>
                  <p className="text-[10px] font-medium mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
                  <p className="text-base font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '-0.01em' }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto reveal">
          <div className="grid md:grid-cols-2 gap-5 items-start">
            {/* Free */}
            <div
              className="p-7 rounded-xl flex flex-col gap-5 transition-all duration-300"
              style={{ background: 'var(--surface-1)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div>
                <p className="text-[10px] font-medium mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Free</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>$0</span>
                  <span className="text-sm" style={{ color: 'var(--text-3)' }}>/month</span>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {['Trade log with 180+ instruments','P&L calendar + equity curve','Pre-trade checklist system','Weekly & monthly performance wrap','Streak and discipline tracking'].map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#34D399' }} />
                    <span className="text-sm" style={{ color: 'var(--text-2)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-secondary w-full mt-auto">Start free</Link>
            </div>

            {/* Pro */}
            <div
              className="p-7 rounded-xl flex flex-col gap-5 relative overflow-hidden transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #1a1238 0%, #0f0d22 100%)',
                border: '1px solid rgba(108,93,211,0.4)',
                boxShadow: '0 0 40px rgba(108,93,211,0.15)',
              }}
            >
              {/* Subtle inner glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 70% 0%, rgba(108,93,211,0.15) 0%, transparent 60%)' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] font-medium" style={{ fontFamily: 'var(--font-display)', color: '#8B7CF8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pro</p>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(108,93,211,0.25)', color: '#8B7CF8', border: '1px solid rgba(108,93,211,0.3)' }}>POPULAR</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>$12</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>/month</span>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 relative">
                {['Everything in free','AI trade analysis (GPT-4o)','Mistake & pattern detection','Behavioral tendency insights','Goals & milestone tracking'].map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7B6CF5' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                className="relative w-full py-3 rounded-lg text-sm font-semibold text-white text-center transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'var(--accent)',
                  boxShadow: '0 2px 16px rgba(108,93,211,0.5)',
                }}
              >
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-28 px-5 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(108,93,211,0.1) 0%, transparent 70%)' }} />
        <div className="max-w-2xl mx-auto text-center relative reveal">
          <h2
            className="mb-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.025em', color: '#fff' }}
          >
            Start journaling. Start improving.
          </h2>
          <p className="mb-8 text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Free to use. No card required. Live in two minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-8 py-4 rounded-full transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'var(--accent)',
              boxShadow: '0 4px 24px rgba(108,93,211,0.5)',
            }}
          >
            Create your account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-8 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <KoveLogo size={16} />
            </div>
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.4)' }}>KoveFX</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            A DMFX Product · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
