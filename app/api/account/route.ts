// DELETE /api/account — deletes the authenticated user's account
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    // Soft-delete: mark posts as removed, delete profile, then delete auth user
    await admin
      .from('community_posts')
      .update({ is_removed: true, removed_by: user.id, removed_at: new Date().toISOString() })
      .eq('user_id', user.id)
    await admin.from('community_profiles').delete().eq('user_id', user.id)
    await admin.from('subscriptions').delete().eq('user_id', user.id)
    // Delete auth user (this is final)
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
