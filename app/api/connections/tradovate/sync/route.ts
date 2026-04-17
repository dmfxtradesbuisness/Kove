import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncTrades } from '@/lib/tradovate'
import { getValidTradovateToken } from '@/lib/tradovate-token'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Get valid token
  const session = await getValidTradovateToken(user.id)
  if (!session) {
    return NextResponse.json({ error: 'Tradovate not connected. Please sign in again.' }, { status: 401 })
  }

  // Get last sync time to fetch only new trades
  const { data: conn } = await admin
    .from('broker_connections')
    .select('last_sync')
    .eq('user_id', user.id)
    .eq('broker', 'tradovate')
    .single()

  const since = conn?.last_sync ?? undefined

  // Fetch and match trades
  let trades
  try {
    trades = await syncTrades(session.token, session.isDemo, since)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // Token likely expired — mark as disconnected
    if (msg.includes('401') || msg.includes('403')) {
      await admin
        .from('broker_connections')
        .update({ connected: false })
        .eq('user_id', user.id)
        .eq('broker', 'tradovate')
      return NextResponse.json({ error: 'Tradovate session expired. Please sign in again.' }, { status: 401 })
    }
    return NextResponse.json({ error: `Sync failed: ${msg}` }, { status: 500 })
  }

  // Insert closed trades into journal
  let inserted = 0
  if (trades.length > 0) {
    const rows = trades.map((t) => ({
      user_id: user.id,
      pair: t.pair,
      type: t.type,
      outcome: t.outcome,
      entry_price: t.entry_price,
      exit_price: t.exit_price,
      lot_size: t.lot_size,
      pnl: t.pnl,
      source: 'broker',
      external_id: t.external_id,
      created_at: t.opened_at,
    }))

    for (let i = 0; i < rows.length; i += 50) {
      const { error } = await admin
        .from('trades')
        .upsert(rows.slice(i, i + 50), { onConflict: 'user_id,external_id' })
      if (!error) inserted += Math.min(50, rows.length - i)
    }
  }

  // Update last_sync
  await admin
    .from('broker_connections')
    .update({ last_sync: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('broker', 'tradovate')

  return NextResponse.json({ synced: inserted, total: trades.length })
}
