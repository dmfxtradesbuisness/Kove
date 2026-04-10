'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import KoveLogo from '@/components/KoveLogo'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)

    // Redirect to journal after short delay
    setTimeout(() => router.push('/journal'), 2000)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#080808' }}
    >
      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.35) 0%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div
        className="relative w-full max-w-[420px] bg-[#0e0e0e] border border-white/[0.07] rounded-3xl animate-scale-in"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8)' }}
      >
        {done ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-emerald-400 text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Password updated</h2>
            <p className="text-[#555] text-sm font-light">
              Redirecting you to your journal…
            </p>
          </div>
        ) : (
          <>
            {/* Logo */}
            <div className="flex justify-center pt-8 pb-2">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: '0 2px 6px rgba(37,99,235,0.35)' }}>
                <KoveLogo size={20} />
              </div>
            </div>

            <div className="px-8 pt-6 pb-0">
              <h1 className="text-[22px] font-bold text-white tracking-tight mb-1">New password</h1>
              <div className="h-[2px] w-16 bg-blue-500 rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="label">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters…"
                    className="input pr-12"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password…"
                  className="input"
                  required
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
                Update Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
