'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  BookOpen, BarChart2, Sparkles, User, LogOut,
  Target, Images, Users2, Newspaper, Grid3X3,
  ChevronRight, X,
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

const BOTTOM_NAV = [
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
  { href: '/ai', label: 'AI', icon: Sparkles },
  { href: '/community', label: 'Community', icon: Users2 },
]

const DRAWER_ITEMS = [
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/gallery', label: 'Gallery', icon: Images },
  { href: '/news', label: 'News', icon: Newspaper },
]

interface Profile {
  display_name: string | null
  avatar_url: string | null
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setUserEmail(user.email ?? '')
        const res = await fetch('/api/community/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile ?? null)
        }
      } catch {
        /* noop */
      }
    }
    loadProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  // Avatar helpers
  const initials = (profile?.display_name || userEmail).slice(0, 2).toUpperCase() || 'KV'
  const avatarUrl = profile?.avatar_url

  function AvatarCircle({ size = 32 }: { size?: number }) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#6C5DD3 0%,#8B7CF8 100%)',
          border: '1px solid rgba(108,93,211,0.3)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.35, color: '#fff' }}>
            {initials}
          </span>
        )}
      </div>
    )
  }

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
        {/* Logo */}
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

        {/* Bottom — Account with avatar */}
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
            <AvatarCircle size={20} />
            <span className="flex-1">Account</span>
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
        <Link href="/account" aria-label="Account">
          <AvatarCircle size={32} />
        </Link>
      </header>

      {/* ─── Mobile Bottom Nav (5 items) ─── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{
          background: 'rgba(8,8,8,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-around px-1 h-[56px]">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 py-2 px-2 flex-1 transition-all duration-150"
                style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
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

          {/* More button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-1 py-2 px-2 flex-1 transition-all duration-150"
            style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
          >
            <Grid3X3
              className="w-[18px] h-[18px]"
              style={{ color: drawerOpen ? '#8B7CF8' : 'rgba(255,255,255,0.22)' }}
            />
            <span
              className="text-[9px] font-medium"
              style={{
                fontFamily: 'var(--font-display)',
                color: drawerOpen ? '#8B7CF8' : 'rgba(255,255,255,0.22)',
                letterSpacing: '0.04em',
              }}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ─── Mobile More Drawer ─── */}
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className="md:hidden fixed left-0 right-0 z-50 flex flex-col"
        style={{
          bottom: 56,
          background: 'rgba(10,10,10,0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px 20px 0 0',
          transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s cubic-bezier(0.32,0.72,0,1)',
          willChange: 'transform',
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            More
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer items */}
        {DRAWER_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-5 transition-all"
              style={{
                height: 56,
                color: active ? '#8B7CF8' : 'rgba(255,255,255,0.7)',
                background: active ? 'rgba(108,93,211,0.08)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: active ? 'rgba(108,93,211,0.15)' : 'rgba(255,255,255,0.05)' }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, flex: 1 }}>
                {label}
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
            </Link>
          )
        })}

        {/* Account row */}
        <Link
          href="/account"
          className="flex items-center gap-4 px-5 transition-all"
          style={{
            height: 56,
            color: isActive('/account') ? '#8B7CF8' : 'rgba(255,255,255,0.7)',
            background: isActive('/account') ? 'rgba(108,93,211,0.08)' : 'transparent',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isActive('/account') ? 'rgba(108,93,211,0.15)' : 'rgba(255,255,255,0.05)' }}
          >
            <User className="w-4 h-4" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, flex: 1 }}>
            Account
          </span>
          <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
        </Link>

        {/* Sign out row */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-5 w-full text-left transition-all"
          style={{ height: 56, color: '#F87171' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.08)' }}
          >
            <LogOut className="w-4 h-4" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, flex: 1 }}>
            Sign Out
          </span>
        </button>

        {/* Bottom padding for safe area */}
        <div className="h-4" />
      </div>
    </>
  )
}
