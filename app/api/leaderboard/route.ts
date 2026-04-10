import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Fetch all trades (admin bypass RLS to get all users)
  const { data: allTrades } = await admin
    .from('trades')
    .select('user_id, pnl, created_at, stop_loss')

  if (!allTrades || allTrades.length === 0) {
    return NextResponse.json({ leaderboard: [], userRank: null })
  }

  // Group by user_id and compute stats
  const userMap: Record<string, { pnl: number; wins: number; closed: number; total: number }> = {}

  for (const t of allTrades) {
    if (!userMap[t.user_id]) {
      userMap[t.user_id] = { pnl: 0, wins: 0, closed: 0, total: 0 }
    }
    userMap[t.user_id].total++
    if (t.pnl !== null) {
      userMap[t.user_id].closed++
      userMap[t.user_id].pnl += t.pnl
      if (t.pnl > 0) userMap[t.user_id].wins++
    }
  }

  // Build ranked list — only users with ≥5 closed trades
  const ranked = Object.entries(userMap)
    .filter(([, s]) => s.closed >= 5)
    .map(([uid, s]) => ({
      uid,
      winRate: s.closed > 0 ? Math.round((s.wins / s.closed) * 100) : 0,
      totalPnl: Math.round(s.pnl * 100) / 100,
      totalTrades: s.total,
      closedTrades: s.closed,
    }))
    .sort((a, b) => b.winRate - a.winRate || b.totalPnl - a.totalPnl)

  // Map to anonymous output — replace uid with rank label
  const leaderboard = ranked.map((entry, i) => ({
    rank: i + 1,
    label: `Trader #${i + 1}`,
    winRate: entry.winRate,
    totalPnl: entry.totalPnl,
    totalTrades: entry.totalTrades,
    isYou: entry.uid === user.id,
  }))

  const userRank = leaderboard.find((e) => e.isYou)?.rank ?? null

  return NextResponse.json({ leaderboard, userRank })
}
