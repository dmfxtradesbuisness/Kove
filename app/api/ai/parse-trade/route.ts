import { createClient } from '@/lib/supabase/server'
import { getOpenAI } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // ── Auth ───────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI not configured.' }, { status: 500 })
    }

    // ── Read image ─────────────────────────────────────────────────────────
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.json({ error: 'No image provided.' }, { status: 400 })

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 10 MB).' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    // ── Call GPT-4o vision ─────────────────────────────────────────────────
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4.1',
      max_tokens: 800,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a trade data extractor for a trading journal app.

STEP 1 — CLASSIFY the image:
- TYPE_A (STATEMENT): broker account history, MT4/MT5 trade report, trade table with rows and columns showing Symbol, Type, Open Price, Close Price, S/L, T/P, Profit, Lots as labeled column headers.
- TYPE_B (CHART): a price chart (candlestick or line) from TradingView, MT4, MT5, or any charting platform. Even if it has some annotations or a trade panel overlay, it is still a chart.

STEP 2 — EXTRACT based on type:

=== TYPE_A (STATEMENT) ===
Read table columns directly: Symbol → pair, Type → BUY/SELL, Open Price → entry_price, Close Price → exit_price, S/L → stop_loss, T/P → take_profit, Profit → pnl, Lots → lot_size.
Derive outcome: positive pnl = "win", negative = "loss", zero = "breakeven".
For notes: write 1 concise sentence summarizing the trade if context is clear, otherwise null.

=== TYPE_B (CHART) ===
ONLY extract: pair, type, entry_price, stop_loss, take_profit, exit_price.
Read prices from the RIGHT-SIDE Y-AXIS. Horizontal lines with price labels = SL (red/pink), TP (green/blue), entry (white/yellow). Trade markers (triangles/arrows) mark entry and exit.
Do NOT guess or invent prices — use null if you cannot read a price clearly from the chart.
ALWAYS set these to null for chart images: lot_size = null, pnl = null, outcome = null, notes = null.
Do NOT write notes describing the chart. notes must be null.

=== OUTPUT ===
Return ONLY a valid JSON object. No markdown, no explanation.

{
  "pair": "instrument symbol (e.g. EUR/USD, XAU/USD, NQ, BTC/USD, US30) — normalize to slash format",
  "type": "BUY or SELL or null",
  "entry_price": number or null,
  "exit_price": number or null,
  "stop_loss": number or null,
  "take_profit": number or null,
  "lot_size": number or null,
  "pnl": number or null,
  "outcome": "win" or "loss" or "breakeven" or null,
  "notes": string or null
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ''

    // ── Parse JSON (handle markdown code fences if model adds them) ────────
    let parsed: Record<string, unknown>
    try {
      const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
      parsed = JSON.parse(jsonStr)
    } catch {
      const match = raw.match(/\{[\s\S]+\}/)
      if (!match) {
        return NextResponse.json({ error: 'Could not extract trade data from this image. Try a clearer screenshot.' }, { status: 422 })
      }
      try {
        parsed = JSON.parse(match[0])
      } catch {
        return NextResponse.json({ error: 'Could not extract trade data from this image. Try a clearer screenshot.' }, { status: 422 })
      }
    }

    // Sanitize — ensure type is BUY or SELL
    if (parsed.type && typeof parsed.type === 'string') {
      const t = parsed.type.toUpperCase()
      parsed.type = t === 'SELL' || t === 'SHORT' ? 'SELL' : 'BUY'
    }

    return NextResponse.json({ trade: parsed })
  } catch (err) {
    console.error('[parse-trade] error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('invalid_api_key') || msg.includes('Incorrect API key')) {
      return NextResponse.json({ error: 'Invalid OpenAI API key.' }, { status: 500 })
    }
    if (msg.includes('insufficient_quota')) {
      return NextResponse.json({ error: 'OpenAI quota exceeded.' }, { status: 402 })
    }
    return NextResponse.json({ error: 'Failed to parse trade image.' }, { status: 500 })
  }
}
