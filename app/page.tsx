import Link from 'next/link'
import { BookOpen, BarChart2, Sparkles, ArrowRight, TrendingUp, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#080808]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight text-sm">KoveFX</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-[#666] hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-white hover:bg-[#f0f0f0] active:bg-[#e0e0e0] text-black text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-150"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-5 min-h-[92vh] flex flex-col items-center justify-center">

        {/* Atmospheric glow blobs — matching reference */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large center-right glow (like the green/teal blob in reference) */}
          <div
            className="absolute top-[5%] right-[-10%] w-[700px] h-[600px] rounded-full blur-[160px] opacity-60"
            style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, rgba(99,102,241,0.06) 50%, transparent 80%)' }}
          />
          {/* Bottom left glow */}
          <div
            className="absolute bottom-[10%] left-[-5%] w-[500px] h-[400px] rounded-full blur-[130px] opacity-40"
            style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
          />
          {/* Subtle center glow under heading */}
          <div
            className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-25"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
          />
        </div>

        {/* Floating data nodes — like the asset nodes in reference */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
          <div className="absolute top-[28%] left-[8%] text-[#333] text-xs font-light">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1 h-1 rounded-full bg-[#444]" />
              <span className="text-[#444]">EUR/USD</span>
            </div>
            <span className="text-[#333] text-[11px] ml-2.5">1.08542</span>
          </div>
          <div className="absolute top-[22%] right-[12%] text-[#333] text-xs font-light">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1 h-1 rounded-full bg-[#444]" />
              <span className="text-[#444]">GBP/JPY</span>
            </div>
            <span className="text-[#333] text-[11px] ml-2.5">192.34</span>
          </div>
          <div className="absolute top-[55%] left-[5%] text-[#333] text-xs font-light">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1 h-1 rounded-full bg-[#383838]" />
              <span className="text-[#3a3a3a]">XAU/USD</span>
            </div>
            <span className="text-[#333] text-[11px] ml-2.5">2,345.10</span>
          </div>
          <div className="absolute top-[50%] right-[7%] text-[#333] text-xs font-light">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1 h-1 rounded-full bg-[#444]" />
              <span className="text-[#444]">USD/JPY</span>
            </div>
            <span className="text-[#333] text-[11px] ml-2.5">149.22</span>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/8 border border-blue-500/15 text-blue-400/80 text-xs font-medium px-4 py-1.5 rounded-full mb-8 tracking-wide">
            <Sparkles className="w-3 h-3" />
            AI-Powered Forex Journal
          </div>

          {/* Headline — bold like reference */}
          <h1 className="text-[clamp(2.8rem,8vw,5.5rem)] font-black leading-[1.02] tracking-tight mb-6 text-white">
            Trade smarter,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400">
              grow faster.
            </span>
          </h1>

          <p className="text-base md:text-lg text-[#555] max-w-md mx-auto mb-10 leading-relaxed font-light">
            Log every trade, track your edge, and let AI surface the patterns that separate profitable traders from the rest.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white hover:bg-[#f0f0f0] active:bg-[#e0e0e0] text-black text-sm font-bold px-7 py-3.5 rounded-2xl transition-all duration-150 flex items-center justify-center gap-2 group"
            >
              Open App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#pricing"
              className="w-full sm:w-auto border border-white/[0.1] hover:border-white/20 text-[#777] hover:text-white text-sm font-medium px-7 py-3.5 rounded-2xl transition-all duration-150 flex items-center justify-center"
            >
              See Pricing
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 text-[#333] text-xs">
            <div className="w-5 h-5 rounded-full border border-[#2a2a2a] flex items-center justify-center">
              <span className="text-[#333]">↓</span>
            </div>
            <span>Scroll down</span>
          </div>
        </div>
      </section>

      {/* ── Logos strip ─────────────────────────────── */}
      <div className="border-t border-white/[0.04] py-8 px-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[#333] text-xs uppercase tracking-widest mb-6 font-medium">
            Trusted by traders using
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {['MetaTrader 4', 'MT5', 'TradingView', 'cTrader', 'OANDA'].map((name) => (
              <span key={name} className="text-[#2a2a2a] text-sm font-medium tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ────────────────────────────────── */}
      <section className="py-20 md:py-28 px-5 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 md:mb-20">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4 font-medium">
              Features
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight max-w-2xl">
              Everything you need to improve
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: BookOpen,
                title: 'Trade Journal',
                description: 'Log every entry, exit, stop loss, take profit, and lot size. Attach chart screenshots and write detailed notes for each trade.',
                tag: '01',
              },
              {
                icon: BarChart2,
                title: 'Performance Stats',
                description: 'Win rate, total P&L, profit factor, average win/loss. Clean stats that show exactly where you stand.',
                tag: '02',
              },
              {
                icon: Sparkles,
                title: 'AI Insights',
                description: 'GPT-4 analyzes your trades to identify mistakes, detect patterns, and give specific actionable feedback.',
                tag: '03',
              },
            ].map(({ icon: Icon, title, description, tag }) => (
              <div
                key={title}
                className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-7 flex flex-col gap-5 hover:border-white/[0.1] transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                    <Icon className="w-5 h-5 text-[#555] group-hover:text-blue-400 transition-colors" />
                  </div>
                  <span className="text-[#2a2a2a] text-xs font-mono">{tag}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2 text-base tracking-tight">{title}</h3>
                  <p className="text-[#444] text-sm leading-relaxed font-light">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28 px-5 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 md:mb-20">
            <p className="text-[#444] text-xs uppercase tracking-widest mb-4 font-medium">
              Pricing
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Simple pricing
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
            {/* Free */}
            <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-7 flex flex-col">
              <p className="text-[#444] text-xs uppercase tracking-widest mb-4 font-medium">Free</p>
              <div className="flex items-end gap-1 mb-7">
                <span className="text-5xl font-black text-white tracking-tight">$0</span>
                <span className="text-[#444] text-sm mb-2 font-light">/mo</span>
              </div>
              <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                {['Unlimited trade logging', 'Performance stats', 'Screenshot uploads', 'Trade history'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#666]">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="border border-white/[0.08] hover:border-white/20 text-[#777] hover:text-white text-sm font-medium py-3.5 rounded-2xl transition-all duration-150 text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-[#0f0f0f] border border-blue-500/20 rounded-3xl p-7 flex flex-col">
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(59,130,246,0.06) 0%, transparent 60%)' }}
              />
              <div className="absolute -top-3 left-6">
                <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
                  MOST POPULAR
                </span>
              </div>
              <p className="text-blue-400/80 text-xs uppercase tracking-widest mb-4 font-medium">Pro</p>
              <div className="flex items-end gap-1 mb-7">
                <span className="text-5xl font-black text-white tracking-tight">$12</span>
                <span className="text-[#444] text-sm mb-2 font-light">/mo</span>
              </div>
              <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                {['Everything in Free', 'AI trade analysis', 'Mistake identification', 'Pattern detection', 'Personalized feedback'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#888]">
                    <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="relative bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-bold py-3.5 rounded-2xl transition-all duration-150 text-center block"
              >
                Start with Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-[#888]">KoveFX</span>
          </div>
          <div className="flex items-center gap-6 text-[#333] text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Join</Link>
            <span>© {new Date().getFullYear()} KoveFX</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
