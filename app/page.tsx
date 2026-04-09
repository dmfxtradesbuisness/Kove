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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight text-sm">KoveFX</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-[#888] hover:text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-150"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-5">
        {/* Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3.5 py-1.5 rounded-full mb-7">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Forex Journal
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-5">
            Trade smarter with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
              AI insights
            </span>
          </h1>

          <p className="text-base md:text-lg text-[#777] max-w-lg mx-auto mb-8 leading-relaxed font-light">
            Log every trade, track your performance, and let AI detect patterns
            to stop costly mistakes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium px-6 py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border border-white/10 hover:border-white/20 text-[#aaa] hover:text-white text-sm font-medium px-6 py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 px-5 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Everything you need to improve
            </h2>
            <p className="text-[#555] text-sm font-light">
              Built for traders who take their performance seriously.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                title: 'Trade Journal',
                description:
                  'Log every entry, exit, stop loss, take profit, and lot size. Attach chart screenshots and write detailed notes.',
                color: 'blue',
              },
              {
                icon: BarChart2,
                title: 'Performance Stats',
                description:
                  'See your win rate, total P&L, and history at a glance. Clean stats that show exactly where you stand.',
                color: 'emerald',
              },
              {
                icon: Sparkles,
                title: 'AI Insights',
                description:
                  'GPT-4 analyzes your trades to identify mistakes, detect patterns, and give specific actionable feedback.',
                color: 'purple',
              },
            ].map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 md:p-6 hover:border-white/8 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${
                    color === 'blue'
                      ? 'bg-blue-500/12 text-blue-400'
                      : color === 'emerald'
                      ? 'bg-emerald-500/12 text-emerald-400'
                      : 'bg-purple-500/12 text-purple-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
                <p className="text-[#555] text-sm leading-relaxed font-light">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 px-5 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">How it works</h2>
            <p className="text-[#555] text-sm font-light">Three simple steps to better trading.</p>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-7 left-[calc(33%+20px)] right-[calc(33%+20px)] h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            {[
              {
                step: '01',
                title: 'Log your trades',
                description:
                  'Record every trade with full details — pair, direction, prices, lot size, and chart screenshot.',
              },
              {
                step: '02',
                title: 'AI analyzes patterns',
                description:
                  'Our AI reviews your data and notes to identify recurring mistakes and winning patterns.',
              },
              {
                step: '03',
                title: 'Improve performance',
                description:
                  'Get actionable feedback and clear insights to make better decisions on your next trade.',
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex sm:flex-col items-start sm:items-center sm:text-center gap-4 sm:gap-0">
                <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center sm:mb-5 relative z-10">
                  <span className="text-blue-400 font-bold text-xs">{step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1.5 text-sm">{title}</h3>
                  <p className="text-[#555] text-sm leading-relaxed font-light">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-20 px-5 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Simple pricing</h2>
            <p className="text-[#555] text-sm font-light">Start free, upgrade when you need AI.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col">
              <div className="mb-5">
                <p className="text-xs font-medium text-[#888] mb-2 uppercase tracking-wider">Free</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-[#555] text-sm mb-1">/month</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3 mb-7 flex-1">
                {['Unlimited trade logging', 'Performance stats', 'Screenshot uploads', 'Trade history'].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#aaa]">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/signup"
                className="border border-white/10 hover:border-white/20 text-[#aaa] hover:text-white text-sm font-medium py-3 rounded-xl transition-all duration-150 text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-blue-600/5 border border-blue-500/25 rounded-2xl p-6 flex flex-col">
              <div className="absolute -top-3 left-5">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="mb-5">
                <p className="text-xs font-medium text-blue-400 mb-2 uppercase tracking-wider">Pro</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-[#555] text-sm mb-1">/month</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3 mb-7 flex-1">
                {[
                  'Everything in Free',
                  'AI trade analysis',
                  'Mistake identification',
                  'Pattern detection',
                  'Personalized feedback',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#aaa]">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium py-3 rounded-xl transition-all duration-150 text-center block"
              >
                Start with Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">KoveFX</span>
          </div>
          <div className="flex items-center gap-5 text-[#444] text-sm">
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
