import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOpenAI } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface TradeContext {
  pair?: string
  type?: string
  outcome?: string | null
  entry_price?: number
  exit_price?: number
  stop_loss?: number
  take_profit?: number
  pnl?: number | null
  notes?: string
}

interface TradeRow {
  pair: string
  type: string
  outcome: string | null
  entry_price: number
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  lot_size: number | null
  pnl: number | null
  notes: string | null
  created_at: string
}

// ── Build a data-rich, personalized system prompt from the user's actual trades ──
function buildSystemPrompt(trades: TradeRow[], pinnedTrade: TradeContext | null): string {
  const closed = trades.filter((t) => t.pnl !== null)
  const totalTrades = trades.length
  const totalClosed = closed.length

  // Core stats
  const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0)
  const losses = closed.filter((t) => (t.pnl ?? 0) < 0)
  const winRate = totalClosed > 0 ? ((wins.length / totalClosed) * 100).toFixed(1) : null
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl!, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl!, 0) / losses.length) : 0
  const expectancy = totalClosed > 0
    ? ((wins.length / totalClosed) * avgWin - (losses.length / totalClosed) * avgLoss).toFixed(2)
    : null
  const rr = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : null

  // Best / worst pairs
  const pairStats: Record<string, { pnl: number; count: number }> = {}
  for (const t of closed) {
    if (!pairStats[t.pair]) pairStats[t.pair] = { pnl: 0, count: 0 }
    pairStats[t.pair].pnl += t.pnl ?? 0
    pairStats[t.pair].count++
  }
  const pairList = Object.entries(pairStats).sort((a, b) => b[1].pnl - a[1].pnl)
  const bestPair = pairList[0]
  const worstPair = pairList[pairList.length - 1]

  // BUY vs SELL breakdown
  const buyTrades = closed.filter((t) => t.type === 'BUY')
  const sellTrades = closed.filter((t) => t.type === 'SELL')
  const buyPnl = buyTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const sellPnl = sellTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)

  // Day-of-week breakdown
  const dayStats: Record<string, { pnl: number; count: number }> = {}
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for (const t of closed) {
    const day = DAYS[new Date(t.created_at).getDay()]
    if (!dayStats[day]) dayStats[day] = { pnl: 0, count: 0 }
    dayStats[day].pnl += t.pnl ?? 0
    dayStats[day].count++
  }
  const dayList = Object.entries(dayStats).sort((a, b) => b[1].pnl - a[1].pnl)

  // Streak (current)
  let currentStreak = 0
  let streakType: 'win' | 'loss' | null = null
  const sorted = [...closed].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  for (const t of sorted) {
    const isWin = (t.pnl ?? 0) > 0
    if (streakType === null) { streakType = isWin ? 'win' : 'loss'; currentStreak = 1 }
    else if ((isWin && streakType === 'win') || (!isWin && streakType === 'loss')) currentStreak++
    else break
  }

  // Max drawdown (peak-to-trough on cumulative P&L)
  let peak = 0, maxDD = 0, cumPnl = 0
  for (const t of [...closed].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) {
    cumPnl += t.pnl ?? 0
    if (cumPnl > peak) peak = cumPnl
    const dd = peak - cumPnl
    if (dd > maxDD) maxDD = dd
  }

  // Recent 10 trades with notes
  const recent = trades
    .slice(0, 10)
    .map((t, i) => {
      const pnlStr = t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : 'open'
      const outcome = t.outcome ? ` [${t.outcome.toUpperCase()}]` : ''
      const noteStr = t.notes ? ` | Note: "${t.notes.slice(0, 120)}${t.notes.length > 120 ? '…' : ''}"` : ''
      return `  ${i + 1}. ${t.pair} ${t.type}${outcome} — ${pnlStr}${noteStr}`
    })
    .join('\n')

  // All trade notes (for pattern analysis)
  const allNotes = trades
    .filter((t) => t.notes && t.notes.trim().length > 0)
    .slice(0, 30)
    .map((t) => `- [${t.pair} ${t.type}${t.pnl != null ? ` ${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : ''}]: ${t.notes!.slice(0, 150)}`)
    .join('\n')

  // ── Build prompt sections ──────────────────────────────────────────────────
  let prompt = `You are KoveAI, an expert trading coach embedded inside Kove — a professional trading journal.

Your job is to give this specific trader brutally honest, data-driven coaching based on their ACTUAL trading data below. Do NOT give generic advice. Every response must reference their real numbers, real pairs, real patterns from their journal.

Personality: Direct, specific, data-focused. Like a seasoned prop trader reviewing this trader's real stats with them.

Format rules:
- Use **bold** for key terms and key numbers
- Use bullet points for lists
- Keep responses SHORT — 2-3 tight paragraphs max, or a short paragraph + bullets. Do not pad.
- On follow-up questions: do NOT re-list stats already mentioned earlier in this conversation. The trader has already seen them. Jump straight to the new insight or answer.
- Only pull in new stats if the follow-up question actually requires them.
- Always reference the trader's actual data (pair names, specific P&L numbers, real patterns)
- End with 1 concrete, specific action step based on THEIR data — not two unless they're genuinely different
- Never give advice that could apply to any trader — make it specific to this person's numbers

══════════════════════════════════════
TRADER PROFILE — LIVE DATA
══════════════════════════════════════
Total trades logged: ${totalTrades} (${totalClosed} closed, ${totalTrades - totalClosed} open/pending)
`

  if (totalClosed === 0) {
    prompt += `Win rate: N/A — no closed trades yet\nTotal P&L: $0.00\n`
  } else {
    prompt += `Win rate: ${winRate}% (${wins.length}W / ${losses.length}L)
Total P&L: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}
Avg win: +$${avgWin.toFixed(2)} | Avg loss: -$${avgLoss.toFixed(2)}
Reward/Risk ratio: ${rr ?? 'N/A'}
Expectancy per trade: ${expectancy != null ? `$${expectancy}` : 'N/A'}
Max drawdown: $${maxDD.toFixed(2)}
Current streak: ${currentStreak} ${streakType ?? ''}${currentStreak > 1 ? 's' : ''}
`

    if (bestPair && worstPair && pairList.length > 1) {
      prompt += `\nBest pair: ${bestPair[0]} (+$${bestPair[1].pnl.toFixed(2)} over ${bestPair[1].count} trades)
Worst pair: ${worstPair[0]} ($${worstPair[1].pnl.toFixed(2)} over ${worstPair[1].count} trades)\n`
    } else if (bestPair) {
      prompt += `\nMost traded pair: ${bestPair[0]} ($${bestPair[1].pnl.toFixed(2)} over ${bestPair[1].count} trades)\n`
    }

    prompt += `\nBUY trades: ${buyTrades.length} → $${buyPnl >= 0 ? '+' : ''}${buyPnl.toFixed(2)}
SELL trades: ${sellTrades.length} → $${sellPnl >= 0 ? '+' : ''}${sellPnl.toFixed(2)}\n`

    if (dayList.length > 0) {
      prompt += `\nP&L by day of week:\n`
      for (const [day, s] of dayList) {
        prompt += `  ${day}: ${s.pnl >= 0 ? '+' : ''}$${s.pnl.toFixed(2)} (${s.count} trades)\n`
      }
    }

    if (pairList.length > 1) {
      prompt += `\nAll pairs breakdown:\n`
      for (const [pair, s] of pairList) {
        prompt += `  ${pair}: ${s.pnl >= 0 ? '+' : ''}$${s.pnl.toFixed(2)} over ${s.count} trades\n`
      }
    }
  }

  if (recent) {
    prompt += `\n──────────────────────────────────────
RECENT 10 TRADES (newest first):
${recent}\n`
  }

  if (allNotes) {
    prompt += `\n──────────────────────────────────────
TRADER'S OWN NOTES (up to 30 trades):
${allNotes}\n`
  }

  prompt += `══════════════════════════════════════\n`

  // Pinned trade (user manually selected for deep analysis)
  if (pinnedTrade && Object.keys(pinnedTrade).length > 0) {
    prompt += `\n🔍 TRADE THE USER WANTS TO DISCUSS:\n`
    if (pinnedTrade.pair) prompt += `  Pair: ${pinnedTrade.pair}\n`
    if (pinnedTrade.type) prompt += `  Direction: ${pinnedTrade.type}\n`
    if (pinnedTrade.outcome) prompt += `  Outcome: ${pinnedTrade.outcome.toUpperCase()}\n`
    if (pinnedTrade.entry_price != null) prompt += `  Entry: ${pinnedTrade.entry_price}\n`
    if (pinnedTrade.exit_price != null) prompt += `  Exit: ${pinnedTrade.exit_price}\n`
    if (pinnedTrade.stop_loss != null) prompt += `  Stop Loss: ${pinnedTrade.stop_loss}\n`
    if (pinnedTrade.take_profit != null) prompt += `  Take Profit: ${pinnedTrade.take_profit}\n`
    if (pinnedTrade.pnl != null) prompt += `  P&L: ${pinnedTrade.pnl >= 0 ? '+' : ''}$${pinnedTrade.pnl}\n`
    if (pinnedTrade.notes) prompt += `  Notes: "${pinnedTrade.notes}"\n`
  }

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth ────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Session expired. Please refresh and sign in again.' },
        { status: 401 }
      )
    }

    // ── 2. Subscription check (admin client bypasses RLS) ──────────────────
    const admin = createAdminClient()
    const { data: sub } = await admin
      .from('subscriptions')
      .select('subscription_status')
      .eq('user_id', user.id)
      .single()

    if (!sub || sub.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'KoveAI requires an active Pro subscription.' },
        { status: 403 }
      )
    }

    // ── 3. Parse body ──────────────────────────────────────────────────────
    let body: { messages?: ChatMessage[]; tradeContext?: TradeContext }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const { messages = [], tradeContext } = body
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage || !lastMessage.content?.trim()) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 })
    }

    // ── 4. OpenAI key check ────────────────────────────────────────────────
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured. Add it to your Vercel project → Settings → Environment Variables, then redeploy.' },
        { status: 500 }
      )
    }

    // ── 5. Fetch user's actual trades from DB ──────────────────────────────
    const { data: trades } = await admin
      .from('trades')
      .select('pair, type, outcome, entry_price, exit_price, stop_loss, take_profit, lot_size, pnl, notes, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200)

    // ── 6. Build personalized system prompt ────────────────────────────────
    const systemContent = buildSystemPrompt(
      (trades ?? []) as TradeRow[],
      tradeContext && Object.keys(tradeContext).length > 0 ? tradeContext : null
    )

    // ── 7. Call OpenAI ─────────────────────────────────────────────────────
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemContent },
        ...messages.slice(-20).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature: 0.65,
      max_tokens: 900,
    })

    const reply = completion.choices[0]?.message?.content?.trim()

    if (!reply) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reply })

  } catch (err) {
    console.error('[KoveAI] Error:', err)
    const message = err instanceof Error ? err.message : String(err)

    if (message.includes('invalid_api_key') || message.includes('Incorrect API key') || message.includes('No API key')) {
      return NextResponse.json(
        { error: 'Your OpenAI API key is invalid. Go to Vercel → Settings → Environment Variables and update OPENAI_API_KEY.' },
        { status: 500 }
      )
    }
    if (message.includes('insufficient_quota') || message.includes('quota exceeded')) {
      return NextResponse.json(
        { error: 'OpenAI account has run out of credits. Add credits at platform.openai.com/account/billing.' },
        { status: 402 }
      )
    }
    if (message.includes('rate_limit') || message.includes('429')) {
      return NextResponse.json(
        { error: 'Too many requests to AI. Please wait a few seconds and try again.' },
        { status: 429 }
      )
    }
    if (message.includes('model_not_found') || message.includes('does not exist')) {
      return NextResponse.json(
        { error: 'AI model unavailable. Please contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: `Something went wrong: ${message}` },
      { status: 500 }
    )
  }
}
