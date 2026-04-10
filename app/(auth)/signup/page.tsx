'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import KoveLogo from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?type=signup` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (!signInError) { router.push('/journal'); router.refresh(); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="auth-card p-10 text-center animate-scale-in">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
        >
          <span className="text-xl">✓</span>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>
          Check your email
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-2)' }}>
          Confirmation sent to <span style={{ color: 'var(--text-1)' }}>{email}</span>.
        </p>
        <Link href="/login" className="text-sm transition-colors" style={{ color: '#60A5FA', fontFamily: 'var(--font-display)' }}>
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-card animate-scale-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}
          >
            <KoveLogo size={20} />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>
            KoveFX
          </span>
        </div>
        <Link
          href="/login"
          className="text-xs font-medium px-3 py-1.5 rounded-md transition-all"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-3)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          Sign in
        </Link>
      </div>

      {/* Title */}
      <div className="px-8 pt-7 pb-1">
        <h1 className="text-xl font-semibold mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
          Create account
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          Your trading journal. Free to start.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="input pr-11"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-3)' }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-lg"
            style={{
              color: '#F87171',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.18)',
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-blue mt-1 gap-2 w-full">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create account
        </button>

        <p className="text-center text-[11px]" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-body)' }}>
          By signing up you agree to our terms of service.
        </p>

        <div className="text-center text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link href="/login" className="transition-colors" style={{ color: '#60A5FA' }}>
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
