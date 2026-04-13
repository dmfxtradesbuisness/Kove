import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { extractTickers, detectNewsCategory } from '@/lib/ticker-extract'
import { NextRequest, NextResponse } from 'next/server'

const CACHE_TTL_MINUTES = 15

interface FinnhubArticle {
  id: number
  headline: string
  summary: string
  url: string
  source: string
  category: string
  image: string
  datetime: number
  related: string
}

async function fetchFromFinnhub(): Promise<FinnhubArticle[]> {
  const token = process.env.FINNHUB_API_KEY
  if (!token) return []

  const categories = ['general', 'forex', 'crypto']
  const results: FinnhubArticle[] = []
  const seen = new Set<number>()

  await Promise.allSettled(
    categories.map(async (cat) => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/news?category=${cat}&token=${token}`,
          { next: { revalidate: 0 } }
        )
        if (!res.ok) return
        const articles: FinnhubArticle[] = await res.json()
        for (const a of articles) {
          if (!seen.has(a.id)) {
            seen.add(a.id)
            results.push({ ...a, category: cat })
          }
        }
      } catch {
        // Skip category on error
      }
    })
  )

  return results
}

async function refreshNewsCache(admin: ReturnType<typeof createAdminClient>) {
  const articles = await fetchFromFinnhub()
  if (articles.length === 0) return

  const rows = articles.map((a) => {
    const titleCategory = detectNewsCategory(a.headline + ' ' + (a.summary ?? ''))
    const finnhubCat = a.category
    let category = titleCategory
    if (finnhubCat === 'forex') category = 'forex'
    else if (finnhubCat === 'crypto') category = 'crypto'

    const tickers = extractTickers(a.headline + ' ' + (a.related ?? ''))

    return {
      external_id: String(a.id),
      title: a.headline,
      summary: a.summary ?? null,
      url: a.url,
      source: a.source,
      category,
      tickers,
      image_url: a.image ?? null,
      published_at: a.datetime ? new Date(a.datetime * 1000).toISOString() : null,
    }
  })

  // Upsert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    await admin
      .from('news_articles')
      .upsert(rows.slice(i, i + 50), { onConflict: 'external_id' })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = Math.min(Number(searchParams.get('limit') ?? '40'), 100)

    const admin = createAdminClient()

    // Check if cache is stale (no articles in last TTL minutes)
    if (process.env.FINNHUB_API_KEY) {
      const { count } = await admin
        .from('news_articles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - CACHE_TTL_MINUTES * 60 * 1000).toISOString())

      if (!count || count === 0) {
        await refreshNewsCache(admin)
      }
    }

    let query = admin
      .from('news_articles')
      .select('id, title, summary, url, source, category, tickers, image_url, published_at, created_at')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: articles, error } = await query
    if (error) throw error

    const configured = !!process.env.FINNHUB_API_KEY

    return NextResponse.json({
      articles: articles ?? [],
      configured,
      cached_count: articles?.length ?? 0,
    })
  } catch (err) {
    console.error('GET /api/news error:', err)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
