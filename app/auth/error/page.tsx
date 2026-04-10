'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AlertCircle } from 'lucide-react'
import KoveLogo from '@/components/KoveLogo'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') ?? 'Something went wrong.'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#080808' }}
    >
      {/* Atmospheric glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(ellipse, rgba(239,68,68,0.4) 0%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div
        className="relative w-full max-w-[400px] bg-[#0e0e0e] border border-white/[0.07] rounded-3xl p-10 text-center animate-scale-in"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8)' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}>
            <KoveLogo size={22} />
          </div>
        </div>

        {/* Error icon */}
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2 tracking-tight">
          Link expired or invalid
        </h1>
        <p className="text-[#555] text-sm font-light leading-relaxed mb-3">
          {error}
        </p>
        <p className="text-[#444] text-xs font-light mb-8">
          Confirmation links expire after 24 hours. Request a new one below.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="btn-blue w-full flex items-center justify-center"
          >
            Create New Account
          </Link>
          <Link
            href="/login"
            className="btn-secondary w-full flex items-center justify-center"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
          <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}
