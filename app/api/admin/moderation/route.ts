import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>, adminClient: ReturnType<typeof createAdminClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: prefs } = await adminClient
    .from('user_preferences')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!prefs?.is_admin) return null
  return user
}

// GET /api/admin/moderation?type=flagged|removed
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    const user = await requireAdmin(supabase, admin)
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const type = new URL(request.url).searchParams.get('type') ?? 'flagged'

    if (type === 'flagged') {
      // Unresolved reports joined with post content
      const { data: reports, error } = await admin
        .from('post_reports')
        .select('id, post_id, reason, details, created_at')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const postIds = [...new Set((reports ?? []).map(r => r.post_id))]
      let postsMap: Record<string, { id: string; content: string; user_id: string; post_type: string; created_at: string; is_removed: boolean }> = {}

      if (postIds.length > 0) {
        const { data: posts } = await admin
          .from('community_posts')
          .select('id, user_id, content, post_type, created_at, is_removed')
          .in('id', postIds)
        for (const p of posts ?? []) postsMap[p.id] = p
      }

      const userIds = [...new Set(Object.values(postsMap).map(p => p.user_id))]
      let profileMap: Record<string, { display_name: string | null }> = {}
      if (userIds.length > 0) {
        const { data: profiles } = await admin
          .from('community_profiles')
          .select('user_id, display_name')
          .in('user_id', userIds)
        for (const p of profiles ?? []) profileMap[p.user_id] = p
      }

      // Group reports by post
      const grouped: Record<string, { post_id: string; reports: typeof reports; post: typeof postsMap[string] | null; author_name: string | null }> = {}
      for (const r of reports ?? []) {
        if (!grouped[r.post_id]) {
          grouped[r.post_id] = {
            post_id: r.post_id,
            reports: [],
            post: postsMap[r.post_id] ?? null,
            author_name: postsMap[r.post_id] ? (profileMap[postsMap[r.post_id].user_id]?.display_name ?? null) : null,
          }
        }
        grouped[r.post_id].reports.push(r)
      }

      return NextResponse.json({ flagged: Object.values(grouped) })
    }

    if (type === 'removed') {
      // Posts removed by this admin
      const { data: posts, error } = await admin
        .from('community_posts')
        .select('id, user_id, content, post_type, created_at, removed_at')
        .eq('is_removed', true)
        .eq('removed_by', user.id)
        .order('removed_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const userIds = [...new Set((posts ?? []).map(p => p.user_id))]
      let profileMap: Record<string, { display_name: string | null }> = {}
      if (userIds.length > 0) {
        const { data: profiles } = await admin
          .from('community_profiles')
          .select('user_id, display_name')
          .in('user_id', userIds)
        for (const p of profiles ?? []) profileMap[p.user_id] = p
      }

      const enriched = (posts ?? []).map(p => ({
        ...p,
        author_name: profileMap[p.user_id]?.display_name ?? null,
      }))

      return NextResponse.json({ removed: enriched })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('GET /api/admin/moderation error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST /api/admin/moderation
// Body: { action: 'dismiss_report', report_id: string }
//     | { action: 'dismiss_all', post_id: string }
//     | { action: 'restore_post', post_id: string }
//     | { action: 'remove_post', post_id: string }
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    const user = await requireAdmin(supabase, admin)
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { action } = body

    if (action === 'dismiss_report') {
      const { report_id } = body
      await admin.from('post_reports').update({ resolved: true }).eq('id', report_id)
      return NextResponse.json({ ok: true })
    }

    if (action === 'dismiss_all') {
      const { post_id } = body
      await admin.from('post_reports').update({ resolved: true }).eq('post_id', post_id)
      return NextResponse.json({ ok: true })
    }

    if (action === 'restore_post') {
      const { post_id } = body
      await admin.from('community_posts').update({ is_removed: false, removed_by: null, removed_at: null }).eq('id', post_id)
      await admin.from('moderation_log').insert({ admin_id: user.id, post_id, action: 'restore', reason: 'Admin restored post' })
      return NextResponse.json({ ok: true })
    }

    if (action === 'remove_post') {
      const { post_id } = body
      await admin.from('community_posts').update({ is_removed: true, removed_by: user.id, removed_at: new Date().toISOString() }).eq('id', post_id)
      // Dismiss all reports for this post too
      await admin.from('post_reports').update({ resolved: true }).eq('post_id', post_id)
      await admin.from('moderation_log').insert({ admin_id: user.id, post_id, action: 'delete', reason: 'Admin removed post from flagged queue' })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('POST /api/admin/moderation error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
