import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractTickers } from '@/lib/ticker-extract'
import { moderateText } from '@/lib/content-moderation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const postType   = searchParams.get('post_type')
    const mine       = searchParams.get('mine') === 'true'
    const feed       = searchParams.get('feed') // 'following'
    const limit      = Math.min(Number(searchParams.get('limit') ?? '30'), 50)
    const offset     = Number(searchParams.get('offset') ?? '0')
    const admin      = createAdminClient()

    // For following feed, get the list of followed user IDs first
    let followingIds: string[] = []
    if (feed === 'following') {
      const { data: follows } = await admin
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)
      followingIds = (follows ?? []).map(f => f.following_id)
      if (followingIds.length === 0) {
        return NextResponse.json({ posts: [] })
      }
    }

    let query = supabase
      .from('community_posts')
      .select('id, user_id, content, post_type, tickers, like_count, bookmark_count, comment_count, image_url, created_at')
      .eq('is_removed', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (mine) query = query.eq('user_id', user.id)
    if (feed === 'following') query = query.in('user_id', followingIds)
    if (postType && postType !== 'all') query = query.eq('post_type', postType)

    const { data: posts, error } = await query
    if (error) throw error

    const postIds  = (posts ?? []).map(p => p.id)
    const userIds  = [...new Set((posts ?? []).map(p => p.user_id))]

    // Parallel enrichment
    const [likesRes, bookmarksRes, reactionsRes, myReactionsRes, profilesRes, followsRes] = await Promise.all([
      postIds.length > 0
        ? supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds)
        : Promise.resolve({ data: [] }),
      postIds.length > 0
        ? supabase.from('post_bookmarks').select('post_id').eq('user_id', user.id).in('post_id', postIds)
        : Promise.resolve({ data: [] }),
      postIds.length > 0
        ? supabase.from('post_reactions').select('post_id, emoji').in('post_id', postIds)
        : Promise.resolve({ data: [] }),
      postIds.length > 0
        ? supabase.from('post_reactions').select('post_id, emoji').eq('user_id', user.id).in('post_id', postIds)
        : Promise.resolve({ data: [] }),
      userIds.length > 0
        ? admin.from('community_profiles').select('user_id, display_name, avatar_url, follower_count, following_count').in('user_id', userIds)
        : Promise.resolve({ data: [] }),
      userIds.length > 0
        ? admin.from('user_follows').select('following_id').eq('follower_id', user.id).in('following_id', userIds)
        : Promise.resolve({ data: [] }),
    ])

    const likedSet      = new Set((likesRes.data ?? []).map(l => l.post_id))
    const bookmarkedSet = new Set((bookmarksRes.data ?? []).map(b => b.post_id))
    const followingSet  = new Set((followsRes.data ?? []).map((f: { following_id: string }) => f.following_id))

    // Reactions aggregation: { post_id -> { emoji -> count } }
    const reactionsByPost: Record<string, Record<string, number>> = {}
    for (const r of reactionsRes.data ?? []) {
      if (!reactionsByPost[r.post_id]) reactionsByPost[r.post_id] = {}
      reactionsByPost[r.post_id][r.emoji] = (reactionsByPost[r.post_id][r.emoji] ?? 0) + 1
    }
    const myReactionByPost: Record<string, string> = {}
    for (const r of myReactionsRes.data ?? []) myReactionByPost[r.post_id] = r.emoji

    const profileMap: Record<string, { display_name: string | null; avatar_url: string | null; follower_count: number; following_count: number }> = {}
    for (const p of profilesRes.data ?? []) profileMap[p.user_id] = p

    const enriched = (posts ?? []).map(p => ({
      ...p,
      liked_by_me:        likedSet.has(p.id),
      bookmarked_by_me:   bookmarkedSet.has(p.id),
      reactions:          reactionsByPost[p.id] ?? {},
      my_reaction:        myReactionByPost[p.id] ?? null,
      profile:            profileMap[p.user_id] ?? null,
      i_follow_author:    p.user_id !== user.id && followingSet.has(p.user_id),
      is_my_post:         p.user_id === user.id,
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

    let body: { content?: string; post_type?: string; image_url?: string }
    try { body = await request.json() }
    catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

    const { content, post_type, image_url } = body
    const VALID_TYPES = ['setup', 'win', 'loss', 'news_reaction', 'general']

    if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })
    if (content.trim().length > 1000) return NextResponse.json({ error: 'Content max 1000 chars' }, { status: 400 })

    const resolvedType = VALID_TYPES.includes(post_type ?? '') ? post_type! : 'general'

    // ── Content moderation ──────────────────────────────────────────────────
    const textCheck = moderateText(content)
    if (!textCheck.ok) {
      return NextResponse.json({ error: textCheck.reason }, { status: 422 })
    }

    const tickers = extractTickers(content)

    const admin = createAdminClient()
    const { data: post, error } = await admin
      .from('community_posts')
      .insert({ user_id: user.id, content: content.trim(), post_type: resolvedType, tickers, image_url: image_url ?? null })
      .select('id, user_id, content, post_type, tickers, like_count, bookmark_count, comment_count, image_url, created_at')
      .single()

    if (error) throw error

    // Attach my profile
    const { data: profile } = await admin
      .from('community_profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      post: { ...post, liked_by_me: false, bookmarked_by_me: false, reactions: {}, my_reaction: null, profile: profile ?? null },
    }, { status: 201 })
  } catch (err) {
    console.error('POST /api/community/posts error:', err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
