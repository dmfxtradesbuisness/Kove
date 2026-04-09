import Link from 'next/link'
import {
  BookOpen,
  BarChart2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Check,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">KoveFX</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Forex Journal
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Trade smarter with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              AI insights
            </span>
          </h1>

          <p className="text-lg text-[#888] max-w-xl mx-auto mb-10 leading-relaxed">
            Log every trade, track your performance, and let AI detect patterns
            in your trading to help you stop repeating costly mistakes.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="btn-primary text-sm px-6 py-3 flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/login" className="btn-secondary text-sm px-6 py-3">
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Everything you need to improve
            </h2>
            <p className="text-[#666] text-sm">
              Built for traders who take their performance seriously.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: BookOpen,
                title: 'Trade Journal',
                description:
                  'Log every entry, exit, stop loss, take profit, and lot size. Attach chart screenshots and write detailed notes for each trade.',
                color: 'blue',
              },
              {
                icon: BarChart2,
                title: 'Performance Tracking',
                description:
                  'See your win rate, total P&L, and trade history at a glance. Clean stats that show you exactly where you stand.',
                color: 'emerald',
              },
              {
                icon: Sparkles,
                title: 'AI Insights',
                description:
                  'GPT-4 analyzes your trades to identify mistakes, detect patterns, and give you specific feedback to level up your trading.',
                color: 'purple',
              },
            ].map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="card p-6 hover:border-white/10 transition-colors">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${
                    color === 'blue'
                      ? 'bg-blue-500/15 text-blue-400'
                      : color === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-purple-500/15 text-purple-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">How it works</h2>
            <p className="text-[#666] text-sm">Three simple steps to better trading.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-7 left-[calc(33%+20px)] right-[calc(33%+20px)] h-px bg-gradient-to-r from-[#1a1a1a] to-[#1a1a1a] via-blue-500/30" />

            {[
              {
                step: '01',
                title: 'Log your trades',
                description:
                  'Record every trade with full details — pair, direction, prices, lot size, and attach your chart screenshot.',
              },
              {
                step: '02',
                title: 'AI analyzes patterns',
                description:
                  'Our AI reviews your trade data and notes to identify recurring mistakes and winning patterns in your behavior.',
              },
              {
                step: '03',
                title: 'Improve performance',
                description:
                  'Get actionable feedback and clear insights to make better decisions on your next trade.',
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-5 relative z-10">
                  <span className="text-blue-400 font-bold text-sm">{step}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Simple pricing</h2>
            <p className="text-[#666] text-sm">Start free, upgrade when you need AI.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Free */}
            <div className="card p-7 flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-medium text-[#888] mb-2">Free</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-[#666] text-sm mb-1">/month</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {['Unlimited trade logging', 'Performance stats', 'Screenshot uploads', 'Trade history'].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#ccc]">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link href="/signup" className="btn-secondary text-center text-sm w-full block">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="relative card p-7 flex flex-col border-blue-500/30 bg-blue-600/5">
              <div className="absolute -top-3 left-6">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <p className="text-sm font-medium text-blue-400 mb-2">Pro</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-[#666] text-sm mb-1">/month</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {[
                  'Everything in Free',
                  'AI trade analysis',
                  'Mistake identification',
                  'Pattern detection',
                  'Personalized feedback',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#ccc]">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="btn-primary text-center text-sm w-full block"
              >
                Start with Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">KoveFX</span>
          </div>
          <div className="flex items-center gap-6 text-[#555] text-sm">
            <Link href="/login" className="hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              Sign up
            </Link>
            <span>© {new Date().getFullYear()} KoveFX</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
