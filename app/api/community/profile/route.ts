import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const [profileRes, postCountRes] = await Promise.all([
      admin.from('community_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      admin.from('community_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    const profile = profileRes.data
    const post_count = postCountRes.count ?? 0

    return NextResponse.json({ profile, post_count })
  } catch (err) {
    console.error('GET profile error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { display_name, bio, avatar_url, is_public } = body

    if (display_name !== undefined && display_name.length > 30) {
      return NextResponse.json({ error: 'Display name max 30 chars' }, { status: 400 })
    }
    if (bio !== undefined && bio.length > 150) {
      return NextResponse.json({ error: 'Bio max 150 chars' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: profile, error } = await admin
      .from('community_profiles')
      .upsert({
        user_id: user.id,
        ...(display_name !== undefined ? { display_name: display_name.trim() || null } : {}),
        ...(bio !== undefined ? { bio: bio.trim() || null } : {}),
        ...(avatar_url !== undefined ? { avatar_url } : {}),
        ...(is_public !== undefined ? { is_public } : {}),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ profile })
  } catch (err) {
    console.error('PUT profile error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
