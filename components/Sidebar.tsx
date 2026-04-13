'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen, BarChart2, Sparkles, User, LogOut,
  Target, Images, Users2, Newspaper,
} from 'lucide-react'
import KoveLogo from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/stats', label: 'Statistics', icon: BarChart2 },
  { href: '/goals', label: 'Goals', icon: Target, pro: true },
  { href: '/gallery', label: 'Gallery', icon: Images },
  { href: '/ai', label: 'AI Insights', icon: Sparkles, pro: true },
  { href: '/community', label: 'Community', icon: Users2 },
  { href: '/news', label: 'News', icon: Newspaper },
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] flex-col z-40"
        style={{
          background: '#0c0c0c',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo — centered */}
        <div
          className="flex flex-col items-center py-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Link href="/journal" className="flex flex-col items-center gap-2 group">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7B6CF5 0%, #5C4ED4 100%)',
                boxShadow: '0 0 24px rgba(108,93,211,0.4), 0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <KoveLogo size={22} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '-0.01em',
              }}
            >
              KoveFX
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, pro }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-100"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: active ? 'rgba(108,93,211,0.12)' : 'transparent',
                  color: active ? '#8B7CF8' : 'rgba(255,255,255,0.35)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                    ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'
                  }
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {pro && (
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '8px',
                      fontWeight: 700,
                      background: 'rgba(108,93,211,0.15)',
                      color: '#8B7CF8',
                      border: '1px solid rgba(108,93,211,0.25)',
                      borderRadius: '4px',
                      padding: '2px 5px',
                      letterSpacing: '0.08em',
                    }}
                  >
                    PRO
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div
          className="px-3 py-4 flex flex-col gap-0.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Link
            href="/account"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-100"
            style={{
              fontFamily: 'var(--font-display)',
              background: isActive('/account') ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: isActive('/account') ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
            }}
            onMouseEnter={(e) => {
              if (!isActive('/account')) {
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/account')) {
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'
              }
            }}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            Account
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium w-full text-left transition-all duration-100"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'rgba(255,255,255,0.22)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = '#F87171'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.22)'
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>

          <div className="mt-3 px-3">
            <p
              style={{
                fontSize: '9px',
                color: 'rgba(255,255,255,0.16)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              DMFX · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ─── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-5"
        style={{
          background: 'rgba(8,8,8,0.97)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Link href="/journal" className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <KoveLogo size={16} />
          </div>
          <span
            style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '14px' }}
          >
            KoveFX
          </span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{
          background: 'rgba(8,8,8,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-around px-1 h-[56px]">
          {[
            { href: '/journal', label: 'Journal', icon: BookOpen },
            { href: '/stats', label: 'Stats', icon: BarChart2 },
            { href: '/goals', label: 'Goals', icon: Target },
            { href: '/gallery', label: 'Gallery', icon: Images },
            { href: '/ai', label: 'AI', icon: Sparkles },
            { href: '/account', label: 'Account', icon: User },
          ].map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 py-2 px-2 flex-1 transition-all duration-150"
              >
                <Icon
                  className="w-[18px] h-[18px]"
                  style={{ color: active ? '#8B7CF8' : 'rgba(255,255,255,0.22)' }}
                />
                <span
                  className="text-[9px] font-medium"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: active ? '#8B7CF8' : 'rgba(255,255,255,0.22)',
                    letterSpacing: '0.04em',
                  }}
                >
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
