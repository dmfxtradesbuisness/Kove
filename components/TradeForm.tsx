'use client'

import { useState, useRef } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Trade, TradeFormData } from '@/lib/types'

interface TradeFormProps {
  trade?: Trade | null
  onClose: () => void
  onSuccess: (trade: Trade) => void
}

const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
  'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/CHF', 'GBP/CHF',
  'AUD/JPY', 'NZD/JPY', 'XAU/USD', 'XAG/USD',
]

const emptyForm: TradeFormData = {
  pair: 'EUR/USD',
  type: 'BUY',
  entry_price: '',
  exit_price: '',
  stop_loss: '',
  take_profit: '',
  lot_size: '',
  pnl: '',
  notes: '',
  screenshot_url: '',
}

export default function TradeForm({ trade, onClose, onSuccess }: TradeFormProps) {
  const [form, setForm] = useState<TradeFormData>(
    trade
      ? {
          pair: trade.pair,
          type: trade.type,
          entry_price: String(trade.entry_price),
          exit_price: trade.exit_price ? String(trade.exit_price) : '',
          stop_loss: trade.stop_loss ? String(trade.stop_loss) : '',
          take_profit: trade.take_profit ? String(trade.take_profit) : '',
          lot_size: trade.lot_size ? String(trade.lot_size) : '',
          pnl: trade.pnl !== null ? String(trade.pnl) : '',
          notes: trade.notes ?? '',
          screenshot_url: trade.screenshot_url ?? '',
        }
      : emptyForm
  )
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('screenshots')
        .getPublicUrl(path)

      setForm((prev) => ({ ...prev, screenshot_url: data.publicUrl }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = trade ? `/api/trades/${trade.id}` : '/api/trades'
      const method = trade ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to save trade')

      onSuccess(data.trade)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
          <h2 className="text-white font-semibold text-base">
            {trade ? 'Edit Trade' : 'Log Trade'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#666] hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          {/* Pair */}
          <div className="flex flex-col gap-1.5">
            <label className="label">Pair</label>
            <select
              name="pair"
              value={form.pair}
              onChange={handleChange}
              className="input"
              required
            >
              {FOREX_PAIRS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="label">Direction</label>
            <div className="flex gap-2">
              {(['BUY', 'SELL'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    form.type === t
                      ? t === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-[#0f0f0f] border border-[#1a1a1a] text-[#666] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Entry Price */}
          <div className="flex flex-col gap-1.5">
            <label className="label">Entry Price</label>
            <input
              name="entry_price"
              type="number"
              step="any"
              value={form.entry_price}
              onChange={handleChange}
              placeholder="1.08500"
              className="input"
              required
            />
          </div>

          {/* Exit Price */}
          <div className="flex flex-col gap-1.5">
            <label className="label">Exit Price</label>
            <input
              name="exit_price"
              type="number"
              step="any"
              value={form.exit_price}
              onChange={handleChange}
              placeholder="1.09200"
              className="input"
            />
          </div>

          {/* Stop Loss */}
          <div className="flex flex-col gap-1.5">
            <label className="label">Stop Loss</label>
            <input
              name="stop_loss"
              type="number"
              step="any"
              value={form.stop_loss}
              onChange={handleChange}
              placeholder="1.08000"
              className="input"
            />
          </div>

          {/* Take Profit */}
          <div className="flex flex-col gap-1.5">
            <label className="label">Take Profit</label>
            <input
              name="take_profit"
              type="number"
              step="any"
              value={form.take_profit}
              onChange={handleChange}
              placeholder="1.10000"
              className="input"
            />
          </div>

          {/* Lot Size */}
          <div className="flex flex-col gap-1.5">
            <label className="label">Lot Size</label>
            <input
              name="lot_size"
              type="number"
              step="any"
              value={form.lot_size}
              onChange={handleChange}
              placeholder="0.10"
              className="input"
            />
          </div>

          {/* P&L */}
          <div className="flex flex-col gap-1.5">
            <label className="label">P&L ($)</label>
            <input
              name="pnl"
              type="number"
              step="any"
              value={form.pnl}
              onChange={handleChange}
              placeholder="+120.00"
              className="input"
            />
          </div>

          {/* Notes */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Trade reasoning, market conditions, emotional state..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Screenshot */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="label">Screenshot</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-secondary flex items-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {uploading ? 'Uploading...' : 'Upload Chart'}
              </button>
              {form.screenshot_url && (
                <span className="text-xs text-emerald-400 truncate max-w-xs">
                  Screenshot attached
                </span>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="col-span-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="col-span-2 flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {trade ? 'Save Changes' : 'Log Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
