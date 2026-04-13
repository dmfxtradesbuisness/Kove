import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to upgrade.' }, { status: 401 })
    }

    // Use the $19/month price (STRIPE_PRO_PRICE_ID).
    // Falls back to legacy STRIPE_PRICE_ID for grandfathered users only.
    const priceId = process.env.STRIPE_PRO_PRICE_ID ?? process.env.STRIPE_PRICE_ID

    if (!priceId) {
      console.error('No Stripe price ID configured')
      return NextResponse.json({ error: 'Payment configuration error. Contact support.' }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL not set')
      return NextResponse.json({ error: 'App configuration error. Contact support.' }, { status: 500 })
    }

    // Get or create Stripe customer
    let customerId: string
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (subscription?.stripe_customer_id && !subscription.stripe_customer_id.startsWith('manual')) {
      customerId = subscription.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      })
      customerId = customer.id

      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        subscription_status: 'inactive',
      }, { onConflict: 'user_id' })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/journal?upgraded=1`,
      cancel_url:  `${appUrl}/account?subscription=canceled`,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
      // Show anchor price in checkout
      custom_text: {
        submit: { message: 'Cancel anytime. 7-day money-back guarantee.' },
      },
      allow_promotion_codes: true,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    console.error('Stripe checkout error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
