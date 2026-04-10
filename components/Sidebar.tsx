'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, BarChart2, Sparkles, User, LogOut, TrendingUp, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/ai', label: 'AI', icon: Sparkles },
  { href: '/account', label: 'Account', icon: User },
]

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
        <div className="px-6 py-6 border-b border-white/[0.05]">
          <Link href="/journal" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">KoveFX</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/[0.06] text-white border border-white/[0.08]'
                    : 'text-[#555] hover:text-[#aaa] hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-5 border-t border-white/[0.05]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#444] hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ───────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#060606]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/journal" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">KoveFX</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[#444] hover:text-red-400 hover:bg-red-500/8 transition-all"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── Mobile Bottom Navigation ─────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060606]/98 backdrop-blur-xl border-t border-white/[0.05] safe-bottom">
        <div className="flex items-center justify-around px-2 h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-150 min-w-[64px] ${
                  isActive ? 'text-white' : 'text-[#444] hover:text-[#777]'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 ${
                  isActive ? 'bg-white/[0.08]' : ''
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
                </div>
                <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-white' : ''}`}>
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
