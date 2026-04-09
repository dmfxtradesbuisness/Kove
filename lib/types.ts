export interface Trade {
  id: string
  user_id: string
  pair: string
  type: 'BUY' | 'SELL'
  entry_price: number
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  lot_size: number | null
  pnl: number | null
  notes: string | null
  screenshot_url: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type TradeFormData = {
  pair: string
  type: 'BUY' | 'SELL'
  entry_price: string
  exit_price: string
  stop_loss: string
  take_profit: string
  lot_size: string
  pnl: string
  notes: string
  screenshot_url: string
}
