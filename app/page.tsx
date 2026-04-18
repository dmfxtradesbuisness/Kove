'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BarChart2, BookOpen, Brain, ArrowRight, Check, TrendingUp, Shield, Zap } from 'lucide-react'
import { KoveWordmark } from '@/components/KoveLogo'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io  = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const TICKER = [
  { pair: 'EUR/USD', price: '1.0854',   change: '+0.12%', up: true  },
  { pair: 'GBP/USD', price: '1.2634',   change: '-0.08%', up: false },
  { pair: 'XAU/USD', price: '2,345.10', change: '+0.54%', up: true  },
  { pair: 'USD/JPY', price: '149.22',   change: '+0.31%', up: true  },
  { pair: 'BTC/USD', price: '68,210',   change: '+1.24%', up: true  },
  { pair: 'GBP/JPY', price: '192.34',   change: '-0.19%', up: false },
  { pair: 'NAS100',  price: '18,420',   change: '+0.44%', up: true  },
  { pair: 'ETH/USD', price: '3,412',    change: '+0.91%', up: true  },
  { pair: 'USD/CHF', price: '0.9012',   change: '-0.22%', up: false },
  { pair: 'AUD/USD', price: '0.6482',   change: '+0.07%', up: true  },
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
  'Weekly performance insights',
  'Personalized improvement plan',
]

const PRO_INSIGHTS = [
  { stat: '#1 Issue',      value: 'Revenge trading after losses',      icon: '⚠️' },
  { stat: 'Friday Effect', value: 'You lose 62% more on Fridays',      icon: '📉' },
  { stat: 'Tilt Pattern',  value: 'Win rate drops 18% after 3 losses', icon: '🧠' },
  { stat: 'Best Setup',    value: 'Morning breakout — 71% win rate',   icon: '🎯' },
]

const BLUE = '#1E6EFF'
const BLUE_HI = '#4D90FF'
const BLUE_DIM = 'rgba(30,110,255,0.18)'
const BLUE_GLOW = 'rgba(30,110,255,0.32)'

export default function LandingPage() {
  useReveal()
  const [tickers]  = useState([...TICKER, ...TICKER])
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
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        .hl { opacity: 0; animation: lineUp 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
        .hl-1 { animation-delay: 0.06s; }
        .hl-2 { animation-delay: 0.16s; }
        .hl-3 { animation-delay: 0.26s; }
        .hl-4 { animation-delay: 0.38s; }
        .hl-5 { animation-delay: 0.52s; }
        .hl-6 { animation-delay: 0.66s; }
        .nc   { opacity: 0; animation: fadeIn 1.2s ease 0.1s forwards; }
        .fc1  { animation: floatCard 6s ease-in-out 0.5s infinite; }
        .fc2  { animation: floatCard 7s ease-in-out 1.2s infinite; }
        .fc3  { animation: floatCard 5.5s ease-in-out 0.8s infinite; }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop   { display: none !important; }
          .hero-bg-wrap      { width: 100% !important; opacity: 0.22 !important; }
          .hero-text-wrap    { max-width: 100% !important; padding-right: 24px; }
          .hero-headline     { font-size: clamp(32px, 9vw, 46px) !important; }
        }
      `}</style>

      <div style={{ background: '#030408', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── NAV ──────────────────────────────────────────────── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: 60,
          display: 'flex', alignItems: 'center',
          padding: '0 max(28px,4vw)',
          background: scrolled ? 'rgba(3,4,8,0.94)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none', flexShrink: 0 }}>
            <KoveWordmark height={26} />
          </Link>

          <div className="nav-links-desktop" style={{ display:'flex', alignItems:'center', gap: 40, margin: '0 auto' }}>
            {[['Features','#features'],['Pricing','#pricing'],['FAQ','#faq']].map(([l, h]) => (
              <a key={l} href={h as string} style={{
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 400,
                color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)' }}
              >{l}</a>
            ))}
          </div>

          <Link href="/signup" className="nav-cta-desktop" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8,
            background: BLUE,
            color: '#fff',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', flexShrink: 0,
            boxShadow: `0 0 22px ${BLUE_GLOW}`,
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.background = BLUE_HI; (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)' }}
          onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.background = BLUE; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
          >
            Get Started <ArrowRight style={{ width:13, height:13 }} />
          </Link>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section style={{
          position: 'relative', height: '100vh', minHeight: 620,
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 70% 60% at 75% 45%, rgba(30,110,255,0.09) 0%, transparent 65%), #030408',
        }}>

          {/* Neon background image — right side */}
          <div className="nc hero-bg-wrap" style={{
            position: 'absolute', top: 0, right: 0,
            width: '60%', height: '100%',
            zIndex: 1, pointerEvents: 'none',
          }}>
            <Image
              src="/hero-bg.png"
              alt=""
              fill
              priority
              sizes="60vw"
              style={{ objectFit: 'contain', objectPosition: 'center right', mixBlendMode: 'screen' }}
            />
          </div>

          {/* Left content */}
          <div className="hero-text-wrap" style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            paddingLeft: 'max(24px, 6vw)', paddingTop: 60,
            maxWidth: 580,
          }}>

            {/* Badge */}
            <div className="hl hl-1" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              alignSelf: 'flex-start',
              marginBottom: 24,
              background: BLUE_DIM,
              border: `1px solid rgba(30,110,255,0.35)`,
              borderRadius: 999, padding: '5px 13px',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: BLUE_HI, flexShrink: 0, boxShadow: `0 0 6px ${BLUE_HI}` }} />
              <span style={{ fontFamily:'var(--font-display)', fontSize:11, fontWeight:600, color: BLUE_HI, letterSpacing:'0.06em' }}>
                AI-POWERED TRADING JOURNAL
              </span>
            </div>

            {/* Headline */}
            <h1 className="hl hl-2 hero-headline" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5.5vw, 68px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.06,
              margin: 0,
              color: '#fff',
              textTransform: 'uppercase',
            }}>
              Trade With
            </h1>
            <h1 className="hl hl-3 hero-headline" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5.5vw, 68px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.06,
              margin: '0 0 4px',
              color: BLUE,
              textTransform: 'uppercase',
            }}>
              Precision,
            </h1>
            <h1 className="hl hl-3 hero-headline" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5.5vw, 68px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.06,
              margin: '0 0 24px',
              color: 'rgba(255,255,255,0.82)',
              textTransform: 'uppercase',
            }}>
              Not Emotion.
            </h1>

            {/* Subtext */}
            <p className="hl hl-4" style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.42)',
              lineHeight: 1.65,
              margin: '0 0 32px',
              maxWidth: 380,
            }}>
              The only trading journal that analyzes your behavior, not just your results.
              Stop guessing why you&apos;re losing — see exactly what&apos;s costing you money.
            </p>

            {/* Buttons */}
            <div className="hl hl-5" style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:40 }}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '11px 24px', borderRadius: 9,
                background: BLUE, color: '#fff',
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                textDecoration: 'none',
                boxShadow: `0 0 32px ${BLUE_GLOW}`,
                transition: 'all 0.18s', letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.background=BLUE_HI; (e.currentTarget as HTMLElement).style.transform='scale(1.04)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 0 44px rgba(30,110,255,0.5)` }}
              onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.background=BLUE; (e.currentTarget as HTMLElement).style.transform='scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 0 32px ${BLUE_GLOW}` }}
              >
                Explore KovePro <ArrowRight style={{ width:14, height:14 }} />
              </Link>

              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '11px 24px', borderRadius: 9,
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.12)',
                transition: 'all 0.18s',
              }}
              onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.28)'; (e.currentTarget as HTMLElement).style.color='#fff'; (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)' }}
              onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.background='transparent' }}
              >
                Sign In
              </Link>
            </div>

          </div>
        </section>

        {/* ── TICKER ───────────────────────────────────────────── */}
        <div style={{ background:'#020305', borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)', overflow:'hidden', height:40, display:'flex', alignItems:'center' }}>
          <div className="ticker-track" style={{ display:'flex', alignItems:'center', gap:48, whiteSpace:'nowrap' }}>
            {tickers.map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>{t.pair}</span>
                <span style={{ fontFamily:'var(--font-body)',    fontSize:11, color:'rgba(255,255,255,0.22)' }}>{t.price}</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:10, color: t.up ? '#34D399':'#F87171', fontWeight:600 }}>{t.change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PROBLEM ──────────────────────────────────────────── */}
        <section style={{ padding:'96px 24px' }}>
          <div style={{ maxWidth:760, margin:'0 auto', textAlign:'center' }} className="reveal">
            <p style={{ fontFamily:'var(--font-display)', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,255,255,0.3)', marginBottom:16 }}>The Problem</p>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.7rem,3.8vw,2.8rem)', fontWeight:700, letterSpacing:'-0.03em', lineHeight:1.15, marginBottom:24 }}>
              You already know you&apos;re making mistakes.<br />
              <span style={{ color:'rgba(255,255,255,0.24)' }}>You just don&apos;t know which ones.</span>
            </h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:14, color:'rgba(255,255,255,0.36)', lineHeight:1.75, maxWidth:520, margin:'0 auto' }}>
              Most traders log trades but never understand them. You see the numbers — but not the behavioral patterns behind them.
              The revenge trades, the Friday slippage, the tilt spirals. KoveFX makes those visible.
            </p>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section id="features" style={{ padding:'64px 24px', background:'#050609' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div className="reveal" style={{ marginBottom:56 }}>
              <p style={{ fontFamily:'var(--font-display)', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,255,255,0.28)', marginBottom:12 }}>How It Works</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:700, letterSpacing:'-0.03em', lineHeight:1.1 }}>
                Starter tracks data.<br />Pro understands it.
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
              {[
                { icon: BookOpen,  label:'Starter',           tag:'FREE', title:'Log everything. Miss nothing.',  body:"Entry, exit, SL, TP, lot size, P&L, pair, notes. Built fast so it never interrupts your session. Unlimited trades, forever free.", iconCol:'rgba(255,255,255,0.5)' },
                { icon: BarChart2, label:'Performance Data',  tag:'FREE', title:'The truth about your trading.',  body:"Win rate, equity curve, P&L breakdown, streak tracking. Raw data with zero interpretation — you see the numbers, Starter stops there.", iconCol:'rgba(255,255,255,0.5)' },
                { icon: Brain,     label:'AI Intelligence',   tag:'PRO',  title:"Why you're losing. Exactly.",    body:"AI reads your entire trade history and tells you what's destroying your consistency — behavioral patterns, emotional triggers, time-of-day leakage, named precisely.", iconCol: BLUE_HI },
              ].map(({ icon: Icon, label, tag, title, body, iconCol }, i) => (
                <div key={label}
                  className={`reveal reveal-delay-${i+1}`}
                  style={{
                    background: tag==='PRO' ? 'linear-gradient(145deg,rgba(30,110,255,0.07),rgba(10,30,80,0.4))' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${tag==='PRO' ? 'rgba(30,110,255,0.22)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius:14, padding:28, position:'relative', transition:'all 0.2s',
                    boxShadow: tag==='PRO' ? '0 0 40px rgba(30,110,255,0.06)' : 'none',
                  }}
                  onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor=tag==='PRO'?'rgba(30,110,255,0.45)':'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.transform='translateY(-4px)' }}
                  onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor=tag==='PRO'?'rgba(30,110,255,0.22)':'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform='translateY(0)' }}
                >
                  <span style={{ position:'absolute', top:14, right:14, background:tag==='PRO'?BLUE:'rgba(255,255,255,0.07)', color:'#fff', fontSize:9, fontWeight:700, fontFamily:'var(--font-display)', padding:'3px 8px', borderRadius:999, letterSpacing:'0.1em' }}>{tag}</span>
                  <div style={{ width:40, height:40, borderRadius:10, background:tag==='PRO'?BLUE_DIM:'rgba(255,255,255,0.05)', border:`1px solid ${tag==='PRO'?'rgba(30,110,255,0.3)':'rgba(255,255,255,0.08)'}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                    <Icon style={{ width:18, height:18, color:iconCol }} />
                  </div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:9, fontWeight:700, color:tag==='PRO'?'rgba(77,144,255,0.7)':'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>{label}</p>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, color:'#fff', letterSpacing:'-0.02em', marginBottom:10, lineHeight:1.3 }}>{title}</h3>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'rgba(255,255,255,0.36)', lineHeight:1.7 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRO INSIGHTS ─────────────────────────────────────── */}
        <section style={{ padding:'96px 24px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,110,255,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ maxWidth:960, margin:'0 auto', position:'relative', zIndex:1 }}>
            <div className="reveal" style={{ textAlign:'center', marginBottom:56 }}>
              <p style={{ fontFamily:'var(--font-display)', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,255,255,0.28)', marginBottom:12 }}>Pro Intelligence</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,3.8vw,2.8rem)', fontWeight:700, letterSpacing:'-0.03em', lineHeight:1.1 }}>
                This is what Pro shows you<br /><span style={{ color:'rgba(255,255,255,0.24)' }}>on day one.</span>
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:14 }}>
              {PRO_INSIGHTS.map((ins, i) => (
                <div key={i} className={`reveal reveal-delay-${i+1}`}
                  style={{ background:'rgba(30,110,255,0.04)', border:'1px solid rgba(30,110,255,0.14)', borderRadius:14, padding:'22px 26px', display:'flex', alignItems:'center', gap:18, transition:'all 0.2s' }}
                  onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(30,110,255,0.35)'; (e.currentTarget as HTMLElement).style.transform='translateY(-2px)' }}
                  onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(30,110,255,0.14)'; (e.currentTarget as HTMLElement).style.transform='translateY(0)' }}
                >
                  <span style={{ fontSize:30, flexShrink:0 }}>{ins.icon}</span>
                  <div>
                    <p style={{ fontFamily:'var(--font-display)', fontSize:9, fontWeight:700, color:`rgba(77,144,255,0.65)`, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 }}>{ins.stat}</p>
                    <p style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, color:'#fff', letterSpacing:'-0.02em' }}>{ins.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────── */}
        <section id="pricing" style={{ padding:'96px 24px', background:'#050609' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <div className="reveal" style={{ textAlign:'center', marginBottom:56 }}>
              <p style={{ fontFamily:'var(--font-display)', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,255,255,0.28)', marginBottom:12 }}>Pricing</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,3.8vw,2.8rem)', fontWeight:700, letterSpacing:'-0.03em' }}>
                Starter is free forever.<br />Pro is where the intelligence lives.
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16, maxWidth:720, margin:'0 auto' }}>

              {/* Starter */}
              <div className="reveal" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:32 }}>
                <div style={{ display:'inline-block', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:999, padding:'3px 11px', fontSize:9, fontWeight:700, fontFamily:'var(--font-display)', color:'rgba(255,255,255,0.38)', letterSpacing:'0.1em', marginBottom:16 }}>STARTER</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:4, marginBottom:6 }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'2.8rem', fontWeight:800, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>$0</span>
                  <span style={{ color:'rgba(255,255,255,0.28)', fontSize:13, marginBottom:5 }}>/month</span>
                </div>
                <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'rgba(255,255,255,0.28)', marginBottom:24, lineHeight:1.5 }}>Track everything. Zero intelligence layer.</p>
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:18, marginBottom:24 }}>
                  {FREE_FEATURES.map((f)=>(
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
                      <Check style={{ width:13, height:13, flexShrink:0, color:'rgba(255,255,255,0.22)' }} />
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.42)', fontFamily:'var(--font-body)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:44, borderRadius:9, border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, textDecoration:'none', transition:'all 0.15s' }}
                  onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.22)'; (e.currentTarget as HTMLElement).style.color='#fff' }}
                  onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.5)' }}
                >Start free — no card needed</Link>
              </div>

              {/* Pro */}
              <div className="reveal reveal-delay-1" style={{ background:'linear-gradient(145deg,rgba(30,110,255,0.08),rgba(10,30,80,0.35))', border:`1px solid rgba(30,110,255,0.28)`, borderRadius:16, padding:32, position:'relative', overflow:'hidden', boxShadow:'0 0 60px rgba(30,110,255,0.1)' }}>
                <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:`radial-gradient(circle, ${BLUE_GLOW} 0%, transparent 70%)`, pointerEvents:'none' }} />
                <div style={{ display:'inline-block', background:BLUE_DIM, border:`1px solid rgba(30,110,255,0.38)`, borderRadius:999, padding:'3px 11px', fontSize:9, fontWeight:700, fontFamily:'var(--font-display)', color:BLUE_HI, letterSpacing:'0.1em', marginBottom:16 }}>PRO</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:6 }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'2.8rem', fontWeight:800, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>$19</span>
                  <div style={{ marginBottom:5 }}>
                    <span style={{ display:'block', fontFamily:'var(--font-body)', fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'line-through', lineHeight:1 }}>$29/mo</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'rgba(255,255,255,0.3)' }}>/month</span>
                  </div>
                  <div style={{ marginBottom:6, marginLeft:4, background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.22)', borderRadius:5, padding:'2px 7px', fontSize:9, fontWeight:700, fontFamily:'var(--font-display)', color:'#34d399' }}>SAVE 35%</div>
                </div>
                <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'rgba(255,255,255,0.36)', marginBottom:24, lineHeight:1.5 }}>Turn inconsistent traders into disciplined, data-aware performers.</p>
                <div style={{ borderTop:'1px solid rgba(30,110,255,0.1)', paddingTop:18, marginBottom:24 }}>
                  {PRO_FEATURES.map((f)=>(
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
                      <div style={{ width:15, height:15, borderRadius:'50%', background:BLUE_DIM, border:`1px solid rgba(30,110,255,0.35)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Check style={{ width:9, height:9, color:BLUE_HI }} />
                      </div>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.6)', fontFamily:'var(--font-body)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, width:'100%', height:46, borderRadius:9, background:BLUE, color:'#fff', fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, textDecoration:'none', boxShadow:`0 0 28px ${BLUE_GLOW}`, transition:'all 0.15s', letterSpacing:'-0.01em' }}
                  onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.transform='scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 0 40px rgba(30,110,255,0.52)` }}
                  onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.transform='scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 0 28px ${BLUE_GLOW}` }}
                >
                  Start Pro — $19/month <ArrowRight style={{ width:15, height:15 }} />
                </Link>
                <p style={{ textAlign:'center', marginTop:10, fontFamily:'var(--font-body)', fontSize:11, color:'rgba(255,255,255,0.2)' }}>Cancel anytime · 7-day money back guarantee</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" style={{ padding:'96px 24px' }}>
          <div style={{ maxWidth:700, margin:'0 auto' }}>
            <div className="reveal" style={{ textAlign:'center', marginBottom:56 }}>
              <p style={{ fontFamily:'var(--font-display)', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,255,255,0.28)', marginBottom:12 }}>FAQ</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,3.8vw,2.8rem)', fontWeight:700, letterSpacing:'-0.03em', lineHeight:1.1 }}>Everything you need to know.</h2>
            </div>
            <div className="reveal">
              {[
                { q:'How do I log a trade?', a:'Go to the Trade Journal from the sidebar. Tap the + button, fill in the pair, entry/exit, stop loss, take profit, lot size, and any notes. P&L calculates automatically for closed trades.' },
                { q:"What's the Discipline Score?", a:'The Discipline Score (0–100) grades your trading behavior across four categories: stop loss usage, win rate, overtrading frequency, and revenge trading patterns. It updates every time you log a trade.' },
                { q:'How does Win Rate work?', a:"Win rate only starts calculating after you've logged at least 10 closed trades. This prevents meaningless percentages from a small sample size." },
                { q:'What is the Goals tab?', a:'Set monthly targets for P&L, win rate, and max drawdown. KoveFX tracks progress with visual rings and milestone checklists so you always know where you stand.' },
                { q:'Is my data private?', a:'Yes. Your trades, journal entries, and statistics are private by default. Only your Community posts are visible to others — and only when you choose to post.' },
                { q:'Do I need a credit card to start?', a:'No. Starter is completely free forever with no card required. Pro ($19/month) unlocks the full AI intelligence layer.' },
                { q:"What's the difference between Starter and Pro?", a:'Starter gives you unlimited trade logging, full history, and basic stats. Pro adds behavioral AI analysis, discipline scoring, pattern detection, and personalized insights.' },
              ].map((item, i) => (
                <div key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={()=> setOpenFaq(openFaq===i ? null : i)}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'18px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
                  >
                    <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:500, color:'#fff', lineHeight:1.4 }}>{item.q}</span>
                    <span style={{ flexShrink:0, fontSize:18, fontWeight:300, color: openFaq===i ? BLUE_HI :'rgba(255,255,255,0.28)', lineHeight:1, transition:'color 0.15s' }}>{openFaq===i?'−':'+'}</span>
                  </button>
                  {openFaq===i && (
                    <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7, paddingBottom:18, margin:0 }}>{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section style={{ padding:'96px 24px', background:'#050609', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(30,110,255,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }} className="reveal">
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:700, letterSpacing:'-0.03em', marginBottom:18, lineHeight:1.1 }}>
              Fix the habits costing you money.
            </h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:14, color:'rgba(255,255,255,0.34)', maxWidth:420, margin:'0 auto 36px', lineHeight:1.7 }}>
              KoveFX Pro is the difference between random trading and consistent, disciplined performance.
            </p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, flexWrap:'wrap' }}>
              <Link href="/signup" style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'12px 28px', borderRadius:9, background:BLUE, color:'#fff', fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, textDecoration:'none', boxShadow:`0 0 32px ${BLUE_GLOW}`, transition:'all 0.18s' }}
                onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.transform='scale(1.04)'; (e.currentTarget as HTMLElement).style.background=BLUE_HI }}
                onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.transform='scale(1)'; (e.currentTarget as HTMLElement).style.background=BLUE }}
              >
                Start free account <ArrowRight style={{ width:15, height:15 }} />
              </Link>
              <Link href="/signup" style={{ fontFamily:'var(--font-display)', fontSize:13, color:'rgba(255,255,255,0.35)', textDecoration:'none', transition:'color 0.15s' }}
                onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.65)' }}
                onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.35)' }}
              >Or go Pro from day one →</Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <footer style={{ borderTop:'1px solid rgba(255,255,255,0.04)', padding:'28px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
          <KoveWordmark height={20} />
          <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap', justifyContent:'center' }}>
            {[['Features','#features'],['Pricing','#pricing'],['Sign up','/signup'],['Log in','/login'],['Terms','/terms']].map(([l,h])=>(
              <a key={l} href={h} style={{ fontFamily:'var(--font-display)', fontSize:11, color:'rgba(255,255,255,0.18)', transition:'color 0.15s', textDecoration:'none' }}
                onMouseEnter={(e)=>{ (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.5)' }}
                onMouseLeave={(e)=>{ (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.18)' }}
              >{l}</a>
            ))}
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:11, color:'rgba(255,255,255,0.12)' }}>© {new Date().getFullYear()} KoveFX by DMFX</span>
        </footer>

      </div>
    </>
  )
}
