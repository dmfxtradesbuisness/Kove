import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'KoveFX – AI Trading Journal for Consistent Traders'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #080808 0%, #0f0d28 50%, #0a0820 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background orb */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,93,211,0.35) 0%, transparent 70%)',
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #7B6CF5, #5C4ED4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '0 0 60px rgba(108,93,211,0.6)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
            <path d="M9 7.5V20.5M9 14.2L18.5 7.5M9 14.2L19 20.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
          <span style={{ fontSize: 80, fontWeight: 800, color: 'rgba(255,255,255,0.15)', letterSpacing: '-4px' }}>
            Kove
          </span>
          <span style={{ fontSize: 80, fontWeight: 800, color: '#7B6CF5', letterSpacing: '-4px' }}>
            FX
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            maxWidth: 720,
            lineHeight: 1.4,
            letterSpacing: '-0.5px',
          }}
        >
          AI Trading Journal for Consistent Traders
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {['Pattern Detection', 'Behavioral Analysis', 'Discipline Score', 'AI Coaching'].map((f) => (
            <div
              key={f}
              style={{
                background: 'rgba(108,93,211,0.15)',
                border: '1px solid rgba(108,93,211,0.3)',
                borderRadius: 100,
                padding: '8px 18px',
                fontSize: 16,
                color: 'rgba(180,170,255,0.9)',
                fontWeight: 600,
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            color: 'rgba(255,255,255,0.2)',
            fontSize: 18,
            letterSpacing: '0.05em',
          }}
        >
          kovefx.com
        </div>
      </div>
    ),
    { ...size }
  )
}
