import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Aggregate posts per user
    const { data: posts } = await admin
      .from('community_posts')
      .select('user_id, like_count, bookmark_count')

    const stats: Record<string, { posts: number; likes: number; bookmarks: number }> = {}
    for (const p of posts ?? []) {
      if (!stats[p.user_id]) stats[p.user_id] = { posts: 0, likes: 0, bookmarks: 0 }
      stats[p.user_id].posts++
      stats[p.user_id].likes     += p.like_count ?? 0
      stats[p.user_id].bookmarks += p.bookmark_count ?? 0
    }

    const sorted = Object.entries(stats)
      .map(([user_id, s]) => ({ user_id, score: s.likes * 3 + s.bookmarks * 2 + s.posts, ...s }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    if (sorted.length === 0) return NextResponse.json({ leaderboard: [] })

    const userIds = sorted.map(s => s.user_id)
    const { data: profiles } = await admin
      .from('community_profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds)

    const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

    const leaderboard = sorted.map((s, i) => ({
      rank: i + 1,
      user_id: s.user_id,
      posts: s.posts,
      likes: s.likes,
      profile: profileMap[s.user_id] ?? null,
    }))

    return NextResponse.json({ leaderboard })
  } catch (err) {
    console.error('GET leaderboard error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
