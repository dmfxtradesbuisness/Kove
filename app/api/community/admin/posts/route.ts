import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: prefs } = await admin
    .from('user_preferences')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!prefs?.is_admin) return null
  return { user, admin }
}

/** GET /api/community/admin/posts — reported posts queue */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const ctx = await requireAdmin(supabase)
    if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') ?? 'reported' // 'reported' | 'all' | 'removed'

    const { admin } = ctx

    if (view === 'reported') {
      // Posts that have ≥1 unresolved report
      const { data: reports } = await admin
        .from('post_reports')
        .select('post_id, reason, details, created_at, resolved')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(100)

      const reportedIds = [...new Set((reports ?? []).map(r => r.post_id))]
      if (reportedIds.length === 0) return NextResponse.json({ posts: [], report_map: {} })

      const { data: posts } = await admin
        .from('community_posts')
        .select('id, user_id, content, post_type, image_url, like_count, comment_count, is_removed, created_at')
        .in('id', reportedIds)
        .order('created_at', { ascending: false })

      // Group reports by post
      const reportMap: Record<string, { count: number; reasons: string[] }> = {}
      for (const r of reports ?? []) {
        if (!reportMap[r.post_id]) reportMap[r.post_id] = { count: 0, reasons: [] }
        reportMap[r.post_id].count++
        if (!reportMap[r.post_id].reasons.includes(r.reason)) reportMap[r.post_id].reasons.push(r.reason)
      }

      // Enrich with profiles
      const userIds = [...new Set((posts ?? []).map(p => p.user_id))]
      const { data: profiles } = await admin
        .from('community_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds)
      const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

      const enriched = (posts ?? []).map(p => ({ ...p, profile: profileMap[p.user_id] ?? null, reports: reportMap[p.id] }))
      return NextResponse.json({ posts: enriched, report_map: reportMap })
    }

    if (view === 'removed') {
      const { data: posts } = await admin
        .from('community_posts')
        .select('id, user_id, content, post_type, image_url, like_count, is_removed, removed_at, created_at')
        .eq('is_removed', true)
        .order('removed_at', { ascending: false })
        .limit(50)
      return NextResponse.json({ posts: posts ?? [] })
    }

    // All posts
    const { data: posts } = await admin
      .from('community_posts')
      .select('id, user_id, content, post_type, image_url, like_count, comment_count, is_removed, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    return NextResponse.json({ posts: posts ?? [] })
  } catch (err) {
    console.error('GET admin posts error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

/** PATCH /api/community/admin/posts — resolve reports for a post */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const ctx = await requireAdmin(supabase)
    if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body    = await request.json()
    const post_id = body?.post_id
    if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

    const { admin, user } = ctx

    await admin
      .from('post_reports')
      .update({ resolved: true })
      .eq('post_id', post_id)

    await admin.from('moderation_log').insert({
      admin_id: user.id,
      post_id,
      action: 'resolve_report',
      reason: 'Admin dismissed reports',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH admin posts error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
