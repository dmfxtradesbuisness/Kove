import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOpenAI } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage { role: 'user' | 'assistant'; content: string }

interface TradeContext {
  pair?: string; type?: string; outcome?: string | null
  entry_price?: number; exit_price?: number
  stop_loss?: number; take_profit?: number
  pnl?: number | null; notes?: string
}

interface TradeRow {
  pair: string; type: string; outcome: string | null
  entry_price: number; exit_price: number | null
  stop_loss: number | null; take_profit: number | null
  lot_size: number | null; pnl: number | null
  notes: string | null; created_at: string
}

interface GoalRow {
  monthly_pnl_target: number | null
  win_rate_target: number | null
  max_drawdown_target: number | null
  notes: string | null   // trading rules / strategy
}

interface UpcomingEvent {
  name: string; date: string; time: string; impact: string; currencies: string[]
}

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(
  trades:          TradeRow[],
  pinnedTrade:     TradeContext | null,
  displayName:     string | null,
  goals:           GoalRow | null,
  checklistRules:  string[],
  upcomingEvents:  UpcomingEvent[],
): string {

  const firstName = displayName?.split(' ')[0] ?? null
  const now       = new Date()
  const todayStr  = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const closed      = trades.filter(t => t.pnl !== null)
  const totalTrades = trades.length
  const totalClosed = closed.length
  const totalPnl    = closed.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const wins        = closed.filter(t => (t.pnl ?? 0) > 0)
  const losses      = closed.filter(t => (t.pnl ?? 0) < 0)
  const winRate     = totalClosed > 0 ? ((wins.length / totalClosed) * 100).toFixed(1) : null
  const avgWin      = wins.length   > 0 ? wins.reduce((s, t)   => s + t.pnl!, 0) / wins.length   : 0
  const avgLoss     = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl!, 0) / losses.length) : 0
  const rr          = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : null
  const expectancy  = totalClosed > 0
    ? ((wins.length / totalClosed) * avgWin - (losses.length / totalClosed) * avgLoss).toFixed(2)
    : null

  // Max drawdown
  let peak = 0, maxDD = 0, cumPnl = 0
  for (const t of [...closed].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) {
    cumPnl += t.pnl ?? 0
    if (cumPnl > peak) peak = cumPnl
    const dd = peak - cumPnl
    if (dd > maxDD) maxDD = dd
  }

  // This-month P&L
  const thisMonthClosed = closed.filter(t => {
    const d = new Date(t.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthPnl   = thisMonthClosed.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const thisMonthWins  = thisMonthClosed.filter(t => (t.pnl ?? 0) > 0).length
  const thisMonthWR    = thisMonthClosed.length > 0
    ? ((thisMonthWins / thisMonthClosed.length) * 100).toFixed(1)
    : null

  // Current streak
  let currentStreak = 0
  let streakType: 'win' | 'loss' | null = null
  const sorted = [...closed].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  for (const t of sorted) {
    const isWin = (t.pnl ?? 0) > 0
    if (streakType === null) { streakType = isWin ? 'win' : 'loss'; currentStreak = 1 }
    else if ((isWin && streakType === 'win') || (!isWin && streakType === 'loss')) currentStreak++
    else break
  }

  // Pair breakdown
  const pairStats: Record<string, { pnl: number; count: number; wins: number }> = {}
  for (const t of closed) {
    if (!pairStats[t.pair]) pairStats[t.pair] = { pnl: 0, count: 0, wins: 0 }
    pairStats[t.pair].pnl   += t.pnl ?? 0
    pairStats[t.pair].count++
    if ((t.pnl ?? 0) > 0) pairStats[t.pair].wins++
  }
  const pairList = Object.entries(pairStats).sort((a, b) => b[1].pnl - a[1].pnl)

  // Day-of-week breakdown
  const dayStats: Record<string, { pnl: number; count: number }> = {}
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  for (const t of closed) {
    const day = DAYS[new Date(t.created_at).getDay()]
    if (!dayStats[day]) dayStats[day] = { pnl: 0, count: 0 }
    dayStats[day].pnl += t.pnl ?? 0
    dayStats[day].count++
  }
  const dayList = Object.entries(dayStats).sort((a, b) => b[1].pnl - a[1].pnl)
  const worstDay = [...dayList].sort((a, b) => a[1].pnl - b[1].pnl)[0]

  // Hour-of-day breakdown
  const hourStats: Record<number, { pnl: number; count: number }> = {}
  for (const t of closed) {
    const h = new Date(t.created_at).getHours()
    if (!hourStats[h]) hourStats[h] = { pnl: 0, count: 0 }
    hourStats[h].pnl += t.pnl ?? 0
    hourStats[h].count++
  }
  const bestHour = Object.entries(hourStats).sort((a, b) => b[1].pnl - a[1].pnl)[0]
  const worstHour = Object.entries(hourStats).sort((a, b) => a[1].pnl - b[1].pnl)[0]

  // BUY vs SELL
  const buyTrades  = closed.filter(t => t.type === 'BUY')
  const sellTrades = closed.filter(t => t.type === 'SELL')
  const buyPnl     = buyTrades.reduce((s, t)  => s + (t.pnl ?? 0), 0)
  const sellPnl    = sellTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const buyWR      = buyTrades.length  > 0 ? ((buyTrades.filter(t  => (t.pnl ?? 0) > 0).length / buyTrades.length)  * 100).toFixed(0) : null
  const sellWR     = sellTrades.length > 0 ? ((sellTrades.filter(t => (t.pnl ?? 0) > 0).length / sellTrades.length) * 100).toFixed(0) : null

  // Revenge trade detection (loss followed by another loss within same day)
  let revengeTrades = 0
  const sortedByDate = [...closed].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  for (let i = 1; i < sortedByDate.length; i++) {
    const prev = sortedByDate[i - 1]
    const curr = sortedByDate[i]
    const prevDate = new Date(prev.created_at).toDateString()
    const currDate = new Date(curr.created_at).toDateString()
    if (prevDate === currDate && (prev.pnl ?? 0) < 0 && (curr.pnl ?? 0) < 0) revengeTrades++
  }

  // SL usage
  const slUsage = totalClosed > 0
    ? ((closed.filter(t => t.stop_loss != null).length / totalClosed) * 100).toFixed(0)
    : null

  // Goal progress
  let goalSection = ''
  if (goals) {
    goalSection = `\n══════════════════════════════════════
GOALS & TARGETS — ${monthName.toUpperCase()}
══════════════════════════════════════`
    if (goals.monthly_pnl_target != null) {
      const pct     = goals.monthly_pnl_target > 0 ? ((thisMonthPnl / goals.monthly_pnl_target) * 100).toFixed(0) : '0'
      const reached = thisMonthPnl >= goals.monthly_pnl_target
      goalSection += `\nMonthly P&L Target: $${goals.monthly_pnl_target.toFixed(0)} → Current: ${thisMonthPnl >= 0 ? '+' : ''}$${thisMonthPnl.toFixed(2)} (${pct}%)${reached ? ' ✅ ACHIEVED' : ''}`
    }
    if (goals.win_rate_target != null && thisMonthWR != null) {
      const reached = parseFloat(thisMonthWR) >= goals.win_rate_target
      goalSection += `\nWin Rate Target: ${goals.win_rate_target}% → Current: ${thisMonthWR}%${reached ? ' ✅ ACHIEVED' : ''}`
    }
    if (goals.max_drawdown_target != null) {
      const exceeded = maxDD > goals.max_drawdown_target
      goalSection += `\nMax Drawdown Limit: $${goals.max_drawdown_target.toFixed(0)} → Actual max DD: $${maxDD.toFixed(2)}${exceeded ? ' ⚠️ EXCEEDED' : ' ✅ OK'}`
    }
    if (goals.notes?.trim()) {
      goalSection += `\n\nTRADER'S STRATEGY & RULES (from goals tab):\n"${goals.notes.trim()}"`
    }
  }

  // Checklist rules
  let checklistSection = ''
  if (checklistRules.length > 0) {
    checklistSection = `\n══════════════════════════════════════
PRE-TRADE CHECKLIST (trader's own rules):
══════════════════════════════════════
${checklistRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
  }

  // Upcoming news
  let newsSection = ''
  const highImpact = upcomingEvents.filter(e => e.impact === 'high')
  if (highImpact.length > 0) {
    newsSection = `\n══════════════════════════════════════
UPCOMING HIGH-IMPACT NEWS (next 72h):
══════════════════════════════════════
${highImpact.map(e => `- ${e.date} ${e.time}: ${e.name} [${e.currencies.join(', ')}]`).join('\n')}

If the user asks about trading today or specific pairs, cross-reference with these events. Warn them if a relevant pair has major news coming.`
  }

  // Recent trades
  const recent = trades.slice(0, 15).map((t, i) => {
    const pnlStr  = t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : 'open'
    const outcome = t.outcome ? ` [${t.outcome.toUpperCase()}]` : ''
    const noteStr = t.notes ? ` | Note: "${t.notes.slice(0, 100)}${t.notes.length > 100 ? '…' : ''}"` : ''
    const slStr   = t.stop_loss  != null ? ` SL:${t.stop_loss}`  : ' SL:none'
    const tpStr   = t.take_profit != null ? ` TP:${t.take_profit}` : ''
    return `  ${i + 1}. ${new Date(t.created_at).toLocaleDateString()} ${t.pair} ${t.type}${outcome} — ${pnlStr}${slStr}${tpStr}${noteStr}`
  }).join('\n')

  const allNotes = trades
    .filter(t => t.notes?.trim())
    .slice(0, 40)
    .map(t => `- [${t.pair} ${t.type} ${t.pnl != null ? (t.pnl >= 0 ? '+' : '') + '$' + t.pnl.toFixed(2) : 'open'}]: ${t.notes!.slice(0, 150)}`)
    .join('\n')

  // ── Assemble prompt ────────────────────────────────────────────────────────
  const name = firstName ? firstName : 'trader'

  let prompt = `You are Kove AI — a high-performance trading behavior analyst and execution coach.

Your job is NOT to comfort ${name}. Your job is to identify exactly what is hurting their trading performance and communicate it clearly, directly, and usefully.

TODAY: ${todayStr}
TRADER: ${displayName ?? 'Unknown'}${firstName ? ` (address them as ${firstName})` : ''}

════════════════════════════════════════
CORE OBJECTIVE
════════════════════════════════════════
Detect and explain the specific behaviors causing ${name} to lose money or be inconsistent.
Do NOT give generic advice. Do NOT explain trading concepts unless directly relevant.
You already know their data — never say "based on the data you provided."

════════════════════════════════════════
HOW YOU THINK
════════════════════════════════════════
1. PRIORITIZE PATTERNS OVER SINGLE TRADES
   Look for: repeated mistakes, behavioral tendencies, consistency breakdowns.
   Do not focus on one trade unless it reveals a repeated issue.

2. BE SPECIFIC AND DATA-DRIVEN
   Bad: "You should manage risk better"
   Good: "You increase position size after losses — your avg loss after a prior loss is larger"

3. CALL OUT BEHAVIOR CLEARLY
   If ${name} is overtrading → say it. Breaking rules → say it. Being inconsistent → explain exactly how.
   Do not soften the message unnecessarily.

4. SEPARATE PROCESS FROM OUTCOME
   A good trade can lose. A bad trade can win.
   Evaluate: Was the trade executed correctly? Did it follow their system?

5. GIVE ACTIONABLE CORRECTIONS
   Every insight must include WHAT is wrong, WHY it's happening (if detectable), WHAT to change immediately.

════════════════════════════════════════
REAL-TIME WARNING SYSTEM
════════════════════════════════════════
When analyzing live or recent behavior, actively flag risks like a coach interrupting a bad decision:
- "You're about to overtrade — you've already hit your daily average of X trades"
- "This setup doesn't match your profitable patterns"
- "You typically lose after this many consecutive trades in a session"
- Cross-reference pairs with upcoming high-impact news and warn immediately if relevant.
- If ${name} describes a setup that violates one of their checklist rules, call it out directly.

════════════════════════════════════════
DISCIPLINE SCORING
════════════════════════════════════════
When asked for a daily review or discipline score, assign a score (0–100) based on:
- Rule adherence (checklist compliance)
- Consistency (trade frequency vs. pattern)
- Emotional control (inferred from revenge trade indicators, position sizing shifts)
- Trade quality (not just outcome)

Explain briefly: what raised it, what lowered it.

════════════════════════════════════════
TONE
════════════════════════════════════════
- Direct, sharp, analytical
- Not emotional, not hype, no fluff
- Match their register: if they're casual, be real back; if analytical, go deep
- Closer to a strict coach than a motivational speaker
- Address ${name} by first name when delivering a key insight or calling out a pattern — not every sentence

════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════
Structure responses as:
1. Key Behavior Insight
2. Supporting Evidence (exact numbers, pairs, dates from their data)
3. Correction (what to change immediately)
4. Real-Time Warning (if applicable)
5. Discipline Score (if end-of-day or summary requested)

Use **bold** for key numbers and terms. Bullet lists for breakdowns. Never pad. No filler sentences.

════════════════════════════════════════
FINAL RULE
════════════════════════════════════════
If ${name} is losing → show them exactly WHY with their own data.
If ${name} is winning → verify whether it's repeatable or luck.
Always default to truth over comfort.`


════════════════════════════════════════
${name.toUpperCase()}'S TRADING DATA
════════════════════════════════════════
Total trades: ${totalTrades} (${totalClosed} closed, ${totalTrades - totalClosed} open)
`

  if (totalClosed === 0) {
    prompt += `No closed trades yet — ${name} is just getting started.\n`
  } else {
    prompt += `Win rate: ${winRate}% (${wins.length}W / ${losses.length}L)
All-time P&L: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}
${monthName} P&L: ${thisMonthPnl >= 0 ? '+' : ''}$${thisMonthPnl.toFixed(2)} (${thisMonthClosed.length} trades, ${thisMonthWR ?? '—'}% WR this month)
Avg win: +$${avgWin.toFixed(2)} | Avg loss: -$${avgLoss.toFixed(2)}
Reward/Risk: ${rr ?? 'N/A'} | Expectancy: ${expectancy != null ? '$' + expectancy : 'N/A'}/trade
Max drawdown: $${maxDD.toFixed(2)}
Current streak: ${currentStreak} ${streakType ?? ''}${currentStreak > 1 ? 's' : ''} in a row
Stop loss usage: ${slUsage ?? '—'}% of trades
Potential revenge trades detected: ${revengeTrades}
`

    if (pairList.length > 0) {
      prompt += `\nPAIR BREAKDOWN:\n`
      for (const [pair, s] of pairList) {
        const wr = s.count > 0 ? ((s.wins / s.count) * 100).toFixed(0) : '—'
        prompt += `  ${pair}: ${s.pnl >= 0 ? '+' : ''}$${s.pnl.toFixed(2)} | ${s.count} trades | ${wr}% WR\n`
      }
    }

    prompt += `\nBUY: ${buyTrades.length} trades → ${buyPnl >= 0 ? '+' : ''}$${buyPnl.toFixed(2)} (${buyWR ?? '—'}% WR)
SELL: ${sellTrades.length} trades → ${sellPnl >= 0 ? '+' : ''}$${sellPnl.toFixed(2)} (${sellWR ?? '—'}% WR)\n`

    if (dayList.length > 0) {
      prompt += `\nP&L BY DAY:\n`
      for (const [day, s] of dayList) {
        prompt += `  ${day}: ${s.pnl >= 0 ? '+' : ''}$${s.pnl.toFixed(2)} (${s.count} trades)\n`
      }
      if (worstDay) prompt += `  → Worst day: ${worstDay[0]} ($${worstDay[1].pnl.toFixed(2)})\n`
    }

    if (bestHour && worstHour) {
      const fmtH = (h: string) => {
        const n = parseInt(h); const ampm = n >= 12 ? 'PM' : 'AM'; const h12 = n % 12 || 12
        return `${h12}:00 ${ampm}`
      }
      prompt += `\nBEST hour to trade: ${fmtH(bestHour[0])} (${bestHour[1].pnl >= 0 ? '+' : ''}$${bestHour[1].pnl.toFixed(2)})
WORST hour: ${fmtH(worstHour[0])} ($${worstHour[1].pnl.toFixed(2)})\n`
    }
  }

  if (recent) {
    prompt += `\n──────────────────────────────────────
RECENT 15 TRADES (newest first):
${recent}\n`
  }

  if (allNotes) {
    prompt += `\n──────────────────────────────────────
TRADE NOTES (patterns, emotions, setups):
${allNotes}\n`
  }

  prompt += goalSection
  prompt += checklistSection
  prompt += newsSection
  prompt += `\n══════════════════════════════════════\n`

  if (pinnedTrade && Object.keys(pinnedTrade).length > 0) {
    prompt += `\n════════════════════════════════════════\nTRADE UNDER REVIEW:\n════════════════════════════════════════\n`
    if (pinnedTrade.pair)          prompt += `  Pair: ${pinnedTrade.pair}\n`
    if (pinnedTrade.type)          prompt += `  Direction: ${pinnedTrade.type}\n`
    if (pinnedTrade.outcome)       prompt += `  Outcome: ${pinnedTrade.outcome.toUpperCase()}\n`
    if (pinnedTrade.entry_price  != null) prompt += `  Entry: ${pinnedTrade.entry_price}\n`
    if (pinnedTrade.exit_price   != null) prompt += `  Exit: ${pinnedTrade.exit_price}\n`
    if (pinnedTrade.stop_loss    != null) prompt += `  Stop Loss: ${pinnedTrade.stop_loss}\n`
    if (pinnedTrade.take_profit  != null) prompt += `  Take Profit: ${pinnedTrade.take_profit}\n`
    if (pinnedTrade.pnl          != null) prompt += `  P&L: ${pinnedTrade.pnl >= 0 ? '+' : ''}$${pinnedTrade.pnl}\n`
    if (pinnedTrade.notes)         prompt += `  Notes: "${pinnedTrade.notes}"\n`
  }

  return prompt
}

// ─── Fetch upcoming high-impact events (next 72h) ─────────────────────────────
async function fetchUpcomingEvents(): Promise<UpcomingEvent[]> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return []
  try {
    const from = new Date()
    const to   = new Date(); to.setDate(to.getDate() + 3)
    const fmt  = (d: Date) => d.toISOString().slice(0, 10)
    const res  = await fetch(
      `https://finnhub.io/api/v1/calendar/economic?from=${fmt(from)}&to=${fmt(to)}&token=${apiKey}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const json = await res.json()
    const RELEVANT = new Set(['US','EU','GB','JP','CA','AU','NZ','CH'])
    const CURRENCIES: Record<string, string[]> = {
      US: ['USD','NQ','US30','XAU/USD'], EU: ['EUR/USD'], GB: ['GBP/USD'],
      JP: ['USD/JPY'], CA: ['USD/CAD'], AU: ['AUD/USD'], NZ: ['NZD/USD'], CH: ['USD/CHF'],
    }
    return (json.economicCalendar ?? [])
      .filter((e: { country: string; impact: string }) => RELEVANT.has(e.country) && e.impact === 'high')
      .map((e: { event: string; time: string; country: string }) => ({
        name:       e.event,
        date:       e.time.slice(0, 10),
        time:       e.time.slice(11, 16),
        impact:     'high',
        currencies: CURRENCIES[e.country] ?? [e.country],
      }))
  } catch {
    return []
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Session expired. Please refresh and sign in again.' }, { status: 401 })
    }

    // ── 2. Subscription check ────────────────────────────────────────────────
    const admin = createAdminClient()
    const { data: sub } = await admin
      .from('subscriptions').select('subscription_status').eq('user_id', user.id).single()
    if (!sub || sub.subscription_status !== 'active') {
      return NextResponse.json({ error: 'KoveAI requires an active Pro subscription.' }, { status: 403 })
    }

    // ── 3. Parse body ────────────────────────────────────────────────────────
    let body: { messages?: ChatMessage[]; tradeContext?: TradeContext }
    try { body = await request.json() }
    catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

    const { messages = [], tradeContext } = body
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content?.trim()) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 })
    }

    // ── 4. Fetch all context in parallel ─────────────────────────────────────
    const [tradesRes, profileRes, goalsRes, checklistRes, upcomingEvents] = await Promise.all([
      admin
        .from('trades')
        .select('pair,type,outcome,entry_price,exit_price,stop_loss,take_profit,lot_size,pnl,notes,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200),

      admin
        .from('community_profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle(),

      admin
        .from('goals')
        .select('monthly_pnl_target,win_rate_target,max_drawdown_target,notes')
        .eq('user_id', user.id)
        .is('journal_id', null)
        .maybeSingle(),

      admin
        .from('checklists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(async ({ data: cl }) => {
          if (!cl) return { data: [] }
          return admin
            .from('checklist_items')
            .select('label')
            .eq('checklist_id', cl.id)
            .order('sort_order', { ascending: true })
        }),

      fetchUpcomingEvents(),
    ])

    const trades         = (tradesRes.data        ?? []) as TradeRow[]
    const displayName    = profileRes.data?.display_name ?? user.email?.split('@')[0] ?? null
    const goals          = (goalsRes.data          ?? null) as GoalRow | null
    const checklistItems = (checklistRes.data       ?? []) as { label: string }[]
    const checklistRules = checklistItems.map(i => i.label)

    // ── 5. Build system prompt ───────────────────────────────────────────────
    const systemContent = buildSystemPrompt(
      trades,
      tradeContext && Object.keys(tradeContext).length > 0 ? tradeContext : null,
      displayName,
      goals,
      checklistRules,
      upcomingEvents,
    )

    // ── 6. Call OpenAI ───────────────────────────────────────────────────────
    const completion = await getOpenAI().chat.completions.create({
      model:       'gpt-4.1-mini',
      temperature: 0.4,
      max_tokens:  1200,
      messages: [
        { role: 'system', content: systemContent },
        ...messages.slice(-20).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
    })

    const reply = completion.choices[0]?.message?.content?.trim()
    if (!reply) {
      return NextResponse.json({ error: 'AI returned an empty response. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ reply })

  } catch (err) {
    console.error('[KoveAI]', err)
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('invalid_api_key') || msg.includes('Incorrect API key')) {
      return NextResponse.json({ error: 'Invalid OpenAI API key.' }, { status: 500 })
    }
    if (msg.includes('insufficient_quota')) {
      return NextResponse.json({ error: 'OpenAI quota exceeded — add credits at platform.openai.com/account/billing.' }, { status: 402 })
    }
    if (msg.includes('rate_limit') || msg.includes('429')) {
      return NextResponse.json({ error: 'Too many requests — wait a few seconds and try again.' }, { status: 429 })
    }
    return NextResponse.json({ error: `Something went wrong: ${msg}` }, { status: 500 })
  }
}
