import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/community/follow/[userId] — toggle follow/unfollow
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.id === targetId) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

    const admin = createAdminClient()

    // Check if already following
    const { data: existing } = await admin
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetId)
      .maybeSingle()

    if (existing) {
      // Unfollow
      await admin.from('user_follows').delete().eq('id', existing.id)
      const { data: profile } = await admin
        .from('community_profiles')
        .select('follower_count')
        .eq('user_id', targetId)
        .maybeSingle()
      return NextResponse.json({ following: false, follower_count: profile?.follower_count ?? 0 })
    } else {
      // Follow
      await admin.from('user_follows').insert({ follower_id: user.id, following_id: targetId })
      const { data: profile } = await admin
        .from('community_profiles')
        .select('follower_count')
        .eq('user_id', targetId)
        .maybeSingle()
      return NextResponse.json({ following: true, follower_count: profile?.follower_count ?? 0 })
    }
  } catch (err) {
    console.error('POST follow error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET /api/community/follow/[userId] — check follow status + get target profile
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    const [followRes, profileRes] = await Promise.all([
      admin.from('user_follows').select('id').eq('follower_id', user.id).eq('following_id', targetId).maybeSingle(),
      admin.from('community_profiles').select('display_name, avatar_url, bio, follower_count, following_count').eq('user_id', targetId).maybeSingle(),
    ])

    return NextResponse.json({
      following: !!followRes.data,
      profile: profileRes.data,
    })
  } catch (err) {
    console.error('GET follow error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
