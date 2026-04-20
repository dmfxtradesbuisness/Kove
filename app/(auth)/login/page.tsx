'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { KoveWordmark } from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function OAuthDivider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
        or continue with
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error,        setError]        = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/journal')
    router.refresh()
  }

  async function handleGoogleOAuth() {
    setOauthLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setError(error.message)
      setOauthLoading(false)
    }
  }

  return (
    <div className="auth-card animate-scale-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-0 flex items-center justify-between">
        <KoveWordmark height={26} />
        <Link
          href="/signup"
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#fff'; ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          Create account
        </Link>
      </div>

      {/* Title */}
      <div className="px-8 pt-7 pb-1">
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '-0.02em' }}>
          Sign in
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)' }}>
          Welcome back to your trading journal.
        </p>
      </div>

      <div className="px-8 pt-5 pb-8 flex flex-col gap-4">

        {/* ── Google OAuth ── */}
        <button
          type="button"
          onClick={handleGoogleOAuth}
          disabled={loading || oauthLoading}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'var(--font-display)',
            cursor: loading || oauthLoading ? 'not-allowed' : 'pointer',
            opacity: loading || oauthLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => { if (!loading && !oauthLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
        >
          {oauthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <OAuthDivider />

        {/* ── Email / password form ── */}
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
            <div className="flex items-center justify-between">
              <label className="label">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] transition-colors"
                style={{ fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#3B82F6' }}
                onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)' }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="input pr-11"
                required
                autoComplete="current-password"
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

          {error && (
            <div className="text-sm px-4 py-3 rounded-lg" style={{ color: '#F87171', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)', fontFamily: 'var(--font-body)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || oauthLoading} className="btn-blue gap-2 w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign in with email
          </button>
        </form>

        <div className="text-center text-xs" style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.25)' }}>
          No account?{' '}
          <Link href="/signup" className="transition-colors" style={{ color: '#3B82F6' }}
            onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#60A5FA' }}
            onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.color = '#3B82F6' }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  )
}
