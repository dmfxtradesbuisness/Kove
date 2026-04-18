import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'KoveFX – Free AI Trading Journal'
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
          background: '#030408',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blue radial glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30,110,255,0.18) 0%, transparent 65%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30,110,255,0.08) 0%, transparent 65%)',
          }}
        />

        {/* K mark — geometric polygons */}
        <div style={{ display: 'flex', marginBottom: 36 }}>
          <svg width="72" height="82" viewBox="0 0 70 80" fill="none">
            <polygon points="7,72 21,72 27,8 13,8"    fill="white" />
            <polygon points="37,46 51,46 57,8 43,8"   fill="white" />
            <polygon points="37,74 51,74 57,50 43,50" fill="white" />
          </svg>
        </div>

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <span style={{ fontSize: 72, fontWeight: 300, color: '#ffffff', letterSpacing: '20px' }}>
            KOVE
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.45)',
            textAlign: 'center',
            maxWidth: 680,
            lineHeight: 1.45,
            letterSpacing: '-0.3px',
            marginBottom: 40,
          }}
        >
          Free AI Trading Journal — Log trades, track performance,
          and fix the habits costing you money.
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 12 }}>
          {['Free Forever', 'AI Insights', 'Discipline Score', 'All Markets'].map((f) => (
            <div
              key={f}
              style={{
                background: 'rgba(30,110,255,0.14)',
                border: '1px solid rgba(30,110,255,0.32)',
                borderRadius: 100,
                padding: '9px 20px',
                fontSize: 16,
                color: 'rgba(77,144,255,0.95)',
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
            color: 'rgba(255,255,255,0.18)',
            fontSize: 17,
            letterSpacing: '0.08em',
          }}
        >
          kovefx.com
        </div>
      </div>
    ),
    { ...size }
  )
}
