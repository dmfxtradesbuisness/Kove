'use client'

import { useId } from 'react'

/**
 * KoveFX "K" brand mark — 3 diagonal parallelogram bars with blue/cyan gradient glow.
 */
export default function KoveLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  const uid    = useId().replace(/:/g, '')
  const gradId = `kgrad-${uid}`
  const glowId = `kglow-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 70 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kove"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="70" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#EAF4FF" />
          <stop offset="35%" stopColor="#6DB4FF" />
          <stop offset="70%" stopColor="#1E6EFF" />
          <stop offset="100%" stopColor="#0A3FCC" />
        </linearGradient>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${glowId})`}>
        <polygon points="7,72 21,72 27,8 13,8"   fill={`url(#${gradId})`} />
        <polygon points="37,46 51,46 57,8 43,8"  fill={`url(#${gradId})`} />
        <polygon points="37,74 51,74 57,50 43,50" fill={`url(#${gradId})`} />
      </g>
    </svg>
  )
}

/**
 * KoveFX horizontal wordmark lockup: [K mark] + [KOVE text]
 * Thin, wide-tracked KOVE with gradient K.
 */
export function KoveWordmark({ height = 36, className = '' }: { height?: number; className?: string }) {
  const uid    = useId().replace(/:/g, '')
  const gradId = `wgrad-${uid}`
  const glowId = `wglow-${uid}`

  // K mark scaling (source viewbox 70×80)
  const iconW = Math.round(height * 0.875)
  const scale = height / 80

  const gap    = Math.round(height * 0.42)
  const textX  = iconW + gap
  const fs     = Math.round(height * 0.58)          // font-size for KOVE
  const ls     = Math.round(fs * 0.34)              // wide letter-spacing
  // Approximate "KOVE" width (4 chars × ~0.62em + 3 gaps of ls)
  const textW  = Math.round(fs * 4 * 0.62 + ls * 3.5)
  const totalW = textX + textW

  return (
    <svg
      width={totalW}
      height={height}
      viewBox={`0 0 ${totalW} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="KoveFX"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="70" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#EAF4FF" />
          <stop offset="35%" stopColor="#6DB4FF" />
          <stop offset="70%" stopColor="#1E6EFF" />
          <stop offset="100%" stopColor="#0A3FCC" />
        </linearGradient>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── K mark (scaled, gradient) ── */}
      <g transform={`scale(${scale})`} filter={`url(#${glowId})`}>
        <polygon points="7,72 21,72 27,8 13,8"    fill={`url(#${gradId})`} />
        <polygon points="37,46 51,46 57,8 43,8"   fill={`url(#${gradId})`} />
        <polygon points="37,74 51,74 57,50 43,50" fill={`url(#${gradId})`} />
      </g>

      {/* ── KOVE wordmark — thin, wide-tracked ── */}
      <text
        x={textX}
        y={height * 0.72}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="300"
        fontSize={fs}
        letterSpacing={ls}
        fill="#ffffff"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        KOVE
      </text>
    </svg>
  )
}
