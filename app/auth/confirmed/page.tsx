import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export default function ConfirmedPage() {
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
        className="relative w-full max-w-[400px] bg-[#0e0e0e] border border-white/[0.07] rounded-3xl p-10 text-center animate-scale-in"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8)' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Success icon */}
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-emerald-400 text-2xl">✓</span>
        </div>

        <h1 className="text-xl font-bold text-white mb-2 tracking-tight">
          Account verified
        </h1>
        <p className="text-[#555] text-sm font-light leading-relaxed mb-8">
          Your email has been successfully confirmed.
          You can now sign in to your KoveFX account.
        </p>

        <Link
          href="/login"
          className="btn-blue w-full flex items-center justify-center"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  )
}
