import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    market,
    account_type,
    biggest_problem,
    daily_trade_limit,
    monthly_pnl_target,
    account_balance,
  } = body

  if (!market || !account_type || !biggest_problem) {
    return NextResponse.json({ error: 'market, account_type, and biggest_problem are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: user.id,
        market,
        account_type,
        biggest_problem,
        daily_trade_limit: daily_trade_limit ? Number(daily_trade_limit) : null,
        monthly_pnl_target: monthly_pnl_target ? Number(monthly_pnl_target) : null,
        account_balance: account_balance ? Number(account_balance) : null,
        onboarding_completed: true,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('onboarding upsert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_preferences')
    .select('onboarding_completed, market, account_type, biggest_problem, daily_trade_limit, monthly_pnl_target, trading_streak, last_logged_date')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ prefs: data })
}
