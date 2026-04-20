'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { KoveWordmark } from '@/components/KoveLogo'
import HeroVisual from '@/components/HeroVisual'

// ─── Reveal on scroll ─────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io  = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.07 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BLUE      = '#1E6EFF'
const BLUE_HI   = '#4D90FF'
const BLUE_DIM  = 'rgba(30,110,255,0.14)'
const BLUE_GLOW = 'rgba(30,110,255,0.32)'

const FREE_FEATURES = [
  '1 trade per day',
  'Basic P&L tracking',
  'Trade history',
  'Manual notes',
]

const PRO_FEATURES = [
  'Unlimited trades',
  'Full pattern tracking',
  'Real-time session warnings',
  'Discipline scoring',
  'Behavioral analysis',
  'Personal coaching & feedback',
]

const WARNING_EXAMPLES = [
  { text: '"You\'re trading more than usual today — you\'ve hit 6 trades. Your average before things go wrong is 4."', color: '#FBBF24' },
  { text: '"This setup doesn\'t match your past winners. Your profitable trades all have a higher RR than this."', color: '#F87171' },
  { text: '"Your results drop significantly after back-to-back losses. You might want to step away."', color: '#fb923c' },
]

export default function LandingPage() {
  useReveal()
  const [scrolled, setScrolled] = useState(false)
  const [openFaq,  setOpenFaq]  = useState<number | null>(null)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <>
      <style>{`
        @keyframes lineUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .hl { opacity: 0; animation: lineUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .hl-1 { animation-delay: 0.05s; }
        .hl-2 { animation-delay: 0.15s; }
        .hl-3 { animation-delay: 0.28s; }
        .hl-4 { animation-delay: 0.42s; }
        .hl-5 { animation-delay: 0.58s; }
        .hero-bg { opacity: 0; animation: fadeIn 1.4s ease 0.1s forwards; }

        .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.08s; }
        .reveal-d2 { transition-delay: 0.16s; }
        .reveal-d3 { transition-delay: 0.24s; }

        .divider-line {
          width: 40px; height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 80px auto;
        }

        .warning-card {
          position: relative;
          border-radius: 10px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.2s, transform 0.2s;
        }
        .warning-card:hover {
          border-color: rgba(255,255,255,0.14);
          transform: translateY(-2px);
        }

        @media (max-width: 767px) {
          .nav-links  { display: none !important; }
          .nav-cta    { display: none !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .hero-content { align-items: center !important; padding-right: 24px !important; padding-left: 24px !important; }
          .hero-content > div { text-align: center !important; max-width: 100% !important; }
          .hero-content h1 { font-size: clamp(1.8rem, 8vw, 2.6rem) !important; }
          .hero-cta { justify-content: center !important; }
          .hero-bg-wrap { width: 100% !important; opacity: 0.18 !important; }
        }
      `}</style>

      <div style={{ background: '#030408', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── NAV ──────────────────────────────────────────────────── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: 60,
          display: 'flex', alignItems: 'center',
          padding: '0 max(28px,5vw)',
          background: scrolled ? 'rgba(3,4,8,0.94)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <KoveWordmark height={24} />
          </Link>

          <div className="nav-links" style={{ display: 'flex', gap: 36, margin: '0 auto' }}>
            {[['How it works', '#how'], ['Pricing', '#pricing']].map(([l, h]) => (
              <a key={l} href={h} style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'rgba(255,255,255,0.38)', textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.38)' }}
              >{l}</a>
            ))}
          </div>

          <Link href="/signup" className="nav-cta" style={{
            padding: '8px 18px', borderRadius: 8,
            background: BLUE, color: '#fff',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', flexShrink: 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BLUE_HI }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BLUE }}
          >Get started</Link>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section style={{
          position: 'relative',
          height: '100vh', minHeight: 620,
          overflow: 'hidden',
          background: '#030408',
        }}>
          {/* 3D animated visual — LEFT side */}
          <div className="hero-bg hero-bg-wrap" style={{
            position: 'absolute', top: 0, left: 0,
            width: '58%', height: '100%',
            zIndex: 1, pointerEvents: 'none',
          }}>
            <HeroVisual />
          </div>

          {/* Subtle left-edge fade so image blends into bg */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '20%', height: '100%',
            background: 'linear-gradient(to right, #030408 0%, transparent 100%)',
            zIndex: 2, pointerEvents: 'none',
          }} />

          {/* Content — center-right */}
          <div className="hero-content" style={{
            position: 'absolute', inset: 0, zIndex: 3,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: 'max(48px, 7vw)',
            paddingTop: 60,
          }}>
            <div style={{ maxWidth: 480, textAlign: 'right' }}>

              <p className="hl hl-1" style={{
                fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.28)', marginBottom: 24,
              }}>Trade Journal</p>

              <h1 className="hl hl-2" style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: '0 0 20px',
                color: '#fff',
              }}>
                The journal that<br />
                <span style={{ color: BLUE }}>actually helps you improve.</span>
              </h1>

              <p className="hl hl-3" style={{
                fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 400,
                color: 'rgba(255,255,255,0.38)', lineHeight: 1.65,
                margin: '0 0 36px',
              }}>
                Log your trades. Kove finds what&apos;s holding you back and tells you exactly what to fix.
              </p>

              <div className="hl hl-4 hero-cta" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Link href="/signup" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '11px 24px', borderRadius: 9,
                  background: BLUE, color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: `0 0 28px ${BLUE_GLOW}`,
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE_HI; el.style.transform = 'scale(1.03)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; el.style.transform = 'scale(1)' }}
                >
                  Start free <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>

                <a href="#how" style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '11px 22px', borderRadius: 9,
                  background: 'transparent', color: 'rgba(255,255,255,0.45)',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.22)'; el.style.color = '#fff' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.1)'; el.style.color = 'rgba(255,255,255,0.45)' }}
                >See how it works</a>
              </div>

              <p className="hl hl-5" style={{
                fontFamily: 'var(--font-body)', fontSize: 11,
                color: 'rgba(255,255,255,0.16)', marginTop: 16, textAlign: 'right',
              }}>Free to start · No card required</p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <div id="how" />

        {/* Section 1 — The Problem */}
        <section style={{ padding: '100px max(24px,8vw)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 80, alignItems: 'start' }}>

            <div className="reveal">
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>01</p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2,
                marginBottom: 24, color: '#fff',
              }}>
                Most traders repeat the same mistakes without realizing it.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.36)', lineHeight: 1.75, marginBottom: 0 }}>
                You don&apos;t notice it in the moment. And by the time you review it, it&apos;s too late.
              </p>
            </div>

            <div className="reveal reveal-d1" style={{ paddingTop: 40 }}>
              {[
                'Taking trades outside their plan',
                'Overtrading after losses',
                'Changing execution based on emotion',
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '18px 0',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', marginTop: 7, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        <div className="divider-line" />

        {/* Section 2 — Patterns obvious */}
        <section style={{ padding: '0 max(24px,8vw) 100px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 80, alignItems: 'start' }}>

            <div className="reveal reveal-d1" style={{ paddingTop: 40 }}>
              {[
                'Where your performance drops',
                'Which setups work vs don\'t',
                'When your behavior shifts',
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '18px 0',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: BLUE, marginTop: 7, flexShrink: 0,
                    boxShadow: `0 0 6px ${BLUE}`,
                  }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="reveal">
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>02</p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2,
                marginBottom: 24, color: '#fff',
              }}>
                Kove makes those patterns obvious.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.36)', lineHeight: 1.75 }}>
                Instead of just logging trades, it analyzes what actually happens across them. You get a clear view of what needs to change.
              </p>
            </div>

          </div>
        </section>

        <div className="divider-line" />

        {/* Section 3 — Real-time warnings */}
        <section style={{ padding: '0 max(24px,8vw) 100px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 80, alignItems: 'start' }}>

            <div className="reveal">
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>03</p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2,
                marginBottom: 24, color: '#fff',
              }}>
                Feedback when it matters.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.36)', lineHeight: 1.75 }}>
                Kove flags issues during your session, not after. So you can adjust before it turns into a bad day.
              </p>
            </div>

            <div className="reveal reveal-d1" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 40 }}>
              {WARNING_EXAMPLES.map((w, i) => (
                <div key={i} className="warning-card">
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: 3, borderRadius: '10px 0 0 10px',
                    background: w.color,
                    opacity: 0.6,
                  }} />
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
                    margin: 0, paddingLeft: 8,
                    fontStyle: 'italic',
                  }}>{w.text}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        <div className="divider-line" />

        {/* Section 4 — Discipline Score */}
        <section style={{ padding: '0 max(24px,8vw) 100px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 80, alignItems: 'start' }}>

            <div className="reveal reveal-d1" style={{ paddingTop: 40 }}>
              <div style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '28px 24px',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', marginBottom: 16 }}>Discipline Score</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 20 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 700, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em' }}>74</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.28)', marginBottom: 6 }}>/100</span>
                </div>
                {[
                  { label: 'Rule adherence', val: 82, col: BLUE },
                  { label: 'Consistency',    val: 68, col: '#FBBF24' },
                  { label: 'Trade quality',  val: 71, col: BLUE },
                ].map(({ label, val, col }) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{val}</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${val}%`, background: col, borderRadius: 999, opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal">
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>04</p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2,
                marginBottom: 24, color: '#fff',
              }}>
                Measure how well you actually traded.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.36)', lineHeight: 1.75, marginBottom: 20 }}>
                Each session gets a discipline score based on following your rules, consistency, and trade quality.
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.28)', lineHeight: 1.75 }}>
                Not just whether you made or lost money.
              </p>
            </div>

          </div>
        </section>

        <div className="divider-line" />

        {/* Section 5 — Keep it simple */}
        <section style={{ padding: '0 max(24px,8vw) 100px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal">
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>05</p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2,
              marginBottom: 24, color: '#fff',
            }}>Keep it simple.</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.36)', lineHeight: 1.75, marginBottom: 36 }}>
              No clutter. No unnecessary metrics. Just:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 320, margin: '0 auto' }}>
              {["What's going wrong", 'What to fix', 'What to avoid next time'].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 0',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.2)', width: 18 }}>{i + 1}.</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────── */}
        <section id="pricing" style={{ padding: '100px max(24px,8vw)', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                fontWeight: 700, letterSpacing: '-0.025em',
                marginBottom: 12,
              }}>Start free.</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                No card required. Upgrade when you need the full picture.
              </p>
            </div>

            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Free */}
              <div className="reveal" style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 32,
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Free</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>$0</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.22)', marginBottom: 5 }}>/month</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, marginBottom: 24 }}>
                  {FREE_FEATURES.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <Check style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: 44, borderRadius: 9,
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.2)'; el.style.color = '#fff' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.1)'; el.style.color = 'rgba(255,255,255,0.45)' }}
                >Get started</Link>
              </div>

              {/* Pro */}
              <div className="reveal reveal-d1" style={{
                background: 'linear-gradient(145deg, rgba(30,110,255,0.08), rgba(10,30,80,0.3))',
                border: `1px solid rgba(30,110,255,0.25)`,
                borderRadius: 16, padding: 32,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 0 60px rgba(30,110,255,0.08)',
              }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${BLUE_GLOW} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: BLUE_HI, marginBottom: 16 }}>Pro</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>$19</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>/month</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginBottom: 20, textDecoration: 'line-through' }}>$29/mo</p>
                <div style={{ borderTop: '1px solid rgba(30,110,255,0.1)', paddingTop: 20, marginBottom: 24 }}>
                  {PRO_FEATURES.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: BLUE_DIM, border: `1px solid rgba(30,110,255,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check style={{ width: 8, height: 8, color: BLUE_HI }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  width: '100%', height: 46, borderRadius: 9,
                  background: BLUE, color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: `0 0 24px ${BLUE_GLOW}`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE_HI; el.style.transform = 'scale(1.02)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; el.style.transform = 'scale(1)' }}
                >
                  Get started <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
                <p style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>Cancel anytime</p>
              </div>

            </div>
          </div>
        </section>

        {/* ── CLOSING ──────────────────────────────────────────────── */}
        <section style={{ padding: '120px max(24px,8vw)', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal">
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25,
              marginBottom: 20, color: '#fff',
            }}>
              If you can see the problem clearly, you can fix it.
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.28)', lineHeight: 1.7, marginBottom: 44 }}>
              Most traders never get to that point.
            </p>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 30px', borderRadius: 9,
              background: BLUE, color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
              boxShadow: `0 0 36px ${BLUE_GLOW}`,
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE_HI; el.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = BLUE; el.style.transform = 'scale(1)' }}
            >
              Start for free <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '28px max(24px,5vw)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <KoveWordmark height={20} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['How it works', '#how'], ['Pricing', '#pricing'], ['Sign up', '/signup'], ['Log in', '/login']].map(([l, h]) => (
              <a key={l} href={h} style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.18)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.18)' }}
              >{l}</a>
            ))}
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.1)' }}>© {new Date().getFullYear()} Kove · Built by a trader, for traders</span>
        </footer>

      </div>
    </>
  )
}
