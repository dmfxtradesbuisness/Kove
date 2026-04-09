'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, TrendingUp } from 'lucide-react'
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
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/journal` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (!signInError) {
      router.push('/journal')
      router.refresh()
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="auth-card p-10 text-center animate-scale-in">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-emerald-400 text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-bold mb-2 text-white">Check your email</h2>
        <p className="text-[#666] text-sm leading-relaxed mb-6">
          We sent a confirmation link to{' '}
          <span className="text-white">{email}</span>.
        </p>
        <Link href="/login" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-card animate-scale-in">
      {/* Logo */}
      <div className="flex justify-center pt-8 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center px-8 pt-5 pb-0 gap-6">
        {/* Inactive: Sign In */}
        <Link href="/login" className="flex flex-col items-start gap-2 group">
          <span className="text-[22px] font-bold text-[#555] tracking-tight group-hover:text-[#888] transition-colors">
            Sign In
          </span>
          <div className="h-[2px] w-full bg-transparent" />
        </Link>

        {/* Active: Join */}
        <div className="flex flex-col items-start gap-2">
          <span className="text-[22px] font-bold text-white tracking-tight cursor-default">
            Join
          </span>
          <div className="h-[2px] w-full bg-blue-500 rounded-full" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 pt-7 pb-8 flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="label">Email</label>
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

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters…"
              className="input pr-12"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-blue mt-1 gap-2 w-full"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Account
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[#444] text-xs font-medium">or continue with</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Social placeholder buttons */}
        <div className="flex items-center justify-center gap-3">
          {[
            { label: 'G', bg: '#1a3a1a', color: '#34d399', title: 'Google' },
            { label: '⌘', bg: '#1a1a1a', color: '#f0f0f0', title: 'Apple' },
            { label: 'X', bg: '#1a1a1a', color: '#f0f0f0', title: 'X' },
          ].map(({ label, bg, color, title }) => (
            <button
              key={title}
              type="button"
              disabled
              title={`${title} (coming soon)`}
              className="w-14 h-12 rounded-2xl flex items-center justify-center text-sm font-bold opacity-50 cursor-not-allowed"
              style={{ background: bg, color }}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-center text-[#444] text-xs">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
