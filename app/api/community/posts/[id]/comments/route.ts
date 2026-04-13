import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('id, user_id, content, created_at')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) throw error

    // Enrich with profiles
    const userIds = [...new Set((comments ?? []).map(c => c.user_id))]
    let profileMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {}
    if (userIds.length > 0) {
      const admin = createAdminClient()
      const { data: profiles } = await admin
        .from('community_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds)
      for (const p of profiles ?? []) profileMap[p.user_id] = p
    }

    const enriched = (comments ?? []).map(c => ({
      ...c,
      profile: profileMap[c.user_id] ?? null,
    }))

    return NextResponse.json({ comments: enriched })
  } catch (err) {
    console.error('GET comments error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const content = body?.content?.toString().trim()
    if (!content || content.length > 500) {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: comment, error } = await admin
      .from('post_comments')
      .insert({ post_id: id, user_id: user.id, content })
      .select('id, user_id, content, created_at')
      .single()

    if (error) throw error

    // Attach profile
    const { data: profile } = await admin
      .from('community_profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({ comment: { ...comment, profile: profile ?? null } }, { status: 201 })
  } catch (err) {
    console.error('POST comment error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
