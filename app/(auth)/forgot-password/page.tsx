'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import KoveLogo from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="auth-card p-10 text-center animate-scale-in">
        <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">📬</span>
        </div>
        <h2 className="text-xl font-bold mb-2 text-white tracking-tight">Check your email</h2>
        <p className="text-[#555] text-sm leading-relaxed mb-2 font-light">
          We sent a password reset link to
        </p>
        <p className="text-white text-sm font-medium mb-6">{email}</p>
        <p className="text-[#444] text-xs font-light mb-6">
          The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
        </p>
        <Link href="/login" className="text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center justify-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-card animate-scale-in">
      {/* Logo */}
      <div className="flex justify-center pt-8 pb-2">
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: '0 2px 6px rgba(37,99,235,0.35)' }}>
          <KoveLogo size={20} />
        </div>
      </div>

      <div className="px-8 pt-6 pb-0">
        <h1 className="text-[22px] font-bold text-white tracking-tight mb-1">Reset password</h1>
        <div className="h-[2px] w-16 bg-blue-500 rounded-full mb-0" />
      </div>

      <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 flex flex-col gap-5">
        <p className="text-[#555] text-sm font-light leading-relaxed -mt-1">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <div className="flex flex-col gap-2">
          <label className="label">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hey@example.com"
            className="input"
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 font-light">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-blue mt-1 gap-2 w-full"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Send Reset Link
        </button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-[#444] text-xs hover:text-[#888] transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Sign In
        </Link>
      </form>
    </div>
  )
}
