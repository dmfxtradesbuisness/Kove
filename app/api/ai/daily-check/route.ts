import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface DailyCheckResult {
  todayCount: number
  todayWins: number
  todayLosses: number
  todayPnl: number
  consecutiveLosses: number
  alertLevel: 'green' | 'yellow' | 'red'
  alerts: { type: string; message: string; severity: 'info' | 'warning' | 'danger' }[]
  overtradingThreshold: number   // the N where win rate drops
  avgTradesPerGreenDay: number
  winRateToday: number | null
  winRateOverall: number | null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (!trades || trades.length === 0) {
    return NextResponse.json({
      todayCount: 0, todayWins: 0, todayLosses: 0, todayPnl: 0,
      consecutiveLosses: 0, alertLevel: 'green', alerts: [],
      overtradingThreshold: 3, avgTradesPerGreenDay: 0,
      winRateToday: null, winRateOverall: null,
    } satisfies DailyCheckResult)
  }

  const closed = trades.filter((t) => t.pnl !== null)
  const todayStr = new Date().toDateString()
  const todayTrades = trades.filter((t) => new Date(t.created_at).toDateString() === todayStr)
  const todayClosed = todayTrades.filter((t) => t.pnl !== null)
  const todayWins   = todayClosed.filter((t) => (t.pnl ?? 0) > 0).length
  const todayLosses = todayClosed.filter((t) => (t.pnl ?? 0) < 0).length
  const todayPnl    = todayClosed.reduce((s, t) => s + (t.pnl ?? 0), 0)

  // Overall win rate
  const totalWins     = closed.filter((t) => (t.pnl ?? 0) > 0).length
  const winRateOverall = closed.length >= 5 ? totalWins / closed.length : null

  // Today's win rate
  const winRateToday = todayClosed.length >= 2 ? todayWins / todayClosed.length : null

  // Consecutive losses (most recent streak)
  let consecutiveLosses = 0
  for (let i = closed.length - 1; i >= 0; i--) {
    if ((closed[i].pnl ?? 0) < 0) consecutiveLosses++
    else break
  }

  // ── Overtrading threshold ─────────────────────────────────────────────────
  // Group historical closed trades by day, compute: {day, count, winRate}
  // Find the trade count N where average win rate starts dropping
  const dayMap: Record<string, { count: number; wins: number }> = {}
  for (const t of closed) {
    const d = new Date(t.created_at).toDateString()
    if (!dayMap[d]) dayMap[d] = { count: 0, wins: 0 }
    dayMap[d].count++
    if ((t.pnl ?? 0) > 0) dayMap[d].wins++
  }
  const days = Object.values(dayMap)

  // Build: avgWinRate when N trades taken that day
  const byCount: Record<number, { winRateSum: number; days: number }> = {}
  for (const d of days) {
    if (!byCount[d.count]) byCount[d.count] = { winRateSum: 0, days: 0 }
    byCount[d.count].winRateSum += d.count > 0 ? d.wins / d.count : 0
    byCount[d.count].days++
  }

  // Find the count where win rate drops below 50% or drops significantly
  let overtradingThreshold = 4  // default
  const counts = Object.keys(byCount).map(Number).sort((a, b) => a - b)
  for (let i = 1; i < counts.length; i++) {
    const prev = byCount[counts[i - 1]]
    const curr = byCount[counts[i]]
    const prevWR = prev.winRateSum / prev.days
    const currWR = curr.winRateSum / curr.days
    // If win rate drops by 20%+ or below 40%, that's the threshold
    if (currWR < prevWR - 0.20 || currWR < 0.40) {
      overtradingThreshold = counts[i - 1]
      break
    }
  }

  // Average trades on profitable days
  const greenDays = days.filter((d) => d.wins > d.count / 2)
  const avgTradesPerGreenDay = greenDays.length > 0
    ? Math.round(greenDays.reduce((s, d) => s + d.count, 0) / greenDays.length)
    : 0

  // ── Build alerts ──────────────────────────────────────────────────────────
  const alerts: DailyCheckResult['alerts'] = []

  // 1. Overtrading alert
  if (todayTrades.length >= overtradingThreshold && overtradingThreshold > 0) {
    const dropPct = Math.round(
      (1 - (byCount[overtradingThreshold + 1]?.winRateSum ?? 0) /
        Math.max(1, byCount[overtradingThreshold + 1]?.days ?? 1)) * 100
    )
    alerts.push({
      type: 'overtrading',
      message: `You've taken ${todayTrades.length} trades today. Your data shows win rate drops after trade ${overtradingThreshold} — consider calling it here.`,
      severity: 'warning',
    })
  } else if (todayTrades.length === overtradingThreshold - 1 && overtradingThreshold > 1) {
    alerts.push({
      type: 'approaching_limit',
      message: `${todayTrades.length} trades today. Historically you perform best at ${overtradingThreshold - 1} — one more and you're at your limit.`,
      severity: 'info',
    })
  }

  // 2. Consecutive loss alert
  if (consecutiveLosses >= 3) {
    alerts.push({
      type: 'loss_streak',
      message: `${consecutiveLosses} losses in a row. Stop. Step away. This is exactly when revenge trading destroys accounts.`,
      severity: 'danger',
    })
  } else if (consecutiveLosses === 2) {
    alerts.push({
      type: 'two_losses',
      message: `2 consecutive losses. Pause for 30 minutes before your next trade. Your edge decreases after emotional trades.`,
      severity: 'warning',
    })
  }

  // 3. Today win rate degradation
  if (winRateToday !== null && winRateOverall !== null && winRateToday < winRateOverall * 0.6) {
    alerts.push({
      type: 'winrate_down',
      message: `Your win rate today (${Math.round(winRateToday * 100)}%) is well below your average (${Math.round(winRateOverall * 100)}%). The market may not be aligned with your setups right now.`,
      severity: 'warning',
    })
  }

  // 4. Good session
  if (todayClosed.length >= 2 && todayLosses === 0) {
    alerts.push({
      type: 'clean_session',
      message: `${todayWins}/${todayClosed.length} today — clean session. Protect it. Exiting with a green day beats chasing one more trade.`,
      severity: 'info',
    })
  }

  // 5. Daily loss limit
  if (todayPnl < 0 && Math.abs(todayPnl) > 0) {
    const absLoss = Math.abs(todayPnl)
    // If today's loss > 30% of average win day, warn
    const avgWinDayPnl = days.filter((d) => d.wins > d.count / 2).length > 0
      ? closed.filter((t) => (t.pnl ?? 0) > 0).reduce((s, t) => s + (t.pnl ?? 0), 0) / Math.max(1, totalWins)
      : 0
    if (avgWinDayPnl > 0 && absLoss > avgWinDayPnl * 2) {
      alerts.push({
        type: 'daily_loss',
        message: `You're down $${absLoss.toFixed(2)} today — more than 2x your average win. Hard stop recommended.`,
        severity: 'danger',
      })
    }
  }

  // Overall alert level
  const alertLevel: DailyCheckResult['alertLevel'] =
    alerts.some((a) => a.severity === 'danger') ? 'red' :
    alerts.some((a) => a.severity === 'warning') ? 'yellow' : 'green'

  return NextResponse.json({
    todayCount: todayTrades.length,
    todayWins,
    todayLosses,
    todayPnl,
    consecutiveLosses,
    alertLevel,
    alerts,
    overtradingThreshold,
    avgTradesPerGreenDay,
    winRateToday: winRateToday !== null ? Math.round(winRateToday * 100) : null,
    winRateOverall: winRateOverall !== null ? Math.round(winRateOverall * 100) : null,
  } satisfies DailyCheckResult)
}
