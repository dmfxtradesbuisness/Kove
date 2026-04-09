'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BookOpen, BarChart2, Sparkles, ArrowRight, TrendingUp, Check, TrendingDown } from 'lucide-react'

/* ── Scroll-reveal hook ───────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── Mouse-parallax glow ─────────────────────────────── */
function useParallax(strength = 0.03) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setPos({
        x: (e.clientX - window.innerWidth / 2) * strength,
        y: (e.clientY - window.innerHeight / 2) * strength,
      })
    }
    window.addEventListener('mousemove', handle)
    return () => window.removeEventListener('mousemove', handle)
  }, [strength])
  return pos
}

/* ── Live ticker data ────────────────────────────────── */
const TICKER = [
  { pair: 'EUR/USD', price: '1.0854', change: '+0.12%', up: true },
  { pair: 'GBP/USD', price: '1.2634', change: '-0.08%', up: false },
  { pair: 'USD/JPY', price: '149.22', change: '+0.31%', up: true },
  { pair: 'XAU/USD', price: '2,345', change: '+0.54%', up: true },
  { pair: 'GBP/JPY', price: '192.34', change: '-0.19%', up: false },
  { pair: 'AUD/USD', price: '0.6482', change: '+0.07%', up: true },
  { pair: 'USD/CHF', price: '0.9012', change: '-0.22%', up: false },
  { pair: 'NZD/USD', price: '0.5934', change: '+0.15%', up: true },
]

export default function LandingPage() {
  useReveal()
  const parallax = useParallax(0.025)
  const heroRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] overflow-x-hidden">

      {/* ── Animated background grid ─────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.5)]">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight text-sm group-hover:text-blue-100 transition-colors duration-200">KoveFX</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="relative text-[#555] hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/[0.04]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-white hover:bg-blue-50 text-black text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-5 min-h-[92vh] flex flex-col items-center justify-center z-10">

        {/* Animated atmospheric blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="blob-1 absolute top-[2%] right-[-8%] w-[700px] h-[600px] rounded-full blur-[160px] opacity-50"
            style={{
              background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.08) 50%, transparent 80%)',
              transform: `translate(${parallax.x * 1.5}px, ${parallax.y * 1.5}px)`,
            }}
          />
          <div
            className="blob-2 absolute bottom-[5%] left-[-8%] w-[550px] h-[450px] rounded-full blur-[140px] opacity-40"
            style={{
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, rgba(59,130,246,0.06) 60%, transparent 80%)',
              transform: `translate(${-parallax.x}px, ${-parallax.y}px)`,
            }}
          />
          <div
            className="blob-3 absolute top-[35%] left-[40%] w-[500px] h-[300px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)',
              transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)`,
            }}
          />
        </div>

        {/* Floating forex data nodes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
          {[
            { pair: 'EUR/USD', price: '1.08542', pos: 'top-[27%] left-[7%]', cls: 'node-float', up: true },
            { pair: 'GBP/JPY', price: '192.34', pos: 'top-[20%] right-[10%]', cls: 'node-float-2', up: false },
            { pair: 'XAU/USD', price: '2,345', pos: 'top-[57%] left-[4%]', cls: 'node-float-3', up: true },
            { pair: 'USD/JPY', price: '149.22', pos: 'top-[52%] right-[6%]', cls: 'node-float-4', up: true },
          ].map(({ pair, price, pos, cls, up }) => (
            <div key={pair} className={`absolute ${pos} ${cls}`}>
              <div className="flex items-center gap-2 bg-[#111]/80 border border-white/[0.06] rounded-xl px-3 py-2 backdrop-blur-sm">
                <div className={`w-1.5 h-1.5 rounded-full ${up ? 'bg-emerald-400' : 'bg-red-400'}`}
                  style={{ boxShadow: up ? '0 0 6px rgba(52,211,153,0.6)' : '0 0 6px rgba(248,113,113,0.6)' }}
                />
                <div>
                  <p className="text-[#666] text-[10px] font-medium">{pair}</p>
                  <p className="text-white text-xs font-mono font-semibold">{price}</p>
                </div>
                {up ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400 ml-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400 ml-1" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Hero content */}
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Animated badge */}
          <div className="badge-pulse inline-flex items-center gap-2 bg-blue-500/[0.08] border border-blue-500/20 text-blue-400/90 text-xs font-medium px-4 py-1.5 rounded-full mb-8 tracking-wide animate-fade-in">
            <Sparkles className="w-3 h-3 animate-pulse" />
            AI-Powered Forex Journal
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(2.8rem,8vw,5.5rem)] font-black leading-[1.02] tracking-tight mb-6 text-white animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            Trade smarter,<br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #a5b4fc 40%, #60a5fa 100%)',
                backgroundSize: '200% auto',
                animation: 'shimmer 4s linear infinite',
              }}
            >
              grow faster.
            </span>
          </h1>

          <p
            className="text-base md:text-lg text-[#555] max-w-md mx-auto mb-10 leading-relaxed font-light animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Log every trade, track your edge, and let AI surface the patterns that separate profitable traders from the rest.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 hover:bg-blue-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.03] active:scale-[0.98]"
            >
              Open App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              href="#pricing"
              className="w-full sm:w-auto border border-white/10 text-[#666] text-sm font-medium px-8 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 hover:border-white/25 hover:text-white hover:bg-white/[0.03] hover:scale-[1.02]"
            >
              See Pricing
            </Link>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-[#333] animate-fade-in"
            style={{ animationDelay: '1s' }}
          >
            <div className="w-6 h-10 rounded-full border border-[#252525] flex items-start justify-center pt-2">
              <div
                className="w-1 h-2 bg-[#444] rounded-full"
                style={{ animation: 'nodeFloat 1.8s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Live ticker strip ────────────────────────── */}
      <div className="relative z-10 border-t border-b border-white/[0.04] py-3 overflow-hidden bg-[#080808]/60 backdrop-blur-sm">
        <div className="ticker-track flex gap-10 w-max">
          {[...TICKER, ...TICKER].map(({ pair, price, change, up }, i) => (
            <div key={i} className="flex items-center gap-2.5 shrink-0 px-2">
              <span className="text-[#555] text-xs font-medium">{pair}</span>
              <span className="text-white text-xs font-mono">{price}</span>
              <span className={`text-[11px] font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                {change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────── */}
      <section className="relative z-10 py-24 md:py-32 px-5 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 md:mb-20 reveal">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4 font-medium">Features</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight max-w-2xl">
              Everything you need<br className="hidden md:block" /> to improve
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, title: 'Trade Journal', description: 'Log every entry, exit, stop loss, take profit, and lot size. Attach screenshots and notes for each trade.', tag: '01', delay: '' },
              { icon: BarChart2, title: 'Performance Stats', description: 'Win rate, total P&L, profit factor, average win/loss. Clean stats that show exactly where you stand.', tag: '02', delay: 'reveal-delay-2' },
              { icon: Sparkles, title: 'AI Insights', description: 'GPT-4 analyzes your trades to identify mistakes, detect patterns, and give specific actionable feedback.', tag: '03', delay: 'reveal-delay-3' },
            ].map(({ icon: Icon, title, description, tag, delay }) => (
              <div
                key={title}
                className={`reveal ${delay} group relative bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-7 flex flex-col gap-5 cursor-default
                  transition-all duration-500
                  hover:-translate-y-2
                  hover:border-blue-500/20
                  hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(59,130,246,0.08)]`}
              >
                {/* Card glow on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top left, rgba(59,130,246,0.06) 0%, transparent 60%)' }}
                />
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center
                    group-hover:bg-blue-500/12 group-hover:border-blue-500/25 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
                    transition-all duration-400">
                    <Icon className="w-5 h-5 text-[#444] group-hover:text-blue-400 transition-colors duration-300" />
                  </div>
                  <span className="text-[#222] text-xs font-mono group-hover:text-[#444] transition-colors duration-300">{tag}</span>
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-[#ccc] group-hover:text-white mb-2 text-base tracking-tight transition-colors duration-300">{title}</h3>
                  <p className="text-[#3a3a3a] group-hover:text-[#555] text-sm leading-relaxed font-light transition-colors duration-300">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/[0.04] py-14 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 reveal">
          {[
            { value: '10k+', label: 'Trades Analyzed' },
            { value: '94%', label: 'Pattern Accuracy' },
            { value: '$2.4M', label: 'P&L Tracked' },
            { value: '< 2s', label: 'AI Response Time' },
          ].map(({ value, label }, i) => (
            <div key={label} className={`text-center reveal reveal-delay-${i + 1}`}>
              <p className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">{value}</p>
              <p className="text-[#444] text-xs font-light tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing ──────────────────────────────────── */}
      <section id="pricing" className="relative z-10 py-24 md:py-32 px-5 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 md:mb-20 reveal">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4 font-medium">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">Simple pricing</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
            {/* Free */}
            <div className="reveal group bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-7 flex flex-col
              transition-all duration-500 hover:-translate-y-2 hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <p className="text-[#444] text-xs uppercase tracking-widest mb-5 font-medium">Free</p>
              <div className="flex items-end gap-1 mb-7">
                <span className="text-5xl font-black text-white tracking-tight group-hover:text-[#f0f0f0] transition-colors">$0</span>
                <span className="text-[#444] text-sm mb-2 font-light">/mo</span>
              </div>
              <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                {['Unlimited trade logging', 'Performance stats', 'Screenshot uploads', 'Trade history'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#555] group-hover:text-[#666] transition-colors">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="border border-white/[0.08] text-[#666] text-sm font-medium py-3.5 rounded-2xl text-center
                  transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.03]"
              >
                Get Started
              </Link>
            </div>

            {/* Pro — animated border glow */}
            <div className="reveal reveal-delay-2 group relative bg-[#0a0a0a] rounded-3xl p-7 flex flex-col border-glow border
              transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)]">
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(59,130,246,0.08) 0%, transparent 55%)' }}
              />
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.06) 0%, transparent 70%)' }}
              />

              <div className="absolute -top-3.5 left-6 z-10">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                  Popular
                </span>
              </div>

              <p className="text-blue-400/70 text-xs uppercase tracking-widest mb-5 font-medium relative z-10">Pro</p>
              <div className="flex items-end gap-1 mb-7 relative z-10">
                <span className="text-5xl font-black text-white tracking-tight">$12</span>
                <span className="text-[#444] text-sm mb-2 font-light">/mo</span>
              </div>
              <ul className="flex flex-col gap-3.5 mb-8 flex-1 relative z-10">
                {['Everything in Free', 'AI trade analysis', 'Mistake identification', 'Pattern detection', 'Personalized feedback'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#666] group-hover:text-[#888] transition-colors">
                    <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="relative z-10 bg-blue-600 text-white text-sm font-bold py-3.5 rounded-2xl text-center block
                  transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98]"
              >
                Start with Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────── */}
      <section className="relative z-10 py-24 px-5 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto text-center reveal">
          <div
            className="relative rounded-3xl p-12 md:p-16 overflow-hidden border border-white/[0.06]"
            style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #111827 100%)' }}
          >
            {/* Glow blob inside banner */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 70%)' }}
            />
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 relative z-10">
              Start trading smarter today
            </h2>
            <p className="text-[#555] text-sm md:text-base font-light mb-8 max-w-md mx-auto relative z-10">
              Join traders who use KoveFX to track, analyze, and improve their performance.
            </p>
            <Link
              href="/signup"
              className="relative z-10 inline-flex items-center gap-2 bg-white text-black text-sm font-bold px-8 py-4 rounded-2xl
                transition-all duration-300 hover:bg-blue-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.04] active:scale-[0.98] group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center group-hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-all duration-300">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-[#555] group-hover:text-[#888] transition-colors">KoveFX</span>
          </div>
          <div className="flex items-center gap-6 text-[#333] text-sm">
            <Link href="/login" className="hover:text-white transition-colors duration-200">Sign in</Link>
            <Link href="/signup" className="hover:text-white transition-colors duration-200">Join</Link>
            <span>© {new Date().getFullYear()} KoveFX</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
