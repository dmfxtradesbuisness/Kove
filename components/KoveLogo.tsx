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
 * KoveFX full wordmark — "Kove" in white outline style + "FX" in violet gradient
 * Matches the provided brand image exactly.
 * Usage: <KoveWordmark height={36} />
 */
export function KoveWordmark({ height = 36, className = '' }: { height?: number; className?: string }) {
  // Aspect ratio of the wordmark: ~3.6:1
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
        {/* Violet gradient for FX */}
        <linearGradient id="fxGrad" x1="118" y1="8" x2="216" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7B6CF5" />
          <stop offset="100%" stopColor="#5C4ED4" />
        </linearGradient>
        {/* Subtle white glow filter for Kove outline text */}
        <filter id="glow" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── "Kove" — outline/ghost style in white ── */}
      <text
        x="2"
        y="50"
        fontFamily="Space Grotesk, system-ui, sans-serif"
        fontWeight="800"
        fontSize="52"
        letterSpacing="-2"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.2"
        filter="url(#glow)"
      >
        Kove
      </text>

      {/* ── "FX" — solid violet gradient ── */}
      <text
        x="116"
        y="50"
        fontFamily="Space Grotesk, system-ui, sans-serif"
        fontWeight="800"
        fontSize="52"
        letterSpacing="-2"
        fill="url(#fxGrad)"
      >
        FX
      </text>
    </svg>
  )
}
