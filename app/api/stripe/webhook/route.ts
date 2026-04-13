import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Extract period end from subscription — handles Stripe API version differences
function getPeriodEnd(sub: Stripe.Subscription): string | null {
  try {
    // Try items first (newer API versions)
    const itemPeriodEnd = sub.items?.data?.[0]?.current_period_end
    if (typeof itemPeriodEnd === 'number') {
      return new Date(itemPeriodEnd * 1000).toISOString()
    }
    // Try top-level (older API versions)
    const topLevel = (sub as unknown as { current_period_end?: number }).current_period_end
    if (typeof topLevel === 'number') {
      return new Date(topLevel * 1000).toISOString()
    }
    return null
  } catch {
    return null
  }
}

// Grant premium access in subscriptions table
async function grantPremium(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  customerId: string,
  sub: Stripe.Subscription
) {
  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      current_period_end: getPeriodEnd(sub),
    },
    { onConflict: 'user_id' }
  )
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
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Webhook signature verification failed:', msg)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {

      // ── Payment completed → grant access immediately ──
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        if (!userId) {
          console.error('checkout.session.completed: no user_id in metadata')
          break
        }

        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await grantPremium(supabase, userId, session.customer as string, sub)
          console.log(`✓ Premium granted: user=${userId} sub=${sub.id} status=${sub.status}`)
        } else if (session.payment_status === 'paid') {
          // One-time payment fallback
          await supabase.from('subscriptions').upsert(
            {
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: null,
              subscription_status: 'active',
              current_period_end: null,
            },
            { onConflict: 'user_id' }
          )
        }
        break
      }

      // ── Recurring invoice paid → renew/reactivate ──
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription

        if (!subscriptionId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.user_id

        const updateData = {
          subscription_status: sub.status,
          current_period_end: getPeriodEnd(sub),
          stripe_subscription_id: sub.id,
        }

        if (userId) {
          // Update by user_id (most reliable)
          const { error } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('user_id', userId)
          if (error) {
            // If row doesn't exist yet, upsert with customer info
            await supabase.from('subscriptions').upsert(
              {
                user_id: userId,
                stripe_customer_id: typeof invoice.customer === 'string' ? invoice.customer : '',
                ...updateData,
              },
              { onConflict: 'user_id' }
            )
          }
        } else {
          // Fallback: update by subscription ID
          await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('stripe_subscription_id', sub.id)
        }

        console.log(`✓ Invoice paid: sub=${subscriptionId} status=${sub.status}`)
        break
      }

      // ── Subscription updated (plan change, trial end, etc.) ──
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.user_id

        const updateData = {
          stripe_subscription_id: sub.id,
          subscription_status: sub.status,
          current_period_end: getPeriodEnd(sub),
        }

        if (userId) {
          await supabase.from('subscriptions').update(updateData).eq('user_id', userId)
        } else {
          await supabase.from('subscriptions').update(updateData).eq('stripe_subscription_id', sub.id)
        }
        break
      }

      // ── Subscription canceled ──
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.user_id

        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ subscription_status: 'canceled', stripe_subscription_id: null })
            .eq('user_id', userId)
        } else {
          await supabase
            .from('subscriptions')
            .update({ subscription_status: 'canceled', stripe_subscription_id: null })
            .eq('stripe_subscription_id', sub.id)
        }
        console.log(`✓ Subscription canceled: sub=${sub.id}`)
        break
      }

      // ── Payment failed ──
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription

        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId)
          console.log(`⚠ Payment failed: sub=${subscriptionId}`)
        }
        break
      }

      default:
        // Unhandled event type — return 200 so Stripe doesn't retry
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    // Still return 200 to prevent infinite Stripe retries
  }

  return NextResponse.json({ received: true })
}
