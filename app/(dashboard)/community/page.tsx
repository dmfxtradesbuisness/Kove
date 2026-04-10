'use client'

import { Users2, MessageSquare, Heart, Sparkles, Clock } from 'lucide-react'

const mockPosts = [
  {
    id: 1,
    author: 'Trader #1',
    time: '2h ago',
    title: 'Crushed it on XAUUSD today — 3R setup',
    body: 'Finally waited for the proper retest instead of jumping in early. Patience is everything in this game.',
    likes: 24,
    comments: 7,
    tag: 'Win',
    tagColor: 'emerald',
  },
  {
    id: 2,
    author: 'Trader #8',
    time: '5h ago',
    title: 'Why I stopped trading during NY open',
    body: 'The volatility was destroying my R:R. Started only trading London and my stats improved significantly.',
    likes: 31,
    comments: 12,
    tag: 'Strategy',
    tagColor: 'blue',
  },
  {
    id: 3,
    author: 'Trader #3',
    time: '1d ago',
    title: 'Revenge trading cost me $800 this week',
    body: 'I knew I should have stopped after the third loss but I kept going. Back to basics next week.',
    likes: 18,
    comments: 9,
    tag: 'Lesson',
    tagColor: 'orange',
  },
]

const TAG_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function CommunityPage() {
  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Traders</p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Community</h1>
          <p className="text-[#444] text-xs font-light mt-1">Share setups, lessons & wins</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 text-xs font-semibold">Coming Soon</span>
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="relative">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2 tracking-tight">Community is launching soon</h2>
          <p className="text-[#555] text-sm font-light leading-relaxed max-w-lg">
            Share your trades, setups, and lessons with fellow traders. Discuss strategies, celebrate wins,
            and learn from losses — together. Anonymous by default, opt-in to share your username.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {['Post Setups', 'Share Screenshots', 'Discuss Strategies', 'Weekly Wrap Sharing', 'Anonymous Mode'].map((f) => (
              <span key={f} className="text-xs font-medium text-[#555] bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Preview posts (blurred/locked) */}
      <p className="text-[#333] text-[10px] uppercase tracking-widest font-medium mb-3">Preview</p>
      <div className="flex flex-col gap-3">
        {mockPosts.map((post) => (
          <div
            key={post.id}
            className="bg-[#0f0f0f] border border-white/[0.05] rounded-2xl p-5 relative overflow-hidden select-none"
          >
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px] bg-black/40 z-10 flex items-center justify-center rounded-2xl">
              <span className="text-[#333] text-xs font-medium flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Coming Soon
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-white/[0.05] rounded-full flex items-center justify-center">
                <Users2 className="w-3 h-3 text-[#444]" />
              </div>
              <span className="text-xs font-medium text-[#555]">{post.author}</span>
              <span className="text-[#2a2a2a] text-xs">·</span>
              <span className="text-[#333] text-xs">{post.time}</span>
              <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-md border ${TAG_COLORS[post.tagColor]}`}>
                {post.tag}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">{post.title}</h3>
            <p className="text-[#444] text-xs font-light leading-relaxed">{post.body}</p>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
              <button className="flex items-center gap-1.5 text-[#333] text-xs">
                <Heart className="w-3.5 h-3.5" />
                {post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-[#333] text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                {post.comments}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
