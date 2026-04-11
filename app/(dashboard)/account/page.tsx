'use client'

import { Suspense, useState, useEffect } from 'react'
import {
  User, CreditCard, CheckCircle, XCircle, Loader2, Sparkles,
  Lock, Mail, Receipt, ExternalLink, ChevronDown, ChevronUp,
  ListChecks, Plus, Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

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

function SectionCard({
  icon: Icon,
  iconBg = 'bg-white/[0.04]',
  iconBorder = 'border-white/[0.06]',
  iconColor = 'text-[#555]',
  title,
  children,
}: {
  icon: React.ElementType
  iconBg?: string
  iconBorder?: string
  iconColor?: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6 md:p-7">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-9 h-9 ${iconBg} border ${iconBorder} rounded-2xl flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function AccountContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()

  const [userEmail, setUserEmail] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState('')

  // Change email state
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [emailError, setEmailError] = useState('')

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Billing history toggle
  const [showInvoices, setShowInvoices] = useState(false)
  const [invoicesLoading, setInvoicesLoading] = useState(false)

  // Checklist state
  const [checklistName, setChecklistName] = useState('Pre-Trade Checklist')
  const [checklistItems, setChecklistItems] = useState<string[]>([''])
  const [checklistLoading, setChecklistLoading] = useState(false)
  const [checklistSaved, setChecklistSaved] = useState(false)
  const [checklistLoaded, setChecklistLoaded] = useState(false)

  const subscriptionMessage = searchParams.get('subscription')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email ?? '')
      try {
        const res = await fetch('/api/stripe/subscription-status')
        const data = await res.json()
        setSubscription(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  async function handleUpgrade() {
    setCheckoutLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
      if (data.url) window.location.href = data.url
      else throw new Error('No checkout URL returned')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout. Try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function handleManage() {
    setPortalLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error('No portal URL')
    } catch {
      setError('Failed to open billing portal. Try again.')
    } finally {
      setPortalLoading(false)
    }
  }

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

    if (error) {
      setEmailError(error.message)
    } else {
      setEmailMsg('Confirmation sent to your new email. Check your inbox.')
      setNewEmail('')
    }
    setEmailLoading(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMsg('')
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      setPasswordLoading(false)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      setPasswordLoading(false)
      return
    }

    // Re-authenticate with current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    })

    if (signInError) {
      setPasswordError('Current password is incorrect.')
      setPasswordLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordMsg('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

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

  async function loadChecklist() {
    if (checklistLoaded) return
    const res = await fetch('/api/checklist')
    const data = await res.json()
    if (data.checklist) {
      setChecklistName(data.checklist.name || 'Pre-Trade Checklist')
      setChecklistItems(data.items?.length > 0 ? data.items.map((i: { label: string }) => i.label) : [''])
    }
    setChecklistLoaded(true)
  }

  async function handleChecklistSave(e: React.FormEvent) {
    e.preventDefault()
    setChecklistLoading(true)
    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: checklistName, items: checklistItems.filter((i) => i.trim()) }),
    })
    const data = await res.json()
    if (data.checklist) {
      setChecklistItems(data.items?.length > 0 ? data.items.map((i: { label: string }) => i.label) : [''])
    }
    setChecklistLoading(false)
    setChecklistSaved(true)
    setTimeout(() => setChecklistSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-7 md:mb-10">
        <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Settings</p>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Account</h1>
      </div>

      {/* Banners */}
      {subscriptionMessage === 'success' && (
        <div className="flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/15 rounded-2xl px-5 py-4 mb-6 text-emerald-400 text-sm animate-fade-in-up font-light">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          Subscription activated! AI insights unlocked.
        </div>
      )}
      {subscriptionMessage === 'canceled' && (
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 mb-6 text-[#666] text-sm animate-fade-in-up font-light">
          <XCircle className="w-5 h-5 flex-shrink-0 text-[#444]" />
          Checkout canceled. No charge was made.
        </div>
      )}

      <div className="max-w-lg flex flex-col gap-4">

        {/* ── Profile ── */}
        <SectionCard icon={User} title="Profile">
          <div className="flex flex-col gap-2">
            <label className="label">Current email</label>
            <p className="text-sm text-[#888] bg-[#080808] border border-white/[0.05] rounded-2xl px-4 py-3.5 font-light">
              {userEmail}
            </p>
          </div>
        </SectionCard>

        {/* ── Change Email ── */}
        <SectionCard icon={Mail} title="Change Email">
          <form onSubmit={handleChangeEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="label">New email address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                className="input"
                required
              />
            </div>
            {emailError && (
              <p className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3 font-light">
                {emailError}
              </p>
            )}
            {emailMsg && (
              <p className="text-emerald-400 text-sm bg-emerald-500/8 border border-emerald-500/15 rounded-xl px-4 py-3 font-light">
                {emailMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={emailLoading}
              className="btn-secondary gap-2 self-start !min-h-0 h-10 !px-5 !py-2.5 text-xs"
            >
              {emailLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Update Email
            </button>
          </form>
        </SectionCard>

        {/* ── Change Password ── */}
        <SectionCard icon={Lock} title="Change Password">
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="label">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Your current password"
                className="input"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters…"
                className="input"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password…"
                className="input"
                required
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3 font-light">
                {passwordError}
              </p>
            )}
            {passwordMsg && (
              <p className="text-emerald-400 text-sm bg-emerald-500/8 border border-emerald-500/15 rounded-xl px-4 py-3 font-light">
                {passwordMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-secondary gap-2 self-start !min-h-0 h-10 !px-5 !py-2.5 text-xs"
            >
              {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Update Password
            </button>
          </form>
        </SectionCard>

        {/* ── Subscription ── */}
        <SectionCard
          icon={CreditCard}
          iconBg="bg-violet-500/8"
          iconBorder="border-violet-500/15"
          iconColor="text-violet-400/70"
          title="Subscription"
        >
          {subscription?.active ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400/70" />
                    <p className="text-sm font-bold text-white">Pro Plan</p>
                  </div>
                  <p className="text-xs text-[#555] font-light">$12/month · AI insights active</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full tracking-wide">
                  ACTIVE
                </span>
              </div>

              {subscription.current_period_end && (
                <p className="text-xs text-[#444] font-light">
                  Renews on{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              )}

              <button onClick={handleManage} disabled={portalLoading} className="btn-secondary gap-2 self-start !min-h-0 h-10 !px-5 !py-2.5 text-xs">
                {portalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Manage Billing
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Free Plan</p>
                  <p className="text-xs text-[#444] font-light">Journal + basic stats</p>
                </div>
                <span className="text-[11px] font-medium text-[#444] bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full tracking-wide">
                  {subscription?.status === 'canceled' ? 'CANCELED' : 'FREE'}
                </span>
              </div>

              <div className="p-5 bg-violet-600/4 border border-violet-500/12 rounded-2xl">
                <p className="text-sm font-bold text-white mb-1">Upgrade to Pro</p>
                <p className="text-xs text-[#444] mb-5 leading-relaxed font-light">
                  AI trade analysis, mistake identification, and pattern detection.
                </p>
                <button onClick={handleUpgrade} disabled={checkoutLoading} className="btn-blue gap-2 w-full">
                  {checkoutLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Sparkles className="w-3.5 h-3.5" />
                  Upgrade — $12/month
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-2xl px-4 py-3 mt-4 font-light">
              {error}
            </div>
          )}
        </SectionCard>

        {/* ── Billing History ── */}
        <SectionCard icon={Receipt} title="Billing History">
          <button
            onClick={loadInvoices}
            className="flex items-center gap-2 text-sm text-[#555] hover:text-white transition-colors"
          >
            {showInvoices ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {showInvoices ? 'Hide invoices' : 'Show payment history'}
          </button>

          {showInvoices && (
            <div className="mt-5">
              {invoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-4 h-4 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                </div>
              ) : invoices.length === 0 ? (
                <p className="text-[#444] text-sm font-light py-4">No invoices found.</p>
              ) : (
                <div className="flex flex-col divide-y divide-white/[0.04]">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-3.5">
                      <div>
                        <p className="text-sm text-white font-medium">
                          ${inv.amount.toFixed(2)} {inv.currency}
                        </p>
                        <p className="text-xs text-[#444] font-light mt-0.5">
                          {new Date(inv.date).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                          {inv.number ? ` · ${inv.number}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full tracking-wide uppercase">
                          {inv.status ?? 'paid'}
                        </span>
                        {inv.pdf && (
                          <a
                            href={inv.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#444] hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ── Pre-Trade Checklist ── */}
        <SectionCard icon={ListChecks} title="Pre-Trade Checklist">
          {!checklistLoaded ? (
            <button
              onClick={loadChecklist}
              className="text-sm text-[#555] hover:text-white transition-colors flex items-center gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              Load my checklist
            </button>
          ) : (
            <form onSubmit={handleChecklistSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="label">Checklist name</label>
                <input
                  type="text"
                  value={checklistName}
                  onChange={(e) => setChecklistName(e.target.value)}
                  placeholder="Pre-Trade Checklist"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label">Checklist items</label>
                <div className="flex flex-col gap-2">
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[#333] text-xs w-5 text-right shrink-0">{idx + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...checklistItems]
                          updated[idx] = e.target.value
                          setChecklistItems(updated)
                        }}
                        placeholder={`e.g. Trend confirmed on H4`}
                        className="input flex-1 !min-h-0 h-10 !py-2.5 !text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setChecklistItems(checklistItems.filter((_, i) => i !== idx))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#333] hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setChecklistItems([...checklistItems, ''])}
                    className="flex items-center gap-2 text-xs text-[#444] hover:text-white transition-colors mt-1 self-start"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={checklistLoading} className="btn-blue gap-2 self-start">
                  {checklistLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {checklistLoading ? 'Saving…' : 'Save Checklist'}
                </button>
                {checklistSaved && <span className="text-emerald-400 text-xs font-medium">✓ Saved</span>}
              </div>
              <p className="text-[10px] text-[#333] font-light">
                This checklist will appear when logging trades. Check off each item before entering.
              </p>
            </form>
          )}
        </SectionCard>

        {/* DMFX Branding */}
        <p className="text-center text-[#333] text-[11px] font-light pt-2 pb-4">
          KoveFX by <span className="text-[#444]">DMFX</span> · Trading ecosystem
        </p>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-8">
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
