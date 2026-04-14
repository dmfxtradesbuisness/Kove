import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--base)' }}>
      <Sidebar />
      <main
        className="flex-1 md:ml-[220px] min-h-screen pt-14 md:pt-0"
        style={{ background: 'var(--base)' }}
      >
        {children}
      </main>
    </div>
  )
}
