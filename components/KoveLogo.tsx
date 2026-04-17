'use client'

import { useId } from 'react'

/**
 * KoveFX "K" brand mark — 3 diagonal parallelogram bars forming a geometric K.
 * Matches the brand kit's emblem design.
 */
export default function KoveLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  const uid    = useId().replace(/:/g, '')
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
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${glowId})`}>
        {/* Spine — full-height diagonal bar */}
        <polygon points="7,72 21,72 27,8 13,8" fill="white" />
        {/* Upper arm */}
        <polygon points="37,46 51,46 57,8 43,8" fill="white" />
        {/* Lower arm */}
        <polygon points="37,74 51,74 57,50 43,50" fill="white" />
      </g>
    </svg>
  )
}

/**
 * KoveFX horizontal wordmark lockup:
 * [K mark] | [KOVE text]
 * Matches the brand kit's "Secondary Logo — Wordmark Lockup".
 */
export function KoveWordmark({ height = 36, className = '' }: { height?: number; className?: string }) {
  const uid    = useId().replace(/:/g, '')
  const glowId = `wglow-${uid}`

  // K mark is 70×80 viewbox → rendered at height * (70/80)
  const iconH  = height
  const iconW  = Math.round(height * 0.875)   // 70/80
  const scale  = height / 80

  const divX   = iconW + Math.round(height * 0.45)
  const textX  = divX + Math.round(height * 0.38)
  const fs     = Math.round(height * 0.68)    // font-size
  const ls     = Math.round(fs * 0.18)        // letter-spacing
  // Approximate "KOVE" text width (4 chars × ~0.7em + trailing spacing)
  const textW  = Math.round(fs * 4 * 0.62 + ls * 4)
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
        <filter id={glowId} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── K mark (scaled) ── */}
      <g transform={`scale(${scale})`} filter={`url(#${glowId})`}>
        <polygon points="7,72 21,72 27,8 13,8" fill="white" />
        <polygon points="37,46 51,46 57,8 43,8" fill="white" />
        <polygon points="37,74 51,74 57,50 43,50" fill="white" />
      </g>

      {/* ── Thin vertical divider ── */}
      <line
        x1={divX} y1={height * 0.14}
        x2={divX} y2={height * 0.86}
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1"
      />

      {/* ── KOVE wordmark text ── */}
      <text
        x={textX}
        y={height * 0.76}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize={fs}
        letterSpacing={ls}
        fill="white"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        KOVE
      </text>
    </svg>
  )
}
