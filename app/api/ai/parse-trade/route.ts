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
              text: `You are a trade data extractor for a trading journal app. Analyze this trading screenshot (could be from MT4, MT5, TradingView, a broker platform, or any trading app) and extract the trade details.

Return ONLY a valid JSON object. Use null for any field you cannot determine with reasonable confidence.

{
  "pair": "instrument symbol string (e.g. EUR/USD, XAU/USD, NQ, BTC/USD, US30) — normalize to slash format if possible",
  "type": "BUY or SELL — use LONG/SHORT cues if direction labels are absent",
  "entry_price": number or null,
  "exit_price": number or null,
  "stop_loss": number or null,
  "take_profit": number or null,
  "lot_size": number or null,
  "pnl": number or null (positive = profit, negative = loss — include sign),
  "outcome": "win" if profitable, "loss" if losing, "breakeven" if ~zero, null if trade is still open,
  "notes": "1-2 sentence description of what you observe: entry/exit context, pattern visible, any labels on the chart" or null
}

No markdown, no explanation — only the raw JSON object.`,
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
