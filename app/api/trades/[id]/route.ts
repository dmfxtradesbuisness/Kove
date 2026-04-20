import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
  } = body

  const { data, error } = await supabase
    .from('trades')
    .update({
      pair: pair?.toUpperCase(),
      type,
      outcome: outcome !== undefined ? outcome ?? null : undefined,
      entry_price: entry_price ? parseFloat(entry_price) : undefined,
      exit_price: exit_price !== undefined ? (exit_price ? parseFloat(exit_price) : null) : undefined,
      stop_loss: stop_loss !== undefined ? (stop_loss ? parseFloat(stop_loss) : null) : undefined,
      take_profit: take_profit !== undefined ? (take_profit ? parseFloat(take_profit) : null) : undefined,
      lot_size: lot_size !== undefined ? (lot_size ? parseFloat(lot_size) : null) : undefined,
      pnl: pnl !== undefined ? (pnl ? parseFloat(pnl) : null) : undefined,
      notes: notes !== undefined ? notes || null : undefined,
      screenshot_url: screenshot_url !== undefined ? screenshot_url || null : undefined,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ trade: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
