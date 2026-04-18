'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, BarChart2, Sparkles, LogOut,
  Target, Images, Users2, Newspaper, Menu, X,
  ChevronRight, ChevronDown, Plus, Pencil, Trash2, Check,
} from 'lucide-react'
import KoveLogo, { KoveWordmark } from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'
import { useJournal } from '@/lib/journal-context'
import type { Journal } from '@/lib/types'

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

const JOURNAL_COLORS = [
  '#1E6EFF', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
]

interface Profile {
  display_name: string | null
  avatar_url: string | null
}

// ─── Journal Switcher ─────────────────────────────────────────────────────────
function JournalSwitcher() {
  const { journals, activeJournal, activeJournalId, setActiveJournalId, createJournal, deleteJournal, renameJournal, creating } = useJournal()
  const [open,        setOpen]        = useState(false)
  const [newMode,     setNewMode]     = useState(false)
  const [newName,     setNewName]     = useState('')
  const [newColor,    setNewColor]    = useState(JOURNAL_COLORS[0])
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editName,    setEditName]    = useState('')
  const [confirmDel,  setConfirmDel]  = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setNewMode(false); setEditingId(null); setConfirmDel(null)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleCreate() {
    if (!newName.trim()) return
    await createJournal(newName.trim(), newColor)
    setNewName(''); setNewMode(false); setOpen(false)
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return
    await renameJournal(id, editName.trim())
    setEditingId(null)
  }

  return (
    <div ref={ref} style={{ position: 'relative', margin: '0 12px 4px' }}>
      {/* Trigger */}
      <button
        onClick={() => { setOpen((v) => !v); setNewMode(false); setEditingId(null); setConfirmDel(null) }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px', borderRadius: 10,
          background: open ? 'rgba(30,110,255,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(30,110,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {/* Color dot */}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeJournal?.color ?? '#1E6EFF', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeJournal?.name ?? 'Select journal'}
        </span>
        <ChevronDown style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
          background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {/* Journal list */}
          {journals.map((j) => (
            <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', minHeight: 38 }}>
              {editingId === j.id ? (
                /* Inline rename */
                <div style={{ display: 'flex', flex: 1, gap: 6, alignItems: 'center', padding: '4px 0' }}>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(j.id); if (e.key === 'Escape') setEditingId(null) }}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(30,110,255,0.3)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12, fontFamily: 'var(--font-display)', outline: 'none' }}
                  />
                  <button onClick={() => handleRename(j.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4D90FF', padding: 0, display: 'flex' }}>
                    <Check style={{ width: 13, height: 13 }} />
                  </button>
                  <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex' }}>
                    <X style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              ) : confirmDel === j.id ? (
                /* Delete confirm */
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                  <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 11, color: '#F87171' }}>Delete &quot;{j.name}&quot;?</span>
                  <button onClick={() => { deleteJournal(j.id); setConfirmDel(null); setOpen(false) }} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 5, padding: '2px 8px', color: '#F87171', fontSize: 11, fontFamily: 'var(--font-display)', cursor: 'pointer' }}>
                    Yes
                  </button>
                  <button onClick={() => setConfirmDel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex' }}>
                    <X style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Select journal */}
                  <button
                    onClick={() => { setActiveJournalId(j.id); setOpen(false) }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: j.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: activeJournalId === j.id ? '#4D90FF' : 'rgba(255,255,255,0.7)', fontWeight: activeJournalId === j.id ? 700 : 500 }}>
                      {j.name}
                    </span>
                    {activeJournalId === j.id && <Check style={{ width: 11, height: 11, color: '#4D90FF', marginLeft: 'auto' }} />}
                  </button>
                  {/* Edit / delete */}
                  <button
                    onClick={() => { setEditingId(j.id); setEditName(j.name) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 2, display: 'flex', flexShrink: 0 }}
                    title="Rename"
                  >
                    <Pencil style={{ width: 11, height: 11 }} />
                  </button>
                  {journals.length > 1 && (
                    <button
                      onClick={() => setConfirmDel(j.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 2, display: 'flex', flexShrink: 0 }}
                      title="Delete"
                    >
                      <Trash2 style={{ width: 11, height: 11 }} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Divider */}
          {journals.length > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />}

          {/* New journal */}
          {newMode ? (
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                autoFocus
                placeholder="Journal name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setNewMode(false) }}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(30,110,255,0.3)', borderRadius: 7, padding: '6px 10px', color: '#fff', fontSize: 12, fontFamily: 'var(--font-display)', outline: 'none', width: '100%' }}
              />
              {/* Color picker */}
              <div style={{ display: 'flex', gap: 5 }}>
                {JOURNAL_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: newColor === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  style={{ flex: 1, background: 'rgba(30,110,255,0.2)', border: '1px solid rgba(30,110,255,0.35)', borderRadius: 7, padding: '5px 0', color: '#4D90FF', fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer' }}
                >
                  {creating ? '…' : 'Create'}
                </button>
                <button
                  onClick={() => { setNewMode(false); setNewName('') }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '5px 10px', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-display)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setNewMode(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', textAlign: 'left' }}
            >
              <Plus style={{ width: 13, height: 13 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 12 }}>New journal</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  const [menuOpen,  setMenuOpen]  = useState(false)
  const [profile,   setProfile]   = useState<Profile | null>(null)
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
      } catch { /* noop */ }
    }
    loadProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setMenuOpen(false) }, [pathname])
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

  const initials  = (profile?.display_name || userEmail || 'KV').slice(0, 2).toUpperCase()
  const avatarUrl = profile?.avatar_url

  function AvatarCircle({ size = 32 }: { size?: number }) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#1E6EFF,#4D90FF)', border: '1.5px solid rgba(30,110,255,0.4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        style={{ background: '#0c0c0c', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/journal" className="flex items-center transition-opacity hover:opacity-80">
            <KoveWordmark height={32} />
          </Link>
        </div>

        {/* Journal switcher */}
        <div style={{ paddingTop: 12, paddingBottom: 4 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', padding: '0 20px 6px' }}>
            Journal
          </p>
          <JournalSwitcher />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 12px 4px' }} />

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, pro }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-100"
                style={{ fontFamily: 'var(--font-display)', background: active ? 'rgba(30,110,255,0.12)' : 'transparent', color: active ? '#4D90FF' : 'rgba(255,255,255,0.35)' }}
                onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' } }}
                onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' } }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {pro && (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 700, background: 'rgba(30,110,255,0.15)', color: '#4D90FF', border: '1px solid rgba(30,110,255,0.25)', borderRadius: 4, padding: '2px 5px', letterSpacing: '0.08em' }}>
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
        style={{ height: 56, background: 'rgba(8,8,8,0.96)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <Link href="/journal" className="flex items-center transition-opacity hover:opacity-80" style={{ textDecoration: 'none' }}>
          <KoveWordmark height={28} />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/account" style={{ display: 'flex', alignItems: 'center' }}>
            <AvatarCircle size={32} />
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{ width: 40, height: 40, background: menuOpen ? 'rgba(30,110,255,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${menuOpen ? 'rgba(30,110,255,0.3)' : 'rgba(255,255,255,0.08)'}`, color: menuOpen ? '#4D90FF' : 'rgba(255,255,255,0.7)' }}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none', transition: 'opacity 0.22s ease', top: 56 }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-down menu panel */}
      <div
        className="md:hidden fixed left-0 right-0 z-40 flex flex-col"
        style={{ top: 56, background: 'rgba(10,9,18,0.98)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)', borderRadius: '0 0 20px 20px', transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)', opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none', transition: 'transform 0.22s cubic-bezier(0.32,0.72,0,1), opacity 0.18s ease', willChange: 'transform, opacity', overflow: 'hidden' }}
      >
        {/* Profile row */}
        <Link href="/account" className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: isActive('/account') ? 'rgba(30,110,255,0.08)' : 'transparent' }}>
          <AvatarCircle size={40} />
          <div className="flex flex-col flex-1 min-w-0">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.display_name || userEmail || 'My Account'}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</span>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
        </Link>

        {/* Mobile journal switcher */}
        <div style={{ padding: '10px 16px 6px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', marginBottom: 6 }}>Journal</p>
          <JournalSwitcher />
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 16px' }} />

        {/* Nav items */}
        <div className="py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, pro }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 px-5 transition-colors"
                style={{ height: 52, color: active ? '#4D90FF' : 'rgba(255,255,255,0.75)', background: active ? 'rgba(30,110,255,0.1)' : 'transparent' }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: active ? 'rgba(30,110,255,0.2)' : 'rgba(255,255,255,0.06)' }}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, flex: 1 }}>{label}</span>
                {pro && (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 700, background: 'rgba(30,110,255,0.2)', color: '#4D90FF', border: '1px solid rgba(30,110,255,0.3)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.08em' }}>
                    PRO
                  </span>
                )}
                {active && <div style={{ width: 3, height: 20, background: '#4D90FF', borderRadius: 2, flexShrink: 0 }} />}
              </Link>
            )
          })}
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />

        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-5 w-full text-left transition-colors"
          style={{ height: 52, color: '#F87171' }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <LogOut className="w-3.5 h-3.5" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>Sign Out</span>
        </button>

        <div style={{ height: 12 }} />
      </div>
    </>
  )
}
