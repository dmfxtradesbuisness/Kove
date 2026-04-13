import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Subscription lookup (admin client — bypasses RLS) ─────────────────
    const admin = createAdminClient()
    const { data: subscription } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found. Upgrade to Pro to access billing.' },
        { status: 400 }
      )
    }

    // ── Manual/grandfathered users don't have real Stripe customer IDs ────
    if (subscription.stripe_customer_id.startsWith('manual_')) {
      return NextResponse.json(
        {
          error: 'manual',
          message:
            'Your Pro access was granted directly — there is no billing to manage.',
        },
        { status: 200 }
      )
    }

    // ── Stripe billing portal ─────────────────────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/account`,
    })

    return NextResponse.json({ url: portalSession.url })

  } catch (err) {
    console.error('[Portal] Error:', err)
    const message = err instanceof Error ? err.message : String(err)

    // Stripe billing portal hasn't been configured in the dashboard
    if (
      message.includes('No configuration') ||
      message.includes('default configuration') ||
      message.includes('customer_portal')
    ) {
      return NextResponse.json(
        {
          error:
            'Billing portal not configured. Go to dashboard.stripe.com/settings/billing/portal and activate it.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: `Billing error: ${message}` },
      { status: 500 }
    )
  }
}
