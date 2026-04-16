import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/grant-premium
// Body: { user_id: string, admin_secret: string, active: boolean }
// Use this to manually grant/revoke premium for any user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, admin_secret, active = true } = body

    // Verify admin secret — also reject if ADMIN_SECRET is not configured
    if (!process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 })
    }
    if (!admin_secret || admin_secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Upsert subscription record with manual active status
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id,
          stripe_customer_id: 'manual',
          stripe_subscription_id: active ? 'manual_grant' : null,
          subscription_status: active ? 'active' : 'canceled',
          current_period_end: active
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
            : null,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user_id,
      status: active ? 'active' : 'canceled',
      record: data,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// GET /api/admin/grant-premium?admin_secret=xxx&user_id=xxx
// Check current subscription status for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const admin_secret = searchParams.get('admin_secret')
  const user_id = searchParams.get('user_id')

  if (!admin_secret || admin_secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  if (user_id) {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single()
    return NextResponse.json({ subscription: data })
  }

  // List all subscriptions
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id, subscription_status, stripe_customer_id, current_period_end')
    .order('subscription_status')
  return NextResponse.json({ subscriptions: data })
}
