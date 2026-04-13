import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractTickers } from '@/lib/ticker-extract'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const postType = searchParams.get('post_type')
    const limit = Math.min(Number(searchParams.get('limit') ?? '30'), 50)
    const offset = Number(searchParams.get('offset') ?? '0')

    let query = supabase
      .from('community_posts')
      .select('id, user_id, content, post_type, tickers, like_count, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (postType && postType !== 'all') {
      query = query.eq('post_type', postType)
    }

    const { data: posts, error } = await query
    if (error) throw error

    // Fetch which posts this user has liked
    const postIds = (posts ?? []).map((p) => p.id)
    let likedSet = new Set<string>()

    if (postIds.length > 0) {
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
      likedSet = new Set((likes ?? []).map((l) => l.post_id))
    }

    const enriched = (posts ?? []).map((p) => ({
      ...p,
      liked_by_me: likedSet.has(p.id),
    }))

    return NextResponse.json({ posts: enriched })
  } catch (err) {
    console.error('GET /api/community/posts error:', err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: { content?: string; post_type?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { content, post_type } = body
    const VALID_TYPES = ['setup', 'win', 'loss', 'news_reaction', 'general']

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    if (content.trim().length > 1000) {
      return NextResponse.json({ error: 'Content must be under 1000 characters' }, { status: 400 })
    }
    const resolvedType = VALID_TYPES.includes(post_type ?? '') ? post_type! : 'general'

    const tickers = extractTickers(content)

    // Use admin client to bypass RLS insert check issues on some setups
    const admin = createAdminClient()
    const { data: post, error } = await admin
      .from('community_posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        post_type: resolvedType,
        tickers,
      })
      .select('id, user_id, content, post_type, tickers, like_count, created_at')
      .single()

    if (error) throw error

    return NextResponse.json({ post: { ...post, liked_by_me: false } }, { status: 201 })
  } catch (err) {
    console.error('POST /api/community/posts error:', err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
