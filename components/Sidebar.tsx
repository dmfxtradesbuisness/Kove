'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen, BarChart2, Sparkles, User, LogOut, TrendingUp,
  Target, Images, Users2, Newspaper, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const sections = [
  {
    label: 'Main',
    items: [
      { href: '/journal', label: 'Journal', icon: BookOpen, color: 'blue' },
      { href: '/stats', label: 'Stats', icon: BarChart2, color: 'violet' },
      { href: '/goals', label: 'Goals', icon: Target, color: 'emerald', pro: true },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/gallery', label: 'Gallery', icon: Images, color: 'amber' },
      { href: '/ai', label: 'AI Insights', icon: Sparkles, color: 'pink', pro: true },
    ],
  },
  {
    label: 'Explore',
    items: [
      { href: '/community', label: 'Community', icon: Users2, color: 'cyan' },
      { href: '/news', label: 'News', icon: Newspaper, color: 'orange' },
    ],
  },
]

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  blue:    { bg: 'bg-blue-500/15',    text: 'text-blue-400',    ring: 'ring-blue-500/20' },
  violet:  { bg: 'bg-violet-500/15',  text: 'text-violet-400',  ring: 'ring-violet-500/20' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  amber:   { bg: 'bg-amber-500/15',   text: 'text-amber-400',   ring: 'ring-amber-500/20' },
  pink:    { bg: 'bg-pink-500/15',    text: 'text-pink-400',    ring: 'ring-pink-500/20' },
  cyan:    { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    ring: 'ring-cyan-500/20' },
  orange:  { bg: 'bg-orange-500/15',  text: 'text-orange-400',  ring: 'ring-orange-500/20' },
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* ─── Desktop Sidebar ─────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] bg-[#060606] border-r border-white/[0.05] flex-col z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.05]">
          <Link href="/journal" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:bg-blue-500 transition-all duration-200 group-hover:shadow-blue-500/30">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-black text-sm tracking-tight">KoveFX</span>
              <span className="block text-[9px] text-[#333] font-medium tracking-widest uppercase">Pro Trading Journal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-5 overflow-y-auto scrollbar-none">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-[9px] font-semibold text-[#2a2a2a] uppercase tracking-[0.15em] px-2 mb-1.5">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map(({ href, label, icon: Icon, color, pro }) => {
                  const isActive = pathname === href || pathname.startsWith(href + '/')
                  const c = COLOR_MAP[color] ?? COLOR_MAP.blue
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`group flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-white/[0.06] text-white'
                          : 'text-[#444] hover:text-[#aaa] hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150 ring-1 ${
                        isActive
                          ? `${c.bg} ${c.text} ${c.ring}`
                          : 'bg-white/[0.03] text-[#333] ring-white/[0.04] group-hover:bg-white/[0.05] group-hover:text-[#666]'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="flex-1">{label}</span>
                      {pro && (
                        <span className="text-[8px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-md tracking-wide">
                          PRO
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="w-3 h-3 text-[#333] opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: Account + Sign out */}
        <div className="px-3 py-4 border-t border-white/[0.05] flex flex-col gap-0.5">
          <Link
            href="/account"
            className={`group flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
              pathname === '/account'
                ? 'bg-white/[0.06] text-white'
                : 'text-[#444] hover:text-[#aaa] hover:bg-white/[0.03]'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 transition-all duration-150 ${
              pathname === '/account'
                ? 'bg-white/[0.08] text-white ring-white/[0.08]'
                : 'bg-white/[0.03] text-[#333] ring-white/[0.04] group-hover:bg-white/[0.05] group-hover:text-[#666]'
            }`}>
              <User className="w-3.5 h-3.5" />
            </div>
            Account
          </Link>

          <button
            onClick={handleSignOut}
            className="group flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium text-[#333] hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/[0.03] ring-1 ring-white/[0.04] group-hover:bg-red-500/10 group-hover:ring-red-500/20 transition-all duration-150">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            Sign Out
          </button>

          {/* DMFX badge */}
          <div className="mt-3 pt-3 border-t border-white/[0.04] px-2">
            <p className="text-[9px] text-[#222] font-medium tracking-widest uppercase">Built by DMFX</p>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ───────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#060606]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/journal" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-500/20">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-black text-sm tracking-tight">KoveFX</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[#333] hover:text-red-400 hover:bg-red-500/8 transition-all"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── Mobile Bottom Navigation ─────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060606]/98 backdrop-blur-xl border-t border-white/[0.05] safe-bottom">
        <div className="flex items-center justify-around px-1 h-16">
          {[
            { href: '/journal', label: 'Journal', icon: BookOpen, color: 'blue' },
            { href: '/stats', label: 'Stats', icon: BarChart2, color: 'violet' },
            { href: '/goals', label: 'Goals', icon: Target, color: 'emerald' },
            { href: '/gallery', label: 'Gallery', icon: Images, color: 'amber' },
            { href: '/ai', label: 'AI', icon: Sparkles, color: 'pink' },
            { href: '/account', label: 'Account', icon: User, color: 'blue' },
          ].map(({ href, label, icon: Icon, color }) => {
            const isActive = pathname === href
            const c = COLOR_MAP[color] ?? COLOR_MAP.blue
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all duration-150 min-w-0 flex-1 ${
                  isActive ? 'text-white' : 'text-[#333] hover:text-[#666]'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 ${
                  isActive ? `${c.bg} ring-1 ${c.ring}` : ''
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? c.text : ''}`} />
                </div>
                <span className={`text-[9px] font-semibold tracking-wide truncate ${isActive ? 'text-white' : 'text-[#333]'}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
