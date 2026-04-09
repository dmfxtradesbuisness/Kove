import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      {/* Desktop: offset left for sidebar | Mobile: offset top for header + bottom for nav */}
      <main className="flex-1 md:ml-[220px] min-h-screen pt-14 md:pt-0 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
