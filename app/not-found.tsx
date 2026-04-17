import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found | KoveFX',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: '#080808' }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
        }}
      />

      {/* Violet orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 480,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 40%, rgba(29,78,216,0.35) 0%, rgba(70,50,180,0.12) 45%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative z-10 text-center flex flex-col items-center gap-6 animate-fade-in">
        {/* 404 number */}
        <div style={{ position: 'relative' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(6rem, 20vw, 10rem)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              userSelect: 'none',
            }}
          >
            404
          </span>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(6rem, 20vw, 10rem)',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(29,78,216,0.3)',
              }}
            >
              404
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '-0.02em',
            }}
          >
            Page not found
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'rgba(255,255,255,0.3)',
              lineHeight: 1.6,
              maxWidth: 320,
            }}
          >
            This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link href="/journal" className="btn-blue gap-2">
            Go to Journal
          </Link>
          <Link href="/" className="btn-secondary gap-2">
            Back to Home
          </Link>
        </div>

        {/* KoveFX mark */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 11,
            color: 'rgba(255,255,255,0.12)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginTop: 8,
          }}
        >
          KoveFX
        </p>
      </div>
    </div>
  )
}
