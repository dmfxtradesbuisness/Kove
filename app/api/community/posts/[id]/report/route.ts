import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VALID_REASONS = ['spam', 'hate_speech', 'nudity', 'violence', 'misinformation', 'other']

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
    const reason  = body?.reason
    const details = body?.details?.toString().slice(0, 500) ?? null

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    }

    const { error } = await supabase
      .from('post_reports')
      .insert({ post_id: id, reporter_id: user.id, reason, details })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You already reported this post' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST report error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
