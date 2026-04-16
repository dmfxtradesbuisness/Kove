import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_preferences')
    .select('dashboard_widgets, journal_fields, account_balance')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ preferences: data ?? null })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { dashboard_widgets, journal_fields, account_balance } = body

  const updateObj: Record<string, unknown> = { user_id: user.id }
  if (dashboard_widgets !== undefined) updateObj.dashboard_widgets = dashboard_widgets
  if (journal_fields !== undefined) updateObj.journal_fields = journal_fields
  if (account_balance !== undefined) updateObj.account_balance = account_balance === '' ? null : Number(account_balance)

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(updateObj, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ preferences: data })
}
