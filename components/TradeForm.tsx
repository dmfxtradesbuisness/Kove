'use client'

import { useState, useRef } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import InstrumentPicker from '@/components/InstrumentPicker'
import type { Trade, TradeFormData } from '@/lib/types'

interface TradeFormProps {
  trade?: Trade | null
  onClose: () => void
  onSuccess: (trade: Trade) => void
}

const emptyForm: TradeFormData = {
  pair: 'EUR/USD', type: 'BUY',
  entry_price: '', exit_price: '', stop_loss: '', take_profit: '',
  lot_size: '', pnl: '', notes: '', screenshot_url: '',
}

export default function TradeForm({ trade, onClose, onSuccess }: TradeFormProps) {
  const [form, setForm] = useState<TradeFormData>(
    trade ? {
      pair: trade.pair, type: trade.type,
      entry_price: String(trade.entry_price),
      exit_price: trade.exit_price ? String(trade.exit_price) : '',
      stop_loss: trade.stop_loss ? String(trade.stop_loss) : '',
      take_profit: trade.take_profit ? String(trade.take_profit) : '',
      lot_size: trade.lot_size ? String(trade.lot_size) : '',
      pnl: trade.pnl !== null ? String(trade.pnl) : '',
      notes: trade.notes ?? '',
      screenshot_url: trade.screenshot_url ?? '',
    } : emptyForm
  )
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('screenshots').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('screenshots').getPublicUrl(path)
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

    if (!form.pair.trim()) {
      setError('Please select an instrument.')
      setLoading(false)
      return
    }

    try {
      const url = trade ? `/api/trades/${trade.id}` : '/api/trades'
      const res = await fetch(url, {
        method: trade ? 'PUT' : 'POST',
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
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111] border border-white/[0.07] rounded-t-3xl md:rounded-3xl w-full md:max-w-xl max-h-[94vh] md:max-h-[88vh] overflow-y-auto shadow-2xl animate-slide-up scroll-smooth-mobile"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.9)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-0 md:hidden">
          <div className="w-10 h-1 bg-white/10 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-bold text-base tracking-tight">
            {trade ? 'Edit Trade' : 'Log Trade'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#555] hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 flex flex-col gap-4">
          {/* Instrument + Direction */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="label">Instrument</label>
              <InstrumentPicker
                value={form.pair}
                onChange={(val) => setForm((prev) => ({ ...prev, pair: val }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Direction</label>
              <div className="flex gap-2 h-[48px]">
                {(['BUY', 'SELL'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                    className={`flex-1 rounded-xl text-sm font-bold transition-all duration-150 ${
                      form.type === t
                        ? t === 'BUY'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-red-500/15 text-red-400 border border-red-500/25'
                        : 'bg-[#0a0a0a] border border-white/[0.07] text-[#444] hover:text-[#888]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="label">Entry Price</label>
              <input name="entry_price" type="number" step="any" value={form.entry_price} onChange={handleChange} placeholder="1.08500" className="input" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Exit Price</label>
              <input name="exit_price" type="number" step="any" value={form.exit_price} onChange={handleChange} placeholder="1.09200" className="input" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Stop Loss</label>
              <input name="stop_loss" type="number" step="any" value={form.stop_loss} onChange={handleChange} placeholder="1.08000" className="input" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Take Profit</label>
              <input name="take_profit" type="number" step="any" value={form.take_profit} onChange={handleChange} placeholder="1.10000" className="input" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Lot Size</label>
              <input name="lot_size" type="number" step="any" value={form.lot_size} onChange={handleChange} placeholder="0.10" className="input" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">P&amp;L ($)</label>
              <input name="pnl" type="number" step="any" value={form.pnl} onChange={handleChange} placeholder="+120.00" className="input" />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Trade reasoning, market conditions, emotional state…" rows={3} className="input resize-none" />
          </div>

          {/* Screenshot */}
          <div className="flex flex-col gap-2">
            <label className="label">Screenshot</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-secondary !min-h-0 h-10 !px-4 !text-xs gap-2"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploading ? 'Uploading…' : 'Upload Chart'}
              </button>
              {form.screenshot_url && (
                <span className="text-xs text-emerald-400 font-light">✓ Attached</span>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-2xl px-4 py-3 font-light">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-blue flex-1 gap-2">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {trade ? 'Save Changes' : 'Log Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
