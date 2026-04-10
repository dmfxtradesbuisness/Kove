import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/checklist — fetch user's checklist template + items
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: checklist } = await supabase
    .from('checklists')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!checklist) return NextResponse.json({ checklist: null, items: [] })

  const { data: items } = await supabase
    .from('checklist_items')
    .select('id, label, sort_order')
    .eq('checklist_id', checklist.id)
    .order('sort_order', { ascending: true })

  return NextResponse.json({ checklist, items: items ?? [] })
}

// POST /api/checklist — create or update checklist + items
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, items } = body as { name: string; items: string[] }

  // Upsert checklist
  const { data: checklist, error: checklistError } = await supabase
    .from('checklists')
    .upsert({ user_id: user.id, name: name || 'My Checklist' }, { onConflict: 'user_id' })
    .select('id, name')
    .single()

  if (checklistError || !checklist) {
    return NextResponse.json({ error: checklistError?.message }, { status: 500 })
  }

  // Delete existing items, then re-insert
  await supabase.from('checklist_items').delete().eq('checklist_id', checklist.id)

  if (items && items.length > 0) {
    const rows = items
      .filter((label) => label.trim())
      .map((label, idx) => ({
        checklist_id: checklist.id,
        user_id: user.id,
        label: label.trim(),
        sort_order: idx,
      }))
    await supabase.from('checklist_items').insert(rows)
  }

  // Fetch final items
  const { data: finalItems } = await supabase
    .from('checklist_items')
    .select('id, label, sort_order')
    .eq('checklist_id', checklist.id)
    .order('sort_order', { ascending: true })

  return NextResponse.json({ checklist, items: finalItems ?? [] })
}
