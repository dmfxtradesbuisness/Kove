import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ active: false, status: 'unauthenticated' })
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('subscription_status, current_period_end')
    .eq('user_id', user.id)
    .single()

  const active = subscription?.subscription_status === 'active'

  return NextResponse.json({
    active,
    status: subscription?.subscription_status ?? 'inactive',
    current_period_end: subscription?.current_period_end ?? null,
  })
}
