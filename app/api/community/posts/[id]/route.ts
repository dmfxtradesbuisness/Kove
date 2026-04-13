import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Check if admin
    const { data: prefs } = await admin
      .from('user_preferences')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle()
    const isAdmin = prefs?.is_admin === true

    // Fetch the post to verify ownership
    const { data: post } = await admin
      .from('community_posts')
      .select('user_id, is_removed')
      .eq('id', id)
      .maybeSingle()

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (!isAdmin && post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft-delete (mark is_removed)
    const { error } = await admin
      .from('community_posts')
      .update({ is_removed: true, removed_by: user.id, removed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    // Log if admin action
    if (isAdmin && post.user_id !== user.id) {
      await admin.from('moderation_log').insert({
        admin_id: user.id,
        post_id: id,
        action: 'delete',
        reason: 'Admin removed post',
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE post error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
