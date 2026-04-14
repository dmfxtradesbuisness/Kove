'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Images, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Search } from 'lucide-react'

interface GalleryTrade {
  id: string
  pair: string
  type: string
  pnl: number | null
  screenshot_url: string
  created_at: string
  notes: string | null
}

function formatPnl(pnl: number) {
  const abs = Math.abs(pnl).toFixed(2)
  return pnl >= 0 ? `+$${abs}` : `-$${abs}`
}

export default function GalleryPage() {
  const [trades, setTrades] = useState<GalleryTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalIdx, setModalIdx] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'open'>('all')

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((d) => { if (d.trades) setTrades(d.trades) })
      .catch(() => setError('Failed to load gallery. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const matchSearch =
        !search ||
        t.pair.toLowerCase().includes(search.toLowerCase()) ||
        t.notes?.toLowerCase().includes(search.toLowerCase())
      const matchFilter =
        filter === 'all' ||
        (filter === 'win' && t.pnl !== null && t.pnl > 0) ||
        (filter === 'loss' && t.pnl !== null && t.pnl < 0) ||
        (filter === 'open' && t.pnl === null)
      return matchSearch && matchFilter
    })
  }, [trades, search, filter])

  const openModal  = useCallback((idx: number) => setModalIdx(idx), [])
  const closeModal = useCallback(() => setModalIdx(null), [])
  const prevImage  = useCallback(() => setModalIdx((i) => (i !== null && i > 0 ? i - 1 : i)), [])
  const nextImage  = useCallback((len: number) => setModalIdx((i) => (i !== null && i < len - 1 ? i + 1 : i)), [])

  useEffect(() => {
    const len = filtered.length
    function handleKey(e: KeyboardEvent) {
      if (modalIdx === null) return
      if (e.key === 'ArrowLeft')  prevImage()
      if (e.key === 'ArrowRight') nextImage(len)
      if (e.key === 'Escape')     closeModal()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [modalIdx, filtered.length, prevImage, nextImage, closeModal])

  const currentTrade = modalIdx !== null ? filtered[modalIdx] : null

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">Visual Log</p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Trade Gallery</h1>
          <p className="text-[#444] text-xs font-light mt-1">
            {trades.length} screenshot{trades.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#333]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pair or notes…"
            className="input pl-9 !min-h-0 h-10 !text-xs !rounded-xl !py-2.5 w-full"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-white/[0.05] rounded-xl p-1">
          {(['all', 'win', 'loss', 'open'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 h-8 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#444] hover:text-[#888]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'var(--font-body)' }}>{error}</p>
        </div>
      )}

      {/* Grid */}
      {!error && loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : !error && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="w-14 h-14 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center mb-4">
            <Images className="w-6 h-6 text-[#333]" />
          </div>
          <p className="text-[#444] text-sm font-medium">
            {trades.length === 0
              ? 'No screenshots saved yet'
              : 'No results for your filters'}
          </p>
          <p className="text-[#2a2a2a] text-xs mt-1 font-light">
            {trades.length === 0
              ? 'Add a screenshot URL when logging a trade to see it here'
              : 'Try adjusting your search or filter'}
          </p>
        </div>
      ) : !error ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((trade, idx) => {
            const isWin = trade.pnl !== null && trade.pnl > 0
            const isLoss = trade.pnl !== null && trade.pnl < 0
            return (
              <button
                key={trade.id}
                onClick={() => openModal(idx)}
                className="group relative aspect-[4/3] bg-[#0f0f0f] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trade.screenshot_url}
                  alt={`${trade.pair} trade screenshot`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                {/* P&L badge */}
                {trade.pnl !== null && (
                  <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-lg ${
                    isWin
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {formatPnl(trade.pnl)}
                  </div>
                )}
                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <p className="text-white text-xs font-bold">{trade.pair}</p>
                  <p className="text-[#888] text-[10px] font-light">
                    {new Date(trade.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </p>
                </div>
                {/* Open status */}
                {trade.pnl === null && (
                  <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
                    Open
                  </div>
                )}
              </button>
            )
          })}
        </div>
      ) : null}

      {/* Modal */}
      {currentTrade && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-5xl w-full bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-white font-bold text-sm">{currentTrade.pair}</p>
                  <p className="text-[#444] text-xs font-light">
                    {currentTrade.type} ·{' '}
                    {new Date(currentTrade.created_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentTrade.pnl !== null && (
                  <div className={`flex items-center gap-1.5 text-sm font-black px-3 py-1.5 rounded-xl ${
                    currentTrade.pnl >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {currentTrade.pnl >= 0
                      ? <TrendingUp className="w-3.5 h-3.5" />
                      : <TrendingDown className="w-3.5 h-3.5" />
                    }
                    {formatPnl(currentTrade.pnl)}
                  </div>
                )}
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-[#444] hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative bg-black max-h-[60vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentTrade.screenshot_url}
                alt={`${currentTrade.pair} trade`}
                className="max-h-[60vh] w-full object-contain"
              />

              {/* Prev / Next */}
              {modalIdx !== null && modalIdx > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {modalIdx !== null && modalIdx < filtered.length - 1 && (
                <button
                  onClick={() => nextImage(filtered.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 border border-white/10 rounded-full flex items-center justify-center text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Notes + counter */}
            <div className="px-6 py-4 flex items-center justify-between gap-4">
              {currentTrade.notes ? (
                <p className="text-[#666] text-xs font-light leading-relaxed flex-1">{currentTrade.notes}</p>
              ) : (
                <p className="text-[#333] text-xs italic">No notes for this trade</p>
              )}
              <p className="text-[#333] text-xs font-medium shrink-0">
                {(modalIdx ?? 0) + 1} / {filtered.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
