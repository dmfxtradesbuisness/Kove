import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const journalId = request.nextUrl.searchParams.get('journal_id')

  let query = supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)

  if (journalId) {
    query = query.eq('journal_id', journalId)
  } else {
    query = query.is('journal_id', null)
  }

  const { data } = await query.single()
  return NextResponse.json({ goals: data ?? null })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { monthly_pnl_target, win_rate_target, max_drawdown_target, notes, journal_id } = body

  const { data, error } = await supabase
    .from('goals')
    .upsert({
      user_id: user.id,
      journal_id: journal_id ?? null,
      monthly_pnl_target: monthly_pnl_target ? Number(monthly_pnl_target) : null,
      win_rate_target: win_rate_target ? Number(win_rate_target) : null,
      max_drawdown_target: max_drawdown_target ? Number(max_drawdown_target) : null,
      notes: notes ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,journal_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ goals: data })
}
