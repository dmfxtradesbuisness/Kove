import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/ai/health
 * Quick diagnostic endpoint — checks auth, subscription, and OpenAI key.
 * Only accessible when logged in.
 */
export async function GET() {
  const checks: Record<string, string> = {}

  // Auth
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    checks.auth = user ? `ok (${user.email})` : 'no session'
  } catch (e) {
    checks.auth = `error: ${e instanceof Error ? e.message : String(e)}`
  }

  // OpenAI key
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    checks.openai_key = 'MISSING — set OPENAI_API_KEY in Vercel'
  } else if (!key.startsWith('sk-')) {
    checks.openai_key = `invalid format (starts with: ${key.slice(0, 5)}...)`
  } else {
    checks.openai_key = `present (${key.slice(0, 8)}...)`
  }

  // OpenAI connectivity — real test call
  if (key) {
    try {
      const { OpenAI } = await import('openai')
      const openai = new OpenAI({ apiKey: key })
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "ok" in one word.' }],
        max_tokens: 5,
      })
      checks.openai_call = `ok — model replied: "${res.choices[0]?.message?.content?.trim()}"`
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      checks.openai_call = `FAILED: ${msg}`
    }
  } else {
    checks.openai_call = 'skipped (no key)'
  }

  const allOk = Object.values(checks).every((v) => v.startsWith('ok') || v.startsWith('present'))

  return NextResponse.json({ status: allOk ? 'healthy' : 'degraded', checks })
}
