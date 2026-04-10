'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, ArrowRight, BarChart2, BookOpen, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react'

/* ── Scroll reveal ── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const TICKER = [
  { pair: 'EUR/USD', price: '1.0854', change: '+0.12%', up: true },
  { pair: 'GBP/USD', price: '1.2634', change: '-0.08%', up: false },
  { pair: 'XAU/USD', price: '2,345.10', change: '+0.54%', up: true },
  { pair: 'USD/JPY', price: '149.22', change: '+0.31%', up: true },
  { pair: 'BTC/USD', price: '68,210', change: '+1.24%', up: true },
  { pair: 'GBP/JPY', price: '192.34', change: '-0.19%', up: false },
  { pair: 'NAS100', price: '18,420', change: '+0.44%', up: true },
  { pair: 'AUD/USD', price: '0.6482', change: '+0.07%', up: true },
  { pair: 'USD/CHF', price: '0.9012', change: '-0.22%', up: false },
  { pair: 'ETH/USD', price: '3,412', change: '+0.91%', up: true },
]

const FEATURES = [
  {
    icon: BookOpen,
    label: 'Trade Journal',
    title: 'Log every trade with context.',
    body: 'Entry, exit, stop, target, lot size, P&L, screenshots, and notes. Structured enough to be useful. Fast enough to not get in the way.',
  },
  {
    icon: BarChart2,
    label: 'Performance Analytics',
    title: 'See how you actually trade.',
    body: 'Win rate, equity curve, discipline score, streak tracking, pair breakdown. Data that tells the truth — not what you want to hear.',
  },
  {
    icon: Sparkles,
    label: 'AI Insights',
    title: 'Pattern detection, not motivation.',
    body: 'AI reads your trade history and surfaces real mistakes, recurring patterns, and behavioral tendencies. Specific. Actionable. Pro plan.',
  },
]

const STATS = [
  { value: '180+', label: 'Instruments tracked' },
  { value: '100%', label: 'Exact P&L — no rounding' },
  { value: '4', label: 'Discipline factors scored' },
]

export default function LandingPage() {
  useReveal()
  const [tickerItems] = useState([...TICKER, ...TICKER])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--base)', color: 'var(--text-1)' }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(11,13,16,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-5 h-[56px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-[28px] h-[28px] rounded-md flex items-center justify-center transition-all duration-200"
              style={{ background: 'var(--accent)', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}
            >
              <TrendingUp className="w-[14px] h-[14px] text-white" />
            </div>
            <span className="font-display font-semibold text-[#F1F5F9] text-sm tracking-tight">KoveFX</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-[#475569] hover:text-[#94A3B8] text-sm font-medium px-4 py-2 rounded-md transition-colors duration-150"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-white text-sm font-semibold px-4 py-2 rounded-md transition-all duration-150 hover:opacity-90"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'var(--accent)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-[120px] pb-[80px] px-5">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          }}
        />

        {/* Single atmospheric glow — not a blob, just depth */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.14) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 animate-fade-in"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'rgba(37,99,235,0.1)',
              border: '1px solid rgba(37,99,235,0.2)',
              color: '#93C5FD',
              letterSpacing: '0.04em',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Built for serious traders
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 6vw, 3.75rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: 'var(--text-1)',
              marginBottom: '1.25rem',
            }}
          >
            This tool shows you how you
            <br />
            <span style={{ color: '#60A5FA' }}>actually trade.</span>
          </h1>

          {/* Sub */}
          <p
            className="animate-fade-in reveal-delay-1 max-w-lg mx-auto"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'var(--text-2)',
              fontWeight: 400,
              lineHeight: 1.65,
              marginBottom: '2.5rem',
            }}
          >
            KoveFX is a trading journal and performance system. Log trades, track patterns, measure discipline — across every market.
          </p>

          {/* CTA row */}
          <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-in reveal-delay-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'var(--accent)',
                boxShadow: '0 2px 8px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-lg transition-all duration-150"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-2)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ticker ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(17,19,24,0.6)' }}
      >
        <div className="flex gap-10 ticker-track whitespace-nowrap">
          {tickerItems.map((t, i) => (
            <div key={i} className="flex items-center gap-2.5 shrink-0">
              <span className="text-[13px] font-semibold text-[#94A3B8]" style={{ fontFamily: 'var(--font-display)' }}>{t.pair}</span>
              <span className="text-[13px] text-[#475569] font-mono">{t.price}</span>
              <span className={`text-[11px] font-semibold ${t.up ? 'text-emerald-400' : 'text-red-400'}`}>{t.change}</span>
            </div>
          ))}
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--base), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--base), transparent)' }} />
      </div>

      {/* ── Dashboard preview panel ─────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto reveal">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'var(--surface-1)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center gap-1.5 px-4 py-3"
              style={{ background: 'var(--surface-2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.7 }} />
              ))}
              <div
                className="flex-1 mx-3 h-6 rounded text-[11px] flex items-center px-3"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}
              >
                app.kovefx.com/journal
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {/* Sidebar mock */}
              <div className="hidden md:flex flex-col gap-1 col-span-0 w-32">
                {['Journal', 'Stats', 'Goals', 'Gallery', 'AI Insights'].map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium"
                    style={{
                      fontFamily: 'var(--font-display)',
                      background: i === 0 ? 'rgba(37,99,235,0.12)' : 'transparent',
                      color: i === 0 ? '#60A5FA' : 'var(--text-3)',
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? '#3B82F6' : 'var(--text-4)' }} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content mock */}
              <div className="col-span-3 md:col-span-2 flex flex-col gap-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total P&L', value: '+$4,820.00', pos: true },
                    { label: 'Win Rate', value: '63.2%', pos: true },
                    { label: 'Trades', value: '47', pos: null },
                  ].map(({ label, value, pos }) => (
                    <div key={label} className="rounded-lg p-3.5" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-[10px] mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
                      <p className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color: pos === true ? '#34D399' : pos === false ? '#F87171' : 'var(--text-1)' }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Equity curve mock */}
                <div className="rounded-lg p-4" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Equity Curve</p>
                  <svg viewBox="0 0 300 60" className="w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="mockGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 50 L 30 44 L 60 48 L 90 38 L 120 42 L 150 30 L 180 22 L 210 18 L 240 12 L 270 8 L 300 5 L 300 60 L 0 60 Z" fill="url(#mockGrad)" />
                    <path d="M 0 50 L 30 44 L 60 48 L 90 38 L 120 42 L 150 30 L 180 22 L 210 18 L 240 12 L 270 8 L 300 5" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Recent trades mock */}
                <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    { pair: 'EUR/USD', type: 'BUY', pnl: '+$240.00', pos: true, date: 'Apr 9' },
                    { pair: 'XAU/USD', type: 'SELL', pnl: '-$80.00', pos: false, date: 'Apr 8' },
                    { pair: 'GBP/USD', type: 'BUY', pnl: '+$185.50', pos: true, date: 'Apr 7' },
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2.5"
                      style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            fontFamily: 'var(--font-display)',
                            background: t.type === 'BUY' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: t.type === 'BUY' ? '#34D399' : '#F87171',
                          }}
                        >{t.type}</span>
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

      {/* ── Stats bar ──────────────────────────────────── */}
      <section className="py-12 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto reveal">
          <div className="grid grid-cols-3 gap-8 md:gap-16 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl md:text-3xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>{value}</p>
                <p className="text-sm" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="py-20 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 reveal">
            <p className="text-[11px] font-medium mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              What it does
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', letterSpacing: '-0.025em' }}>
              Everything a trader actually needs.
              <br />
              <span style={{ color: 'var(--text-3)' }}>Nothing they don&apos;t.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, title, body }, i) => (
              <div
                key={label}
                className={`reveal reveal-delay-${i + 1} p-6 rounded-xl flex flex-col gap-4`}
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#60A5FA' }} />
                </div>
                <div>
                  <p className="text-[10px] font-medium mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
                  <p className="text-base font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', letterSpacing: '-0.01em' }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get list ──────────────────────────── */}
      <section className="py-20 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center reveal">
          <div>
            <p className="text-[11px] font-medium mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Included on every plan
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              The full journal. Free.
            </h2>
            <div className="flex flex-col gap-3">
              {[
                'Trade log with 180+ instruments',
                'Screenshot gallery with filters',
                'P&L calendar — Topstep-style',
                'Equity curve and win rate stats',
                'Streak tracking and discipline score',
                'Pre-trade checklist system',
                'Weekly and monthly performance wrap',
                'Goals and milestone tracking',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#34D399' }} />
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-6 flex flex-col gap-5"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <p className="text-[10px] font-medium mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pro Plan</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>$12</span>
                <span className="text-sm" style={{ color: 'var(--text-3)' }}>/month</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                'Everything in free',
                'AI trade analysis (GPT-4o)',
                'Pattern & mistake detection',
                'Goals & milestone tracking',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#60A5FA' }} />
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link href="/signup" className="btn-blue w-full gap-2">
                Get Pro
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/signup" className="btn-secondary w-full">
                Start free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-24 px-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-2xl mx-auto text-center reveal">
          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-1)',
            }}
          >
            Start journaling. Start improving.
          </h2>
          <p className="mb-8 text-base" style={{ color: 'var(--text-2)' }}>
            Free to use. No card required. Set up in under two minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-7 py-3.5 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'var(--accent)',
              boxShadow: '0 2px 12px rgba(37,99,235,0.45)',
            }}
          >
            Create your account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer
        className="py-8 px-5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-[22px] h-[22px] rounded flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <TrendingUp className="w-[11px] h-[11px] text-white" />
            </div>
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)' }}>KoveFX</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-4)' }}>
            Built by DMFX · Trading performance system · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
