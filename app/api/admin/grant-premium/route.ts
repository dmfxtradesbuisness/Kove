import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

function verifyAdminSecret(request: NextRequest): boolean {
  if (!process.env.ADMIN_SECRET) return false
  // Accept secret from Authorization header: "Bearer <secret>"
  const authHeader = request.headers.get('authorization') ?? ''
  const [scheme, token] = authHeader.split(' ')
  if (scheme === 'Bearer' && token === process.env.ADMIN_SECRET) return true
  return false
}

// POST /api/admin/grant-premium
// Headers: Authorization: Bearer <ADMIN_SECRET>
// Body: { user_id: string, active?: boolean }
export async function POST(request: NextRequest) {
  try {
    if (!process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 })
    }
    if (!verifyAdminSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, active = true } = body

    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id,
          stripe_customer_id: 'manual',
          stripe_subscription_id: active ? 'manual_grant' : null,
          subscription_status: active ? 'active' : 'canceled',
          current_period_end: active
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('grant-premium upsert error:', error)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user_id,
      status: active ? 'active' : 'canceled',
      record: data,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/admin/grant-premium
// Headers: Authorization: Bearer <ADMIN_SECRET>
// Query: ?user_id=xxx  (optional — omit to list all)
export async function GET(request: NextRequest) {
  try {
    if (!process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 })
    }
    if (!verifyAdminSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    const supabase = createAdminClient()

    if (user_id) {
      const { data } = await supabase
        .from('subscriptions')
        .select('user_id, subscription_status, stripe_customer_id, current_period_end')
        .eq('user_id', user_id)
        .single()
      return NextResponse.json({ subscription: data })
    }

    const { data } = await supabase
      .from('subscriptions')
      .select('user_id, subscription_status, stripe_customer_id, current_period_end')
      .order('subscription_status')
    return NextResponse.json({ subscriptions: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
