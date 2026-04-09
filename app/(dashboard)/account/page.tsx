'use client'

import { Suspense, useState, useEffect } from 'react'
import { User, CreditCard, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

interface SubscriptionInfo {
  status: string
  current_period_end: string | null
  active: boolean
}

function AccountContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [userEmail, setUserEmail] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState('')

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
      if (data.url) window.location.href = data.url
      else throw new Error('No checkout URL')
    } catch {
      setError('Failed to start checkout. Try again.')
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
        {/* Profile */}
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-white/[0.04] border border-white/[0.06] rounded-2xl flex items-center justify-center">
              <User className="w-4 h-4 text-[#555]" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">Profile</h2>
          </div>
          <div className="flex flex-col gap-2">
            <label className="label">Email address</label>
            <p className="text-sm text-[#888] bg-[#080808] border border-white/[0.05] rounded-2xl px-4 py-3.5 font-light">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-6 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-blue-500/8 border border-blue-500/15 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-400/70" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">Subscription</h2>
          </div>

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

              <div className="p-5 bg-blue-600/4 border border-blue-500/12 rounded-2xl">
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
        </div>
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
