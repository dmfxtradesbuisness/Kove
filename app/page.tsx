'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart2, BookOpen, Sparkles } from 'lucide-react'
import KoveLogo from '@/components/KoveLogo'

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

const NAV_LINKS = ['Pricing', 'Features', 'DMFX']

const FEATURES = [
  {
    icon: BookOpen,
    label: 'Trade Journal',
    title: 'Log every trade. Nothing gets missed.',
    body: 'Entry, exit, SL, TP, lot size, P&L, screenshots. Built fast so it never interrupts your session.',
  },
  {
    icon: BarChart2,
    label: 'Performance Analytics',
    title: 'Data that tells you the truth.',
    body: 'Equity curve, win rate, discipline score, streaks, pair breakdown — all in one view.',
  },
  {
    icon: Sparkles,
    label: 'AI Insights',
    title: 'Pattern detection, not motivation.',
    body: 'AI reads your trade history and surfaces real mistakes, recurring patterns, and behavioral tendencies.',
  },
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

  const BG = '#080808'
  const PURPLE = '#7B6CF5'
  const PURPLE_HI = '#9D8FFF'

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
          {/* Left */}
          <div
            className="text-xs leading-tight font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.01em' }}
          >
            A DMFX<br />Product
          </div>

          {/* Center */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium transition-colors duration-200"
                style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="hidden md:flex items-center justify-center h-9 px-5 rounded-full text-sm font-semibold transition-all duration-200"
              style={{
                background: PURPLE,
                color: '#fff',
                fontFamily: 'var(--font-display)',
                boxShadow: `0 0 20px rgba(123,108,245,0.4)`,
              }}
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="hidden md:flex items-center justify-center h-9 px-5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--font-display)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Grid overlay */}
        <div
          className="pointer-events-none"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Main glowing orb — bright gradient center */}
        <div
          className="orb-drift"
          style={{
            position: 'absolute',
            left: '-8%',
            top: '50%',
            transform: `translate(${parallax.x * 0.4}px, calc(-52% + ${parallax.y * 0.4}px))`,
            width: 'min(80vw, 820px)',
            height: 'min(80vw, 820px)',
            borderRadius: '50%',
            background: `radial-gradient(circle at 42% 42%,
              rgba(145, 92, 255, 0.95) 0%,
              rgba(110, 55, 230, 0.78) 15%,
              rgba(80, 35, 190, 0.58) 32%,
              rgba(50, 18, 130, 0.32) 52%,
              rgba(22, 8, 70, 0.12) 68%,
              transparent 82%)`,
            filter: 'blur(22px)',
          }}
        />

        {/* Inner bright core */}
        <div
          className="pulse-slow"
          style={{
            position: 'absolute',
            left: '4%',
            top: '50%',
            transform: `translate(${parallax.x * 0.2}px, calc(-50% + ${parallax.y * 0.2}px))`,
            width: 'min(28vw, 280px)',
            height: 'min(28vw, 280px)',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(180, 145, 255, 0.75) 0%, rgba(140, 90, 255, 0.35) 45%, transparent 72%)`,
            filter: 'blur(55px)',
          }}
        />

        {/* Hero text — center left */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            paddingLeft: 'max(2.5rem, 5vw)',
            paddingBottom: '3rem',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(5.5rem, 14vw, 13rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 0.88,
              margin: 0,
            }}
          >
            <span style={{ display: 'block', color: '#ffffff' }}>Kove</span>
            <span style={{ display: 'block', color: PURPLE, textShadow: `0 0 80px rgba(123,108,245,0.6)` }}>FX</span>
          </h1>
          <p
            style={{
              marginTop: '2rem',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 'clamp(0.875rem, 1.6vw, 1.1rem)',
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              letterSpacing: '0.005em',
              maxWidth: '480px',
              lineHeight: 1.6,
            }}
          >
            The Ai Trading Journal That actually helps you improve
          </p>
        </div>

        {/* Learn More pill — right */}
        <Link
          href="#features"
          className="hidden lg:flex items-center justify-center transition-all duration-200"
          style={{
            position: 'absolute',
            right: 'max(3rem, 6vw)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '196px',
            height: '60px',
            borderRadius: '999px',
            background: PURPLE,
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: `0 0 50px rgba(123,108,245,0.55), 0 0 100px rgba(123,108,245,0.2), inset 0 1px 0 rgba(255,255,255,0.18)`,
            zIndex: 10,
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.04)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)' }}
        >
          Learn More
        </Link>
      </section>

      {/* ── TICKER ── */}
      <div
        style={{
          background: '#0a0a0a',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
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

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal mb-16">
            <p
              className="page-label mb-3"
              style={{ color: PURPLE }}
            >
              Features
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#fff',
                maxWidth: '600px',
                lineHeight: 1.1,
              }}
            >
              Built for traders who take it seriously.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, title, body }, i) => (
              <div
                key={label}
                className={`reveal reveal-delay-${i + 1} group relative overflow-hidden transition-all duration-300`}
                style={{
                  background: '#0d0d0d',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '28px',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: `rgba(123,108,245,0.1)`, border: '1px solid rgba(123,108,245,0.2)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: PURPLE }} />
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'rgba(123,108,245,0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '8px',
                  }}
                >
                  {label}
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                    marginBottom: '10px',
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.38)',
                    lineHeight: 1.7,
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 md:py-32" style={{ background: '#0a0a0a' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="reveal text-center mb-14">
            <p className="page-label mb-3" style={{ color: PURPLE }}>Pricing</p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
              }}
            >
              Simple. No hidden fees.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Free */}
            <div
              className="reveal"
              style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '28px' }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Free</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>$0</span>
                <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '14px', marginBottom: '6px' }}>/month</span>
              </div>
              {['Trade Journal', 'Calendar P&L view', 'Basic Statistics', 'Screenshot Gallery'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>✓</span>
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>{f}</span>
                </div>
              ))}
              <Link
                href="/signup"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '24px', width: '100%', height: '44px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div
              className="reveal reveal-delay-1"
              style={{
                background: 'linear-gradient(145deg, #141030 0%, #0f0b25 100%)',
                border: `1px solid rgba(123,108,245,0.3)`,
                borderRadius: '12px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 0 50px rgba(123,108,245,0.12)`,
              }}
            >
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: PURPLE, color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-display)', padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.08em' }}>PRO</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 600, color: 'rgba(123,108,245,0.65)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Pro</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>$12</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginBottom: '6px' }}>/month</span>
              </div>
              {['Everything in Free', 'AI Trade Analysis', 'Pattern Detection', 'Mistake Identification', 'Goals & Milestones', 'Priority Support'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(123,108,245,0.18)', border: '1px solid rgba(123,108,245,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', color: PURPLE_HI }}>✓</span>
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-body)' }}>{f}</span>
                </div>
              ))}
              <Link
                href="/signup"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '24px', width: '100%', height: '44px', borderRadius: '8px',
                  background: PURPLE, color: '#fff',
                  fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.15s',
                  boxShadow: `0 0 24px rgba(123,108,245,0.35)`,
                }}
              >
                Start Pro — $12/month
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(123,108,245,0.1) 0%, transparent 70%)` }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="reveal">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
                lineHeight: 1.1,
              }}
            >
              Start tracking your edge today.
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.38)',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
                marginBottom: '2.5rem',
              }}
            >
              Join traders using KoveFX to turn raw data into discipline.
            </p>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 36px',
                borderRadius: '999px',
                background: PURPLE,
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: `0 0 40px rgba(123,108,245,0.4)`,
                letterSpacing: '-0.01em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <KoveLogo size={13} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            KoveFX by DMFX · {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-6">
          {['Pricing', 'Features', 'Sign up', 'Log in'].map((l) => (
            <a
              key={l}
              href="#"
              style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'rgba(255,255,255,0.22)', transition: 'color 0.15s', textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.22)' }}
            >
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
