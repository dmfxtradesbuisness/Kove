import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VALID_TYPES = ['buy', 'sell', 'long', 'short', 'BUY', 'SELL', 'LONG', 'SHORT']
const VALID_OUTCOMES = ['win', 'loss', 'breakeven', null, undefined]

function safeFloat(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = parseFloat(String(value))
  return isFinite(n) ? n : null
}

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
  if (error) {
    console.error('GET /api/trades error:', error)
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
  }

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

  if (!pair || typeof pair !== 'string' || pair.trim().length === 0) {
    return NextResponse.json({ error: 'pair is required' }, { status: 400 })
  }
  if (!type || !VALID_TYPES.includes(String(type).toUpperCase()) && !VALID_TYPES.includes(String(type).toLowerCase())) {
    return NextResponse.json({ error: 'type must be BUY or SELL' }, { status: 400 })
  }
  if (outcome !== undefined && outcome !== null && !VALID_OUTCOMES.includes(outcome)) {
    return NextResponse.json({ error: 'Invalid outcome value' }, { status: 400 })
  }
  if (!entry_price) {
    return NextResponse.json({ error: 'entry_price is required' }, { status: 400 })
  }
  const parsedEntry = safeFloat(entry_price)
  if (parsedEntry === null || parsedEntry <= 0) {
    return NextResponse.json({ error: 'entry_price must be a positive number' }, { status: 400 })
  }
  if (pair.trim().length > 20) {
    return NextResponse.json({ error: 'pair exceeds maximum length' }, { status: 400 })
  }
  if (notes && typeof notes === 'string' && notes.length > 5000) {
    return NextResponse.json({ error: 'notes exceeds maximum length' }, { status: 400 })
  }
  if (screenshot_url && typeof screenshot_url === 'string' && screenshot_url.length > 2048) {
    return NextResponse.json({ error: 'screenshot_url exceeds maximum length' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: user.id,
      journal_id: journal_id || null,
      pair: pair.trim().toUpperCase(),
      type: String(type).toUpperCase(),
      outcome: outcome ?? null,
      entry_price: parsedEntry,
      exit_price: safeFloat(exit_price),
      stop_loss: safeFloat(stop_loss),
      take_profit: safeFloat(take_profit),
      lot_size: safeFloat(lot_size),
      pnl: safeFloat(pnl),
      notes: notes || null,
      screenshot_url: screenshot_url || null,
    })
    .select()
    .single()

  if (error) {
    console.error('POST /api/trades error:', error)
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 })
  }

  // Update streak
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('trading_streak, last_logged_date')
    .eq('user_id', user.id)
    .maybeSingle()

  const lastDate  = prefs?.last_logged_date
  const curStreak = prefs?.trading_streak ?? 0
  const newStreak =
    lastDate === today     ? curStreak :          // already logged today
    lastDate === yesterday ? curStreak + 1 :      // consecutive day
    1                                             // reset

  if (lastDate !== today) {
    await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, trading_streak: newStreak, last_logged_date: today }, { onConflict: 'user_id' })
  }

  return NextResponse.json({ trade: data, streak: newStreak }, { status: 201 })
}
