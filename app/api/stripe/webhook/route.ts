import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

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
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
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
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
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

      if (invoice.subscription) {
        await supabase
          .from('subscriptions')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription as string)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
