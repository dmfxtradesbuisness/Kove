import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const journalId = request.nextUrl.searchParams.get('journal_id')

  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (journalId) {
    query = query.eq('journal_id', journalId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ trades: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const {
    pair,
    type,
    outcome,
    entry_price,
    exit_price,
    stop_loss,
    take_profit,
    lot_size,
    pnl,
    notes,
    screenshot_url,
    journal_id,
  } = body

  if (!pair || !type || !entry_price) {
    return NextResponse.json(
      { error: 'pair, type, and entry_price are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: user.id,
      journal_id: journal_id || null,
      pair: pair.toUpperCase(),
      type,
      outcome: outcome ?? null,
      entry_price: parseFloat(entry_price) || null,
      exit_price: exit_price ? parseFloat(exit_price) : null,
      stop_loss: stop_loss ? parseFloat(stop_loss) : null,
      take_profit: take_profit ? parseFloat(take_profit) : null,
      lot_size: lot_size ? parseFloat(lot_size) : null,
      pnl: pnl ? parseFloat(pnl) : null,
      notes: notes || null,
      screenshot_url: screenshot_url || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ trade: data }, { status: 201 })
}
