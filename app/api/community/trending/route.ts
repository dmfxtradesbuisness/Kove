import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: posts } = await admin
      .from('community_posts')
      .select('tickers, post_type')
      .gte('created_at', since)

    // Count tickers
    const tickerCount: Record<string, number> = {}
    for (const p of posts ?? []) {
      for (const t of p.tickers ?? []) {
        tickerCount[t] = (tickerCount[t] ?? 0) + 1
      }
    }

    // Count post types
    const typeCount: Record<string, number> = {}
    for (const p of posts ?? []) {
      if (p.post_type && p.post_type !== 'general') {
        const label = '#' + p.post_type.charAt(0).toUpperCase() + p.post_type.slice(1)
        typeCount[label] = (typeCount[label] ?? 0) + 1
      }
    }

    const tickerTrends = Object.entries(tickerCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([tag, count]) => ({ tag: `$${tag}`, count, type: 'ticker' }))

    const typeTrends = Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([tag, count]) => ({ tag, count, type: 'category' }))

    const trending = [...tickerTrends, ...typeTrends]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({ trending })
  } catch (err) {
    console.error('GET trending error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
