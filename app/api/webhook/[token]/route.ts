import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/webhook/[token]
 *
 * Receives a closed trade from an external source (MT4/MT5 EA, automation tool, etc.)
 * and upserts it into the user's journal.
 *
 * Body (all fields optional except pair + type):
 * {
 *   pair:         string   e.g. "EURUSD" or "EUR/USD"
 *   type:         "BUY" | "SELL" | "buy" | "sell"
 *   entry_price:  number
 *   exit_price:   number
 *   stop_loss:    number
 *   take_profit:  number
 *   lot_size:     number
 *   pnl:          number   (positive = profit, negative = loss)
 *   external_id:  string   unique ID from broker to prevent duplicates (e.g. ticket number)
 *   opened_at:    ISO string  (used as created_at if provided)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const admin = createAdminClient()

    // Find the user by webhook token
    const { data: prefs, error: prefErr } = await admin
      .from('user_preferences')
      .select('user_id')
      .eq('webhook_token', token)
      .single()

    if (prefErr || !prefs) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = prefs.user_id

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const {
      pair,
      type,
      entry_price,
      exit_price,
      stop_loss,
      take_profit,
      lot_size,
      pnl,
      external_id,
      opened_at,
    } = body as Record<string, unknown>

    if (!pair || typeof pair !== 'string') {
      return NextResponse.json({ error: 'pair is required' }, { status: 400 })
    }
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'type is required' }, { status: 400 })
    }

    // Normalize pair (EURUSD → EUR/USD for common 6-char forex pairs)
    const pairStr = (pair as string).toUpperCase()
    const normalizedPair = pairStr.includes('/')
      ? pairStr
      : pairStr.length === 6
        ? `${pairStr.slice(0, 3)}/${pairStr.slice(3)}`
        : pairStr

    // Normalize type
    const typeStr = (type as string).toUpperCase()
    const normalizedType: 'BUY' | 'SELL' = typeStr === 'SELL' || typeStr === 'SHORT' ? 'SELL' : 'BUY'

    // Determine outcome from pnl
    let outcome: string | null = null
    if (typeof pnl === 'number') {
      outcome = pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven'
    }

    const tradeRow: Record<string, unknown> = {
      user_id: userId,
      pair: normalizedPair,
      type: normalizedType,
      outcome,
      entry_price: typeof entry_price === 'number' ? entry_price : null,
      exit_price: typeof exit_price === 'number' ? exit_price : null,
      stop_loss: typeof stop_loss === 'number' ? stop_loss : null,
      take_profit: typeof take_profit === 'number' ? take_profit : null,
      lot_size: typeof lot_size === 'number' ? lot_size : null,
      pnl: typeof pnl === 'number' ? pnl : null,
      source: 'broker',
      external_id: external_id ? String(external_id) : null,
    }

    if (opened_at && typeof opened_at === 'string') {
      tradeRow.created_at = opened_at
    }

    // Upsert — if external_id exists, update rather than duplicate
    let result
    if (tradeRow.external_id) {
      const { data, error } = await admin
        .from('trades')
        .upsert(tradeRow, { onConflict: 'user_id,external_id' })
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      result = data
    } else {
      const { data, error } = await admin
        .from('trades')
        .insert(tradeRow)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      result = data
    }

    return NextResponse.json({ success: true, trade_id: result.id })
  } catch (err) {
    console.error('[webhook/trade]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
