import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET — return the user's webhook token (create if missing)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Upsert to ensure row + token exist
  const { data, error } = await admin
    .from('user_preferences')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' })
    .select('webhook_token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ webhook_token: data.webhook_token })
}

// POST — regenerate webhook token
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Generate new token via postgres
  const { data, error } = await admin
    .from('user_preferences')
    .update({ webhook_token: crypto.randomUUID() })
    .eq('user_id', user.id)
    .select('webhook_token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ webhook_token: data.webhook_token })
}
