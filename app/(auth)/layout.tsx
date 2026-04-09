export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden px-4 py-10">
      {/* Atmospheric glow blobs — matching reference */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-40"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-5%] right-[-10%] w-[500px] h-[400px] rounded-full blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[60%] left-[-5%] w-[400px] h-[300px] rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px]">
        {children}
      </div>
    </div>
  )
}
