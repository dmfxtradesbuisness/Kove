import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/checklist/results?trade_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tradeId = request.nextUrl.searchParams.get('trade_id')
  if (!tradeId) return NextResponse.json({ results: [] })

  const { data } = await supabase
    .from('trade_checklist_results')
    .select('checklist_item_id, checked')
    .eq('trade_id', tradeId)
    .eq('user_id', user.id)

  return NextResponse.json({ results: data ?? [] })
}

// POST /api/checklist/results — save checklist results for a trade
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { trade_id, results } = body as {
    trade_id: string
    results: { checklist_item_id: string; checked: boolean }[]
  }

  if (!trade_id || !results) {
    return NextResponse.json({ error: 'trade_id and results required' }, { status: 400 })
  }

  // Delete existing results for this trade
  await supabase
    .from('trade_checklist_results')
    .delete()
    .eq('trade_id', trade_id)
    .eq('user_id', user.id)

  if (results.length > 0) {
    const rows = results.map((r) => ({
      trade_id,
      checklist_item_id: r.checklist_item_id,
      user_id: user.id,
      checked: r.checked,
    }))
    const { error } = await supabase.from('trade_checklist_results').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
