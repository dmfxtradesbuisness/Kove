/**
 * KoveFX brand mark — custom "K" lettermark SVG
 * Usage: <KoveLogo size={28} />
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
      {/* Rounded square bg — rendered by parent via wrapper div for color flexibility */}
      {/* Lettermark K */}
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
