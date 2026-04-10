'use client'

import { Newspaper, Clock, TrendingUp, Globe, BarChart2, DollarSign } from 'lucide-react'

const mockHeadlines = [
  {
    id: 1,
    category: 'Forex',
    icon: DollarSign,
    color: 'blue',
    title: 'Fed signals cautious approach to rate cuts amid inflation data',
    source: 'Reuters',
    time: '2h ago',
    impact: 'High',
  },
  {
    id: 2,
    category: 'Markets',
    icon: TrendingUp,
    color: 'emerald',
    title: 'XAUUSD surges to new highs on safe-haven demand',
    source: 'Bloomberg',
    time: '4h ago',
    impact: 'High',
  },
  {
    id: 3,
    category: 'Crypto',
    icon: BarChart2,
    color: 'amber',
    title: 'Bitcoin volatility increases ahead of options expiry',
    source: 'CoinDesk',
    time: '5h ago',
    impact: 'Medium',
  },
  {
    id: 4,
    category: 'Global',
    icon: Globe,
    color: 'violet',
    title: 'ECB holds rates steady, euro strengthens against dollar',
    source: 'FT',
    time: '1d ago',
    impact: 'Medium',
  },
  {
    id: 5,
    category: 'Forex',
    icon: DollarSign,
    color: 'blue',
    title: 'JPY weakens as BoJ maintains ultra-loose policy',
    source: 'Nikkei',
    time: '1d ago',
    impact: 'Low',
  },
]

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20' },
  emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20' },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
}

const IMPACT_COLOR: Record<string, string> = {
  High:   'bg-red-500/10 text-red-400 border-red-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Low:    'bg-[#0f0f0f] text-[#444] border-white/[0.06]',
}

export default function NewsPage() {
  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Market Intelligence</p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">News</h1>
          <p className="text-[#444] text-xs font-light mt-1">Live market news & economic events</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 text-xs font-semibold">Coming Soon</span>
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="relative">
          <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Newspaper className="w-5 h-5 text-violet-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2 tracking-tight">News integration is on the way</h2>
          <p className="text-[#555] text-sm font-light leading-relaxed max-w-lg">
            Real-time market news, economic calendar events, and sentiment data — all in one place.
            Correlate news events directly with your trades to see what moves your instruments.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {['Live Headlines', 'Economic Calendar', 'Impact Filter', 'Pair-specific News', 'News + Trade Correlation'].map((f) => (
              <span key={f} className="text-xs font-medium text-[#555] bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Preview headlines (blurred) */}
      <p className="text-[#333] text-[10px] uppercase tracking-widest font-medium mb-3">Preview</p>
      <div className="flex flex-col gap-2">
        {mockHeadlines.map((item) => {
          const c = COLOR_MAP[item.color] ?? COLOR_MAP.blue
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className="bg-[#0f0f0f] border border-white/[0.05] rounded-2xl px-5 py-4 relative overflow-hidden select-none"
            >
              {/* Blur overlay */}
              <div className="absolute inset-0 backdrop-blur-[2px] bg-black/40 z-10 flex items-center justify-center rounded-2xl">
                <span className="text-[#333] text-xs font-medium flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Coming Soon
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${c.bg} ${c.border}`}>
                  <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold ${c.text}`}>{item.category}</span>
                    <span className="text-[#2a2a2a] text-xs">·</span>
                    <span className="text-[#333] text-[10px]">{item.source}</span>
                    <span className="text-[#2a2a2a] text-xs">·</span>
                    <span className="text-[#333] text-[10px]">{item.time}</span>
                    <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-md border ${IMPACT_COLOR[item.impact]}`}>
                      {item.impact}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white leading-snug">{item.title}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
