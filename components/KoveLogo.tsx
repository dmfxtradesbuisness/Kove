'use client'

import { useId } from 'react'

/**
 * KoveFX geometric K mark — pure white, matching the brand kit.
 */
export default function KoveLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
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
      <polygon points="7,72 21,72 27,8 13,8"    fill="white" />
      <polygon points="37,46 51,46 57,8 43,8"   fill="white" />
      <polygon points="37,74 51,74 57,50 43,50" fill="white" />
    </svg>
  )
}

/**
 * KoveFX wordmark — geometric K mark + "KOVE" thin wide-tracked text.
 */
export function KoveWordmark({ height = 36, className = '' }: { height?: number; className?: string }) {
  const iconW  = Math.round(height * 0.875)
  const scale  = height / 80
  const gap    = Math.round(height * 0.40)
  const textX  = iconW + gap
  const fs     = Math.round(height * 0.58)
  const ls     = Math.round(fs * 0.32)
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
      <g transform={`scale(${scale})`}>
        <polygon points="7,72 21,72 27,8 13,8"    fill="white" />
        <polygon points="37,46 51,46 57,8 43,8"   fill="white" />
        <polygon points="37,74 51,74 57,50 43,50" fill="white" />
      </g>
      <text
        x={textX}
        y={height * 0.72}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="300"
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
