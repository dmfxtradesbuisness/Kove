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
  entry_price?: number
  exit_price?: number
  stop_loss?: number
  take_profit?: number
  pnl?: number | null
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth (cookie-based for user identity) ──────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Session expired. Please refresh and sign in again.' },
        { status: 401 }
      )
    }

    // ── 2. Subscription (admin client — bypasses RLS, always reliable) ────
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

    // ── 3. Parse body ─────────────────────────────────────────────────────
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

    // ── 4. OpenAI key check ───────────────────────────────────────────────
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'OPENAI_API_KEY is not configured. Add it to your Vercel project → Settings → Environment Variables, then redeploy.',
        },
        { status: 500 }
      )
    }

    // ── 5. System prompt ──────────────────────────────────────────────────
    let systemContent = `You are KoveAI, an expert trading coach embedded inside Kove — a professional trading journal. Your job is to help traders improve consistency, manage risk, and identify the habits costing them money.

Personality: Direct, honest, data-focused. Like a seasoned prop trader mentoring a junior trader.

Format rules:
- Use **bold** for key terms and emphasis
- Use bullet points for lists
- Keep responses concise (2-4 short paragraphs max unless detail is specifically requested)
- Always end with 1-2 concrete action steps the trader can take today
- Use trading terminology correctly (drawdown, R-multiple, expectancy, etc.)

Focus areas:
- Trade-by-trade mistake analysis
- Behavioral patterns (revenge trading, FOMO, overtrading, cutting winners early)
- Risk management (position sizing, stop placement, R:R ratios)
- Time-of-day and day-of-week performance patterns
- Emotional state and its impact on decision-making
- Setup quality and entry/exit timing`

    if (tradeContext && Object.keys(tradeContext).length > 0) {
      systemContent += '\n\n**Attached Trade:**\n'
      if (tradeContext.pair) systemContent += `- Pair: ${tradeContext.pair}\n`
      if (tradeContext.type) systemContent += `- Direction: ${tradeContext.type}\n`
      if (tradeContext.entry_price != null) systemContent += `- Entry: ${tradeContext.entry_price}\n`
      if (tradeContext.exit_price != null) systemContent += `- Exit: ${tradeContext.exit_price}\n`
      if (tradeContext.stop_loss != null) systemContent += `- Stop Loss: ${tradeContext.stop_loss}\n`
      if (tradeContext.take_profit != null) systemContent += `- Take Profit: ${tradeContext.take_profit}\n`
      if (tradeContext.pnl != null) {
        systemContent += `- P&L: ${tradeContext.pnl >= 0 ? '+' : ''}$${tradeContext.pnl}\n`
      }
      if (tradeContext.notes) systemContent += `- Notes: ${tradeContext.notes}\n`
    }

    // ── 6. Call OpenAI with full conversation history ─────────────────────
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        // Pass full conversation for context (cap at last 20 messages)
        ...messages.slice(-20).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature: 0.72,
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

    // Specific OpenAI error types
    if (
      message.includes('invalid_api_key') ||
      message.includes('Incorrect API key') ||
      message.includes('No API key')
    ) {
      return NextResponse.json(
        {
          error:
            'Your OpenAI API key is invalid. Go to Vercel → Settings → Environment Variables and update OPENAI_API_KEY.',
        },
        { status: 500 }
      )
    }

    if (message.includes('insufficient_quota') || message.includes('quota exceeded')) {
      return NextResponse.json(
        {
          error:
            'OpenAI account has run out of credits. Add credits at platform.openai.com/account/billing.',
        },
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
