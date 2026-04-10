export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12"
      style={{ background: 'var(--base)' }}
    >
      {/* Subtle top accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[200px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 75%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {children}
      </div>
    </div>
  )
}
