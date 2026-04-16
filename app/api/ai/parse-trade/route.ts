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
      model: 'gpt-4o',
      max_tokens: 600,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a trade data extractor for a trading journal app. Analyze this image carefully.

This could be:
A) A broker STATEMENT or TRADE HISTORY table (MT4 report, account history, trade list) — numbers will be in clear table columns. Read them directly.
B) A CHART screenshot (TradingView, MT4 chart, etc.) — prices are harder to read. Follow the specific instructions below.

=== FOR CHART SCREENSHOTS ===
Look carefully in this order:
1. RIGHT-SIDE PRICE AXIS — read the Y-axis numbers carefully. Note the price scale.
2. HORIZONTAL LINES on the chart — these are usually SL (red/pink), TP (green/blue), or entry levels. Each line usually has a price label at its right end.
3. TRADE MARKERS — triangles, arrows, or dots on candles marking entry/exit. Look for any price tooltip or label near them.
4. INFO PANELS / BOXES on the chart — MT4 often shows "Open: 1.08500" type overlays.
5. CANDLE PRICES — if you can identify the entry/exit candle, read the open/close prices from the right axis at that level.
6. Any popup, tooltip, or annotation with price data.

Do NOT invent prices. If you genuinely cannot read a price value, use null.

=== FOR STATEMENT SCREENSHOTS ===
Read the table columns directly: Open Price, Close Price, S/L, T/P, Profit/Loss, Lots, Symbol, Type.

=== OUTPUT ===
Return ONLY a valid JSON object. Use null for anything you cannot read with confidence.

{
  "pair": "instrument symbol (e.g. EUR/USD, XAU/USD, NQ, BTC/USD, US30) — normalize to slash format",
  "type": "BUY or SELL",
  "entry_price": number or null,
  "exit_price": number or null,
  "stop_loss": number or null,
  "take_profit": number or null,
  "lot_size": number or null,
  "pnl": number or null (positive = profit, negative = loss),
  "outcome": "win" or "loss" or "breakeven" or null,
  "notes": "1-2 sentences describing what you see — pattern, chart context, any visible labels" or null
}

No markdown, no explanation. Raw JSON only.`,
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
