'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen, BarChart2, Sparkles, User, LogOut,
  Target, Images, Users2, Newspaper,
} from 'lucide-react'
import KoveLogo from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

const sections = [
  {
    label: 'Journal',
    items: [
      { href: '/journal', label: 'Journal', icon: BookOpen },
      { href: '/stats', label: 'Stats', icon: BarChart2 },
      { href: '/goals', label: 'Goals', icon: Target, pro: true },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/gallery', label: 'Gallery', icon: Images },
      { href: '/ai', label: 'AI Insights', icon: Sparkles, pro: true },
    ],
  },
  {
    label: 'Discover',
    items: [
      { href: '/community', label: 'Community', icon: Users2 },
      { href: '/news', label: 'News', icon: Newspaper },
    ],
  },
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
      {/* ─── Desktop Sidebar ─────────────────────── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] flex-col z-40"
        style={{
          background: 'var(--surface-1)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/journal" className="flex items-center gap-2.5 group">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200"
              style={{ background: 'var(--accent)', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
            >
              <KoveLogo size={18} />
            </div>
            <div>
              <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', letterSpacing: '-0.01em' }}>KoveFX</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-5 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label}>
              <p
                className="px-2.5 mb-1"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: 'var(--text-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {section.label}
              </p>
              <div className="flex flex-col gap-px">
                {section.items.map(({ href, label, icon: Icon, pro }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-100"
                      style={{
                        fontFamily: 'var(--font-display)',
                        background: active ? 'rgba(37,99,235,0.1)' : 'transparent',
                        color: active ? '#60A5FA' : 'var(--text-3)',
                      }}
                      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-2)' }}
                      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-3)' }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{label}</span>
                      {pro && (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            fontFamily: 'var(--font-display)',
                            background: 'rgba(37,99,235,0.12)',
                            color: '#60A5FA',
                            letterSpacing: '0.06em',
                            border: '1px solid rgba(37,99,235,0.2)',
                          }}
                        >
                          PRO
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href="/account"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors duration-100 mb-px"
            style={{
              fontFamily: 'var(--font-display)',
              background: isActive('/account') ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: isActive('/account') ? 'var(--text-1)' : 'var(--text-3)',
            }}
          >
            <User className="w-4 h-4" />
            Account
          </Link>

          <button
            onClick={handleSignOut}
            className="group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium w-full transition-colors duration-100"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-4)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#F87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-4)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>

          <div className="mt-4 px-2.5">
            <p className="text-[10px]" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
              DMFX · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ──────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-5"
        style={{
          background: 'rgba(11,13,16,0.95)',
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
          <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>KoveFX</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
          style={{ color: 'var(--text-3)' }}
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* ─── Mobile Bottom Nav ───────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{
          background: 'rgba(11,13,16,0.98)',
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
                  style={{ color: active ? '#60A5FA' : 'var(--text-4)' }}
                />
                <span
                  className="text-[9px] font-medium"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: active ? '#60A5FA' : 'var(--text-4)',
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
