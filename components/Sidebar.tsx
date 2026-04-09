'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen,
  BarChart2,
  Sparkles,
  User,
  LogOut,
  TrendingUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
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
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] bg-[#080808] border-r border-[#181818] flex-col z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#181818]">
          <Link href="/journal" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-base tracking-tight">
              KoveFX
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/12 text-blue-400 border border-blue-500/20'
                    : 'text-[#777] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`}
                />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-[#181818]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#555] hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ───────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-b border-[#181818]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/journal" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">KoveFX</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-all"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── Mobile Bottom Navigation ─────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-[#181818] safe-bottom">
        <div className="flex items-center justify-around px-2 h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 min-w-[60px] ${
                  isActive
                    ? 'text-blue-400'
                    : 'text-[#555] hover:text-[#999]'
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 ${
                    isActive ? 'bg-blue-600/15' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
