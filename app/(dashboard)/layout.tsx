import Sidebar from '@/components/Sidebar'
import { JournalProvider } from '@/lib/journal-context'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!prefs?.onboarding_completed) redirect('/onboarding')

  return (
    <JournalProvider>
      <div className="flex min-h-screen" style={{ background: 'var(--base)' }}>
        <Sidebar />
        <main
          className="flex-1 md:ml-[220px] min-h-screen pt-14 md:pt-0"
          style={{ background: 'var(--base)' }}
        >
          {children}
        </main>
      </div>
    </JournalProvider>
  )
}
