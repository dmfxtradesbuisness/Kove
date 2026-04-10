import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Helper: get period end from subscription (handles API version differences)
function getPeriodEnd(sub: Stripe.Subscription): string | null {
  try {
    // current_period_end is on items in newer API versions
    const end =
      (sub as unknown as { current_period_end?: number }).current_period_end ??
      sub.items?.data?.[0]?.plan?.billing_scheme !== undefined
        ? undefined
        : undefined

    if (typeof end === 'number') {
      return new Date(end * 1000).toISOString()
    }

    // Fallback: look at billing_cycle_anchor if available
    const anchor = (sub as unknown as { billing_cycle_anchor?: number }).billing_cycle_anchor
    if (typeof anchor === 'number') {
      // Approximate next period end (anchor + 30 days)
      return new Date((anchor + 30 * 24 * 60 * 60) * 1000).toISOString()
    }

    return null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Webhook signature verification failed:', msg)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        if (userId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: sub.id,
            subscription_status: sub.status,
            current_period_end: getPeriodEnd(sub),
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.user_id

        const updateData: Record<string, unknown> = {
          stripe_subscription_id: sub.id,
          subscription_status: sub.status,
          current_period_end: getPeriodEnd(sub),
        }

        if (userId) {
          await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('user_id', userId)
        } else {
          await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('stripe_subscription_id', sub.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        await supabase
          .from('subscriptions')
          .update({
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }

      case 'invoice.paid': {
        // Reactivate subscription if it was past_due
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          await supabase
            .from('subscriptions')
            .update({
              subscription_status: sub.status,
              current_period_end: getPeriodEnd(sub),
            })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    // Return 200 to prevent Stripe from retrying for non-critical errors
  }

  return NextResponse.json({ received: true })
}
