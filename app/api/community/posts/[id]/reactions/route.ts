import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VALID_EMOJIS = ['❤️', '🔥', '💯', '📈', '📉']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body  = await request.json()
    const emoji = body?.emoji
    if (!VALID_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 })
    }

    // Upsert: one reaction per user per post (replace if different emoji)
    const { error } = await supabase
      .from('post_reactions')
      .upsert({ post_id: id, user_id: user.id, emoji }, { onConflict: 'post_id,user_id' })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST reaction error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', id)
      .eq('user_id', user.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE reaction error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
