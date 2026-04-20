'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import {
  Loader2, Sparkles, Lock, Mail, Receipt, ExternalLink,
  ChevronDown, ChevronUp, Pencil, Check, X, Camera,
  Trophy, Trash2, MessageSquare, Heart, FileText,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/* ─── Types ─── */
interface SubscriptionInfo {
  status: string
  current_period_end: string | null
  active: boolean
}

interface Invoice {
  id: string
  amount: number
  currency: string
  date: string
  pdf: string | null
  status: string | null
  number: string | null
}

interface CommunityProfile {
  display_name: string | null
  avatar_url: string | null
  bio: string | null
}

interface MiniPost {
  id: string
  content: string
  like_count: number
  created_at: string
}

/* ─── Helpers ─── */
function getInitials(email: string, displayName: string | null) {
  if (displayName) return displayName.slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

/* ─── Sub-components ─── */
function InnerCard({ title, children, collapsible = false, defaultOpen = true }: {
  title: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => collapsible && setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ cursor: collapsible ? 'pointer' : 'default' }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
          {title}
        </span>
        {collapsible && (
          open
            ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
            : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

/* ─── Delete Modal ─── */
function DeleteModal({ onClose, onConfirm, loading }: { onClose: () => void; onConfirm: () => void; loading: boolean }) {
  const [typed, setTyped] = useState('')
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm flex flex-col gap-4 p-6"
        style={{
          background: '#0f0f0f',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 20,
        }}
      >
        <div className="flex items-center justify-between">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>Delete Account</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          This will permanently delete your account, all posts, and all data. This action cannot be undone.
        </p>
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Type DELETE to confirm
          </label>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
            className="input"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 !min-h-0 h-10 text-xs">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={typed !== 'DELETE' || loading}
            className="flex-1 h-10 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all"
            style={{
              background: typed === 'DELETE' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.05)',
              color: typed === 'DELETE' ? '#F87171' : 'rgba(248,113,113,0.3)',
              border: '1px solid rgba(239,68,68,0.2)',
              cursor: typed === 'DELETE' && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Content ─── */
function AccountContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auth
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')

  // Profile
  const [profile, setProfile] = useState<CommunityProfile | null>(null)
  const [postCount, setPostCount] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)

  // Subscription
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showInvoices, setShowInvoices] = useState(false)
  const [invoicesLoading, setInvoicesLoading] = useState(false)

  // My posts
  const [myPosts, setMyPosts] = useState<MiniPost[]>([])

  // Loading states
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [error, setError] = useState('')

  // Inline display name edit
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  // Bio
  const [bioValue, setBioValue] = useState('')
  const [bioSaving, setBioSaving] = useState(false)

  // Change email
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [emailError, setEmailError] = useState('')

  // Change password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const subscriptionMessage = searchParams.get('subscription')

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserEmail(user.email ?? '')
          setUserId(user.id)
        }

        const [subRes, profileRes, leaderRes, postsRes] = await Promise.all([
          fetch('/api/stripe/subscription-status'),
          fetch('/api/community/profile'),
          fetch('/api/leaderboard'),
          fetch('/api/community/posts?mine=true&limit=5'),
        ])

        const subData = await subRes.json()
        setSubscription(subData)

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData.profile ?? null)
          setPostCount(profileData.post_count ?? 0)
          setNameValue(profileData.profile?.display_name ?? '')
          setBioValue(profileData.profile?.bio ?? '')
        }

        if (leaderRes.ok) {
          const leaderData = await leaderRes.json()
          setUserRank(leaderData.userRank ?? null)
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json()
          setMyPosts(postsData.posts ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Avatar upload ── */
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch('/api/community/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const { url } = await uploadRes.json()
      const profileRes = await fetch('/api/community/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      })
      if (!profileRes.ok) throw new Error('Profile update failed')
      const { profile: updated } = await profileRes.json()
      setProfile(updated)
    } catch {
      setError('Failed to upload avatar.')
    } finally {
      setAvatarLoading(false)
    }
  }

  /* ── Save display name ── */
  async function saveName() {
    setNameSaving(true)
    try {
      const res = await fetch('/api/community/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: nameValue }),
      })
      if (!res.ok) throw new Error('Failed')
      const { profile: updated } = await res.json()
      setProfile(updated)
      setEditingName(false)
    } catch {
      /* noop */
    } finally {
      setNameSaving(false)
    }
  }

  /* ── Save bio on blur ── */
  async function saveBio() {
    setBioSaving(true)
    try {
      await fetch('/api/community/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioValue }),
      })
    } finally {
      setBioSaving(false)
    }
  }

  /* ── Upgrade / Portal ── */
  async function handleUpgrade() {
    setCheckoutLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.url) window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handleManage() {
    setPortalLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()

      // Manual/grandfathered grant — no Stripe billing to manage
      if (data.error === 'manual') {
        setError('Your Pro access was granted directly — there is no billing to manage here.')
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Failed to open billing portal. Try again.')
      }
    } catch {
      setError('Network error — check your connection and try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  /* ── Change email ── */
  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailLoading(true)
    setEmailMsg('')
    setEmailError('')
    if (!newEmail.trim() || newEmail === userEmail) {
      setEmailError('Please enter a different email address.')
      setEmailLoading(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) setEmailError(error.message)
    else { setEmailMsg('Confirmation sent to your new email.'); setNewEmail('') }
    setEmailLoading(false)
  }

  /* ── Change password ── */
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMsg('')
    setPasswordError('')
    if (newPassword.length < 8) { setPasswordError('At least 8 characters required.'); setPasswordLoading(false); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); setPasswordLoading(false); return }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: userEmail, password: currentPassword })
    if (signInError) { setPasswordError('Current password is incorrect.'); setPasswordLoading(false); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPasswordError(error.message)
    else { setPasswordMsg('Password updated successfully.'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }
    setPasswordLoading(false)
  }

  /* ── Load invoices ── */
  async function loadInvoices() {
    if (invoices.length > 0) { setShowInvoices((s) => !s); return }
    setInvoicesLoading(true)
    setShowInvoices(true)
    try {
      const res = await fetch('/api/stripe/invoices')
      const data = await res.json()
      setInvoices(data.invoices ?? [])
    } finally {
      setInvoicesLoading(false)
    }
  }

  /* ── Delete account ── */
  async function handleDelete() {
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      setError('Failed to delete account. Please try again.')
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  const displayName = profile?.display_name || userEmail.split('@')[0]
  const avatarUrl = profile?.avatar_url
  const initials = getInitials(userEmail, profile?.display_name ?? null)

  return (
    <div className="animate-fade-in">
      <div className="mb-6 md:mb-8">
        <p className="page-label">Settings</p>
        <h1 className="page-title">Account</h1>
      </div>

      {/* Banners */}
      {subscriptionMessage === 'success' && (
        <div className="flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/15 rounded-2xl px-5 py-4 mb-5 text-emerald-400 text-sm font-light">
          Pro plan activated! AI insights unlocked.
        </div>
      )}
      {subscriptionMessage === 'canceled' && (
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 mb-5 text-[#666] text-sm font-light">
          Checkout canceled. No charge was made.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/15 rounded-2xl px-5 py-4 mb-5 text-red-400 text-sm font-light">
          {error}
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ──────────── LEFT PANEL ──────────── */}
        <div
          className="w-full lg:w-[380px] lg:flex-shrink-0 flex flex-col gap-4"
          style={{
            background: 'linear-gradient(160deg,#1a1640 0%,#0f0d2a 100%)',
            border: '1px solid rgba(30,110,255,0.2)',
            borderRadius: 20,
            padding: 24,
          }}
        >
          {/* Avatar + Name */}
          <div className="flex flex-col items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Avatar */}
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                style={{
                  background: avatarUrl ? 'transparent' : 'linear-gradient(135deg,#1E6EFF 0%,#4D90FF 100%)',
                  border: '2px solid rgba(30,110,255,0.3)',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#fff' }}>
                    {initials}
                  </span>
                )}
                {/* Camera overlay */}
                <div
                  className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Display name inline edit */}
            {editingName ? (
              <div className="flex items-center gap-2 w-full justify-center">
                <input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  maxLength={30}
                  className="input text-center !py-1.5 !px-3 text-sm w-40"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                />
                <button
                  onClick={saveName}
                  disabled={nameSaving}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(30,110,255,0.2)', color: '#4D90FF' }}
                >
                  {nameSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#fff' }}>
                  {displayName}
                </span>
                <button
                  onClick={() => setEditingName(true)}
                  className="w-6 h-6 rounded-md flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: '#4D90FF' }}
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Post count + rank */}
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{postCount}</span> posts
              </span>
              {userRank && (
                <Link
                  href="/stats?tab=leaderboard"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-all hover:opacity-80"
                  style={{
                    background: 'rgba(30,110,255,0.15)',
                    border: '1px solid rgba(30,110,255,0.3)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#4D90FF',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <Trophy className="w-3 h-3" />
                  Rank #{userRank}
                </Link>
              )}
            </div>
          </div>

          {/* Bio */}
          <InnerCard title="Bio">
            <div className="flex flex-col gap-2">
              <textarea
                value={bioValue}
                onChange={(e) => setBioValue(e.target.value.slice(0, 150))}
                onBlur={saveBio}
                placeholder="Tell the community about yourself..."
                rows={3}
                className="input !resize-none text-sm"
                style={{ minHeight: 72 }}
              />
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{bioValue.length}/150</span>
                {bioSaving && <span style={{ fontSize: 10, color: 'rgba(77,144,255,0.6)' }}>Saving...</span>}
              </div>
            </div>
          </InnerCard>

          {/* Change email */}
          <InnerCard title="Change Email" collapsible defaultOpen={false}>
            <div className="flex flex-col gap-3">
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{userEmail}</p>
              <form onSubmit={handleChangeEmail} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                  className="input text-sm"
                  required
                />
                {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
                {emailMsg && <p className="text-emerald-400 text-xs">{emailMsg}</p>}
                <button type="submit" disabled={emailLoading} className="btn-secondary !min-h-0 h-9 text-xs gap-2">
                  {emailLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  <Mail className="w-3 h-3" />
                  Update Email
                </button>
              </form>
            </div>
          </InnerCard>

          {/* Change password */}
          <InnerCard title="Change Password" collapsible defaultOpen={false}>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-2">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="input text-sm"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8)"
                className="input text-sm"
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="input text-sm"
                required
              />
              {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
              {passwordMsg && <p className="text-emerald-400 text-xs">{passwordMsg}</p>}
              <button type="submit" disabled={passwordLoading} className="btn-secondary !min-h-0 h-9 text-xs gap-2">
                {passwordLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                <Lock className="w-3 h-3" />
                Update Password
              </button>
            </form>
          </InnerCard>
        </div>

        {/* ──────────── RIGHT PANEL ──────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Subscription card */}
          <div
            className="w-full flex flex-col justify-between p-6"
            style={{
              background: 'linear-gradient(135deg,#1050CC 0%,#1E6EFF 60%,#6060C8 100%)',
              borderRadius: 20,
              minHeight: 170,
            }}
          >
            {subscription?.active ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-white/80" />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>
                        Pro Plan Active
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '2px 7px' }}>✓</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                      $19/month · AI insights active
                    </p>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                    {subscription.current_period_end
                      ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : ''}
                  </p>
                  <button
                    onClick={handleManage}
                    disabled={portalLoading}
                    className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: '#fff', color: '#1050CC' }}
                  >
                    {portalLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Manage Billing
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Starter Plan
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', marginTop: 4 }}>
                    Upgrade to Pro →
                  </p>
                </div>
                <div className="flex items-end justify-between mt-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {['AI Insights', 'Patterns', 'Reports'].map((f) => (
                      <span key={f} style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: '2px 8px' }}>
                        {f}
                      </span>
                    ))}
                    <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>
                      $19<span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: 4 }}>$29</span>/mo
                    </span>
                  </div>
                  <button
                    onClick={handleUpgrade}
                    disabled={checkoutLoading}
                    className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold"
                    style={{ background: '#fff', color: '#1050CC' }}
                  >
                    {checkoutLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    <Sparkles className="w-3 h-3" style={{ color: '#1050CC' }} />
                    Upgrade — $19/mo
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Bottom row: My Posts + Billing History */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* My Posts */}
            <div
              className="flex flex-col gap-3 p-5"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18 }}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  Your Posts
                </span>
              </div>
              {myPosts.length === 0 ? (
                <div className="flex flex-col gap-2 py-4 items-center text-center">
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>No posts yet</p>
                  <Link href="/community" style={{ fontSize: 11, color: '#4D90FF', fontWeight: 600 }}>
                    Go to Community →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {myPosts.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col gap-1 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                        {p.content.length > 80 ? p.content.slice(0, 80) + '…' : p.content}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                          <Heart className="w-2.5 h-2.5" /> {p.like_count}
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                          {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Billing History */}
            <div
              className="flex flex-col gap-3 p-5"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18 }}
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  Billing History
                </span>
              </div>
              <button
                onClick={loadInvoices}
                className="flex items-center gap-2 text-sm transition-colors self-start"
                style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}
              >
                {showInvoices ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showInvoices ? 'Hide invoices' : 'Show payment history'}
              </button>
              {showInvoices && (
                <div>
                  {invoicesLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-4 h-4 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                    </div>
                  ) : invoices.length === 0 ? (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No invoices found.</p>
                  ) : (
                    <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      {invoices.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between py-3">
                          <div>
                            <p style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>
                              ${inv.amount.toFixed(2)} {inv.currency.toUpperCase()}
                            </p>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                              {new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {inv.number ? ` · ${inv.number}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 9, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                              {inv.status ?? 'paid'}
                            </span>
                            {inv.pdf && (
                              <a href={inv.pdf} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.3)' }} className="hover:text-white transition-colors">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2 pb-2">
            <div className="flex items-center gap-4">
              <Link href="/terms" style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }} className="hover:text-white/40 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }} className="hover:text-white/40 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/subscription-policy" style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }} className="hover:text-white/40 transition-colors">
                Subscription Policy
              </Link>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-semibold transition-all"
              style={{
                color: 'rgba(248,113,113,0.6)',
                background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.1)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#F87171'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(248,113,113,0.6)'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.04)'
              }}
            >
              <Trash2 className="w-3 h-3" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}

/* ─── Page ─── */
export default function AccountPage() {
  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-10">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
          </div>
        }
      >
        <AccountContent />
      </Suspense>
    </div>
  )
}
