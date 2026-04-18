'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Loader2, CheckSquare, Square, ListChecks, Camera, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import InstrumentPicker from '@/components/InstrumentPicker'
import type { Trade, TradeFormData } from '@/lib/types'

interface TradeFormProps {
  trade?: Trade | null
  onClose: () => void
  onSuccess: (trade: Trade) => void
}

interface ChecklistItem {
  id: string
  label: string
}

const emptyForm: TradeFormData = {
  pair: 'EUR/USD', type: 'BUY', outcome: null,
  entry_price: '', exit_price: '', stop_loss: '', take_profit: '',
  lot_size: '', pnl: '', notes: '', screenshot_url: '',
}

export default function TradeForm({ trade, onClose, onSuccess }: TradeFormProps) {
  const [form, setForm] = useState<TradeFormData>(
    trade ? {
      pair: trade.pair, type: trade.type, outcome: trade.outcome ?? null,
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
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const scanRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleScanImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset so same file can be re-selected
    e.target.value = ''
    setScanning(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/ai/parse-trade', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not read trade from image.')
        return
      }
      const t = data.trade ?? {}
      setForm((prev) => ({
        ...prev,
        pair: t.pair ?? prev.pair,
        type: t.type === 'SELL' ? 'SELL' : t.type === 'BUY' ? 'BUY' : prev.type,
        outcome: t.outcome ?? prev.outcome,
        entry_price: t.entry_price != null ? String(t.entry_price) : prev.entry_price,
        exit_price: t.exit_price != null ? String(t.exit_price) : prev.exit_price,
        stop_loss: t.stop_loss != null ? String(t.stop_loss) : prev.stop_loss,
        take_profit: t.take_profit != null ? String(t.take_profit) : prev.take_profit,
        lot_size: t.lot_size != null ? String(t.lot_size) : prev.lot_size,
        pnl: t.pnl != null ? String(t.pnl) : prev.pnl,
        notes: t.notes ? (prev.notes ? prev.notes + '\n' + t.notes : t.notes) : prev.notes,
      }))
      setScanned(true)
    } catch {
      setError('Failed to scan image. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  // Checklist state
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [checklistChecked, setChecklistChecked] = useState<Record<string, boolean>>({})
  const [showChecklist, setShowChecklist] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<TradeFormData | null>(null)

  useEffect(() => {
    if (!trade) {
      // Preload checklist silently
      fetch('/api/checklist')
        .then((r) => r.json())
        .then((d) => {
          if (d.items && d.items.length > 0) {
            setChecklistItems(d.items)
            const init: Record<string, boolean> = {}
            d.items.forEach((item: ChecklistItem) => { init[item.id] = false })
            setChecklistChecked(init)
          }
        })
        .catch(() => {/* silently ignore */})
    }
  }, [trade])

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

  async function saveTrade(formData: TradeFormData) {
    setLoading(true)
    setError('')
    try {
      const url = trade ? `/api/trades/${trade.id}` : '/api/trades'
      const res = await fetch(url, {
        method: trade ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save trade')

      // Save checklist results if we have them
      if (checklistItems.length > 0 && !trade) {
        const results = checklistItems.map((item) => ({
          checklist_item_id: item.id,
          checked: checklistChecked[item.id] ?? false,
        }))
        await fetch('/api/checklist/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trade_id: data.trade.id, results }),
        })
      }

      onSuccess(data.trade)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setShowChecklist(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pair.trim()) {
      setError('Please select an instrument.')
      return
    }
    // If new trade and has checklist items, show checklist first
    if (!trade && checklistItems.length > 0) {
      setPendingFormData(form)
      setShowChecklist(true)
      return
    }
    await saveTrade(form)
  }

  async function handleChecklistConfirm() {
    if (pendingFormData) {
      await saveTrade(pendingFormData)
    }
  }

  const checkedCount = Object.values(checklistChecked).filter(Boolean).length
  const totalItems = checklistItems.length

  // ── Checklist Modal ─────────────────────────────────────────────────────────
  if (showChecklist) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={(e) => e.target === e.currentTarget && setShowChecklist(false)}
      >
        <div
          className="bg-[#111] border border-white/[0.07] rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.9)' }}
        >
          <div className="flex justify-center pt-3 pb-0 md:hidden">
            <div className="w-10 h-1 bg-white/10 rounded-full" />
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <ListChecks className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-sm tracking-tight">Pre-Trade Checklist</h2>
                <p className="text-[#444] text-xs font-light">{checkedCount}/{totalItems} checked</p>
              </div>
            </div>
            <button
              onClick={() => setShowChecklist(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[#555] hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-3">
            {checklistItems.map((item) => {
              const checked = checklistChecked[item.id] ?? false
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setChecklistChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left w-full transition-all duration-150 ${
                    checked
                      ? 'bg-emerald-500/8 border-emerald-500/15 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#666] hover:border-white/[0.1] hover:text-[#aaa]'
                  }`}
                >
                  {checked
                    ? <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    : <Square className="w-4 h-4 text-[#333] flex-shrink-0" />
                  }
                  <span className={`text-sm font-medium transition-all ${checked ? 'line-through text-[#555]' : ''}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}

            {/* Progress bar */}
            <div className="mt-1">
              <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    checkedCount === totalItems ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-2xl px-4 py-3 font-light">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowChecklist(false)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleChecklistConfirm}
                disabled={loading}
                className="btn-blue flex-1 gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {checkedCount < totalItems ? `Log Anyway (${checkedCount}/${totalItems})` : 'Log Trade ✓'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Trade Form ─────────────────────────────────────────────────────────
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

          {/* Scan from image */}
          <input ref={scanRef} type="file" accept="image/*" onChange={handleScanImage} className="hidden" />
          {!trade && (
            <button
              type="button"
              onClick={() => scanRef.current?.click()}
              disabled={scanning}
              className="flex items-center justify-center gap-2.5 w-full rounded-2xl text-sm font-semibold transition-all duration-150"
              style={{
                height: 52,
                background: scanning ? 'rgba(30,110,255,0.08)' : 'rgba(30,110,255,0.1)',
                border: '1px dashed rgba(30,110,255,0.35)',
                color: scanning ? 'rgba(77,144,255,0.5)' : '#4D90FF',
                cursor: scanning ? 'not-allowed' : 'pointer',
              }}
            >
              {scanning ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Scanning trade…</span></>
              ) : (
                <><Camera className="w-4 h-4" /><span>Scan from screenshot or statement</span><Sparkles className="w-3.5 h-3.5 opacity-60" /></>
              )}
            </button>
          )}

          {/* Scanned banner */}
          {scanned && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm animate-fade-in"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">Trade scanned — review the fields below and fix anything that looks off.</span>
            </div>
          )}

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

          {/* Outcome */}
          <div className="flex flex-col gap-2">
            <label className="label">Outcome</label>
            <div className="flex gap-2 h-[48px]">
              {(['win', 'loss', 'breakeven'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, outcome: prev.outcome === o ? null : o }))}
                  className={`flex-1 rounded-xl text-sm font-bold transition-all duration-150 ${
                    form.outcome === o
                      ? o === 'win'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : o === 'loss'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                          : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                      : 'bg-[#0a0a0a] border border-white/[0.07] text-[#444] hover:text-[#888]'
                  }`}
                >
                  {o === 'win' ? 'WIN' : o === 'loss' ? 'LOSS' : 'B/E'}
                </button>
              ))}
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

          {/* Checklist badge */}
          {checklistItems.length > 0 && !trade && (
            <div className="flex items-center gap-2 text-xs text-[#444] bg-white/[0.02] border border-white/[0.04] rounded-xl px-3.5 py-2.5">
              <ListChecks className="w-3.5 h-3.5 text-[#333]" />
              Pre-trade checklist will appear after you hit Log Trade
            </div>
          )}

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
