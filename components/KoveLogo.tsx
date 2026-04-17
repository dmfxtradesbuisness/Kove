'use client'

import { useId } from 'react'

/**
 * KoveFX brand mark — "K" lettermark only (used in icon contexts, sidebar square, favicon wrapper)
 * For the full wordmark use <KoveWordmark />
 */
export default function KoveLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="KoveFX"
    >
      <path
        d="M9 7.5V20.5M9 14.2L18.5 7.5M9 14.2L19 20.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * KoveFX full wordmark — "Kove" in white + "FX" in blue gradient with depth
 * Usage: <KoveWordmark height={36} />
 */
export function KoveWordmark({ height = 36, className = '' }: { height?: number; className?: string }) {
  const uid = useId().replace(/:/g, '')
  const gradId   = `fxGrad-${uid}`
  const glowId   = `glow-${uid}`
  const depthId  = `depth-${uid}`
  const shineId  = `shine-${uid}`

  const width = Math.round(height * 3.6)
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 216 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="KoveFX"
    >
      <defs>
        {/* Blue gradient for FX */}
        <linearGradient id={gradId} x1="118" y1="4" x2="216" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Depth/glow filter — creates dimensional look */}
        <filter id={depthId} x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1D4ED8" floodOpacity="0.7" />
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.5" />
        </filter>

        {/* Subtle glow for Kove text */}
        <filter id={glowId} x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.8" />
          <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#fff" floodOpacity="0.08" />
        </filter>

        {/* Shine overlay gradient */}
        <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
          <stop offset="45%"  stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>

      {/* ── "Kove" — white with subtle depth shadow ── */}
      <text
        x="2"
        y="50"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="52"
        letterSpacing="-2"
        fill="rgba(255,255,255,0.95)"
        filter={`url(#${glowId})`}
      >
        Kove
      </text>

      {/* ── "FX" shadow layer (depth illusion) ── */}
      <text
        x="118"
        y="53"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="52"
        letterSpacing="-2"
        fill="rgba(15,40,120,0.6)"
      >
        FX
      </text>

      {/* ── "FX" — blue gradient with depth filter ── */}
      <text
        x="116"
        y="50"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="52"
        letterSpacing="-2"
        fill={`url(#${gradId})`}
        filter={`url(#${depthId})`}
      >
        FX
      </text>

      {/* ── Shine highlight on FX ── */}
      <text
        x="116"
        y="50"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="52"
        letterSpacing="-2"
        fill={`url(#${shineId})`}
        style={{ mixBlendMode: 'overlay' }}
      >
        FX
      </text>
    </svg>
  )
}
