'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { KoveWordmark } from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [agreedToTos,  setAgreedToTos]  = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreedToTos) {
      setError('Please agree to the Terms of Service to continue.')
      return
    }
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
          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.18)' }}
        >
          <span style={{ fontSize: '20px' }}>✓</span>
        </div>
        <h2 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>
          Check your email
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)' }}>
          Confirmation sent to <span style={{ color: '#fff' }}>{email}</span>.
        </p>
        <Link
          href="/login"
          className="text-sm transition-colors"
          style={{ color: '#3B82F6', fontFamily: 'var(--font-display)' }}
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-card animate-scale-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-0 flex items-center justify-between">
        <KoveWordmark height={26} />
        <Link
          href="/login"
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#fff'; ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          Sign in
        </Link>
      </div>

      {/* Title */}
      <div className="px-8 pt-7 pb-1">
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '-0.02em' }}>
          Create account
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>
          Build your edge. Start free.
        </p>
      </div>

      <div className="px-8 pt-5 pb-8 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.28)', background: 'none', border: 'none', cursor: 'pointer' }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ToS checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none" style={{ marginTop: 2 }}>
            <div
              onClick={() => setAgreedToTos((v) => !v)}
              style={{
                width: 18, height: 18, borderRadius: 5,
                border: `1.5px solid ${agreedToTos ? '#2563EB' : 'rgba(255,255,255,0.2)'}`,
                background: agreedToTos ? '#2563EB' : 'transparent',
                flexShrink: 0, marginTop: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', cursor: 'pointer',
              }}
            >
              {agreedToTos && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
              I have read and agree to the{' '}
              <Link
                href="/terms"
                target="_blank"
                style={{ color: '#3B82F6', textDecoration: 'underline', textUnderlineOffset: 2 }}
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>
            </span>
          </label>

          {error && (
            <div className="text-sm px-4 py-3 rounded-lg" style={{ color: '#F87171', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)', fontFamily: 'var(--font-body)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !agreedToTos}
            className="btn-blue mt-1 gap-2 w-full"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create account
          </button>
        </form>

        <div className="text-center text-xs" style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.25)' }}>
          Already have an account?{' '}
          <Link href="/login" className="transition-colors" style={{ color: '#3B82F6' }}
            onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#60A5FA' }}
            onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#3B82F6' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
