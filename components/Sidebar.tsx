'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  BookOpen, BarChart2, Sparkles, LogOut,
  Target, Images, Users2, Newspaper, Menu, X,
  ChevronRight, User,
} from 'lucide-react'
import KoveLogo, { KoveWordmark } from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/journal',   label: 'Journal',     icon: BookOpen  },
  { href: '/stats',     label: 'Statistics',  icon: BarChart2 },
  { href: '/goals',     label: 'Goals',       icon: Target,   pro: true  },
  { href: '/gallery',   label: 'Gallery',     icon: Images    },
  { href: '/ai',        label: 'AI Insights', icon: Sparkles, pro: true  },
  { href: '/community', label: 'Community',   icon: Users2    },
  { href: '/news',      label: 'News',        icon: Newspaper },
]

interface Profile {
  display_name: string | null
  avatar_url: string | null
}

export default function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  const [menuOpen,  setMenuOpen]  = useState(false)
  const [profile,   setProfile]   = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState('')

  // Load community profile for avatar/name
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
      } catch { /* noop */ }
    }
    loadProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  async function handleSignOut() {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  // Avatar helpers
  const initials  = (profile?.display_name || userEmail || 'KV').slice(0, 2).toUpperCase()
  const avatarUrl = profile?.avatar_url

  function AvatarCircle({ size = 32 }: { size?: number }) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: '50%', flexShrink: 0,
          background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#2563EB,#3B82F6)',
          border: '1.5px solid rgba(37,99,235,0.4)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.36, color: '#fff', lineHeight: 1 }}>{initials}</span>
        }
      </div>
    )
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR
      ═══════════════════════════════════════════════════════════════════ */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] flex-col z-40"
        style={{ background: '#060606', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo — wordmark */}
        <div className="flex items-center justify-center px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/journal" className="flex items-center transition-opacity hover:opacity-80">
            <KoveWordmark height={32} />
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, pro }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-100"
                style={{ fontFamily: 'var(--font-display)', background: active ? 'rgba(37,99,235,0.12)' : 'transparent', color: active ? '#3B82F6' : 'rgba(255,255,255,0.35)' }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' } }}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' } }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {pro && (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 700, background: 'rgba(37,99,235,0.15)', color: '#3B82F6', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 4, padding: '2px 5px', letterSpacing: '0.08em' }}>
                    PRO
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom — account + sign out */}
        <div className="px-3 py-4 flex flex-col gap-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href="/account"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-100"
            style={{ fontFamily: 'var(--font-display)', background: isActive('/account') ? 'rgba(255,255,255,0.05)' : 'transparent', color: isActive('/account') ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => { if (!isActive('/account')) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' } }}
            onMouseLeave={(e) => { if (!isActive('/account')) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' } }}
          >
            <AvatarCircle size={20} />
            <span className="flex-1">Account</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium w-full text-left transition-all duration-100"
            style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.22)', background: 'transparent' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#F87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.22)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>

          <div className="mt-3 px-3">
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.16)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              KoveFX · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE TOP BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{
          height: 56,
          background: 'rgba(0,0,0,0.97)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo — wordmark */}
        <Link href="/journal" className="flex items-center transition-opacity hover:opacity-80" style={{ textDecoration: 'none' }}>
          <KoveWordmark height={28} />
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Avatar → account */}
          <Link href="/account" style={{ display: 'flex', alignItems: 'center' }}>
            <AvatarCircle size={32} />
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{
              width: 40, height: 40,
              background: menuOpen ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${menuOpen ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: menuOpen ? '#3B82F6' : 'rgba(255,255,255,0.7)',
            }}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE FULL-SCREEN MENU OVERLAY
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
          top: 56,
        }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-down menu panel */}
      <div
        className="md:hidden fixed left-0 right-0 z-40 flex flex-col"
        style={{
          top: 56,
          background: 'rgba(2,2,2,0.99)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0 0 20px 20px',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'transform 0.22s cubic-bezier(0.32,0.72,0,1), opacity 0.18s ease',
          willChange: 'transform, opacity',
          overflow: 'hidden',
        }}
      >
        {/* Profile row at top */}
        <Link
          href="/account"
          className="flex items-center gap-3 px-5 py-4"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: isActive('/account') ? 'rgba(37,99,235,0.08)' : 'transparent',
          }}
        >
          <AvatarCircle size={40} />
          <div className="flex flex-col flex-1 min-w-0">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.display_name || userEmail || 'My Account'}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
        </Link>

        {/* Nav items */}
        <div className="py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, pro }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 px-5 transition-colors"
                style={{
                  height: 52,
                  color: active ? '#3B82F6' : 'rgba(255,255,255,0.75)',
                  background: active ? 'rgba(37,99,235,0.1)' : 'transparent',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: active ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.06)' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, flex: 1 }}>
                  {label}
                </span>
                {pro && (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 700, background: 'rgba(37,99,235,0.2)', color: '#3B82F6', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>
                    PRO
                  </span>
                )}
                {active && <div style={{ width: 3, height: 20, background: '#3B82F6', borderRadius: 2, flexShrink: 0 }} />}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-5 w-full text-left transition-colors"
          style={{ height: 52, color: '#F87171' }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <LogOut className="w-3.5 h-3.5" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>
            Sign Out
          </span>
        </button>

        {/* Safe area bottom padding */}
        <div style={{ height: 12 }} />
      </div>
    </>
  )
}
