import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const journalId = request.nextUrl.searchParams.get('journal_id')

  let query = supabase
    .from('trades')
    .select('id, pair, type, pnl, screenshot_url, created_at, notes, journal_id')
    .eq('user_id', user.id)
    .not('screenshot_url', 'is', null)
    .order('created_at', { ascending: false })

  if (journalId) {
    query = query.eq('journal_id', journalId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ trades: data })
}
