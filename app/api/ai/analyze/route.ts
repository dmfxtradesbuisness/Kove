import { createClient } from '@/lib/supabase/server'
import { getOpenAI } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!subscription || subscription.subscription_status !== 'active') {
    return NextResponse.json(
      { error: 'Active subscription required' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { tradeData, notes } = body

  if (!tradeData && !notes) {
    return NextResponse.json(
      { error: 'Trade data or notes required' },
      { status: 400 }
    )
  }

  const prompt = buildPrompt(tradeData, notes)

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert forex trading coach and analyst. Analyze the provided trade data and give specific, actionable feedback. Be direct and concise. Structure your response with clear sections.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const rawResponse = completion.choices[0]?.message?.content ?? ''
  const parsed = parseAIResponse(rawResponse)

  return NextResponse.json({ analysis: parsed })
}

function buildPrompt(tradeData: Record<string, unknown> | null, notes: string): string {
  let prompt = 'Please analyze the following forex trade:\n\n'

  if (tradeData) {
    prompt += `Pair: ${tradeData.pair}\n`
    prompt += `Direction: ${tradeData.type}\n`
    prompt += `Entry Price: ${tradeData.entry_price}\n`
    if (tradeData.exit_price) prompt += `Exit Price: ${tradeData.exit_price}\n`
    if (tradeData.stop_loss) prompt += `Stop Loss: ${tradeData.stop_loss}\n`
    if (tradeData.take_profit) prompt += `Take Profit: ${tradeData.take_profit}\n`
    if (tradeData.lot_size) prompt += `Lot Size: ${tradeData.lot_size}\n`
    if (tradeData.pnl !== null && tradeData.pnl !== undefined)
      prompt += `P&L: $${tradeData.pnl}\n`
    if (tradeData.notes) prompt += `\nTrade Notes: ${tradeData.notes}\n`
  }

  if (notes) {
    prompt += `\nAdditional Context: ${notes}\n`
  }

  prompt += `
Please provide:
1. MISTAKES: What went wrong or could be improved in this trade
2. PATTERNS: Any patterns you detect in the trading behavior or setup
3. FEEDBACK: Overall performance summary and key recommendations

Be specific and actionable.`

  return prompt
}

function parseAIResponse(raw: string) {
  const sections: { mistakes: string; patterns: string; feedback: string } = {
    mistakes: '',
    patterns: '',
    feedback: '',
  }

  const mistakesMatch = raw.match(/1\.\s*MISTAKES?:?([\s\S]*?)(?=2\.|$)/i)
  const patternsMatch = raw.match(/2\.\s*PATTERNS?:?([\s\S]*?)(?=3\.|$)/i)
  const feedbackMatch = raw.match(/3\.\s*FEEDBACK:?([\s\S]*?)$/i)

  sections.mistakes = mistakesMatch ? mistakesMatch[1].trim() : ''
  sections.patterns = patternsMatch ? patternsMatch[1].trim() : ''
  sections.feedback = feedbackMatch ? feedbackMatch[1].trim() : raw

  if (!sections.mistakes && !sections.patterns) {
    sections.feedback = raw
  }

  return sections
}
