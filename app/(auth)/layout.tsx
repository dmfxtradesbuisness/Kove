export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12"
      style={{ background: '#080808' }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
        }}
      />

      {/* Gradient orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 40%,
            rgba(37,99,235,0.55) 0%,
            rgba(90,60,200,0.28) 35%,
            rgba(50,30,130,0.1) 60%,
            transparent 80%)`,
          filter: 'blur(50px)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {children}
      </div>
    </div>
  )
}
