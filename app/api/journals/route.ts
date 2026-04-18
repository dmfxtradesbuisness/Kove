import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/journals — list all journals for the user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ journals: data })
}

// POST /api/journals — create a new journal
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, color } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  // Check if this will be the user's first journal (before inserting)
  const { count: existingCount } = await supabase
    .from('journals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data, error } = await supabase
    .from('journals')
    .insert({ user_id: user.id, name: name.trim(), color: color || '#1E6EFF' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // First journal ever — migrate all unassigned trades into it
  if (existingCount === 0) {
    await supabase
      .from('trades')
      .update({ journal_id: data.id })
      .eq('user_id', user.id)
      .is('journal_id', null)
  }

  return NextResponse.json({ journal: data }, { status: 201 })
}
