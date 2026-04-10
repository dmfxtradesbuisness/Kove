import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Look up the Stripe customer ID from our DB
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ invoices: [] })
  }

  try {
    const invoiceList = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      limit: 12,
      status: 'paid',
    })

    const invoices = invoiceList.data.map((inv) => ({
      id: inv.id,
      amount: inv.amount_paid / 100,
      currency: inv.currency.toUpperCase(),
      date: new Date(inv.created * 1000).toISOString(),
      pdf: inv.invoice_pdf,
      status: inv.status,
      number: inv.number,
    }))

    return NextResponse.json({ invoices })
  } catch {
    return NextResponse.json({ invoices: [] })
  }
}
