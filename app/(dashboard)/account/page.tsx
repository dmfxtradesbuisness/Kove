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
      const {
        data: { user },
      } = await supabase.auth.getUser()

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
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Account</h1>
        <p className="text-[#555] text-sm mt-1">Manage your profile and subscription</p>
      </div>

      {subscriptionMessage === 'success' && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4 mb-6 text-emerald-400 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          Subscription activated! You now have access to AI insights.
        </div>
      )}
      {subscriptionMessage === 'canceled' && (
        <div className="flex items-center gap-3 bg-[#111] border border-[#1a1a1a] rounded-xl px-5 py-4 mb-6 text-[#888] text-sm">
          <XCircle className="w-5 h-5 flex-shrink-0 text-[#555]" />
          Checkout canceled. No charge was made.
        </div>
      )}

      <div className="max-w-lg flex flex-col gap-5">
        {/* Profile card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-[#888]" />
            </div>
            <h2 className="text-sm font-semibold text-white">Profile</h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label">Email</label>
            <p className="text-sm text-white bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg px-3.5 py-2.5">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Subscription card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Subscription</h2>
          </div>

          {subscription?.active ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm font-semibold text-white">Pro Plan</p>
                  </div>
                  <p className="text-xs text-[#666]">$12/month · AI insights unlocked</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>

              {subscription.current_period_end && (
                <p className="text-xs text-[#555]">
                  Renews on{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}

              <button
                onClick={handleManage}
                disabled={portalLoading}
                className="btn-secondary flex items-center gap-2 self-start"
              >
                {portalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Manage Billing
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Free Plan</p>
                  <p className="text-xs text-[#666]">Trade journal + basic stats</p>
                </div>
                <span className="text-xs font-medium text-[#555] bg-white/5 px-2.5 py-1 rounded-full">
                  {subscription?.status === 'canceled' ? 'Canceled' : 'Free'}
                </span>
              </div>

              <div className="p-4 bg-blue-600/5 border border-blue-500/15 rounded-xl">
                <p className="text-sm font-semibold text-white mb-1">Upgrade to Pro</p>
                <p className="text-xs text-[#666] mb-4 leading-relaxed">
                  Get AI-powered trade analysis, mistake identification, and pattern detection for $12/month.
                </p>
                <button
                  onClick={handleUpgrade}
                  disabled={checkoutLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {checkoutLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Sparkles className="w-3.5 h-3.5" />
                  Upgrade — $12/month
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 mt-3">
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
    <div className="p-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <AccountContent />
      </Suspense>
    </div>
  )
}
