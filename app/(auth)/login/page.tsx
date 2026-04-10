'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import KoveLogo from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
          href="/signup"
          className="text-xs font-medium px-3 py-1.5 rounded-md transition-all"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-3)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          Create account
        </Link>
      </div>

      {/* Title */}
      <div className="px-8 pt-7 pb-1">
        <h1 className="text-xl font-semibold mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
          Sign in
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          Welcome back to your trading journal.
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
          <div className="flex items-center justify-between">
            <label className="label">Password</label>
            <Link
              href="/forgot-password"
              className="text-[11px] transition-colors"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-3)' }}
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
              fontFamily: 'var(--font-body)',
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-blue mt-1 gap-2 w-full">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign in
        </button>

        <div
          className="text-center text-xs pt-1"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-3)' }}
        >
          No account?{' '}
          <Link href="/signup" className="transition-colors" style={{ color: '#60A5FA' }}>
            Create one free
          </Link>
        </div>
      </form>
    </div>
  )
}
