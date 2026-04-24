'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { KoveWordmark } from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
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
          Good to have you back.
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

          <button type="submit" disabled={loading} className="btn-blue gap-2 w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign in
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
