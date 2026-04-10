'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

export const INSTRUMENTS: { group: string; items: string[] }[] = [
  {
    group: 'Forex',
    items: [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
      'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/CHF', 'GBP/CHF',
      'AUD/JPY', 'NZD/JPY', 'EUR/CAD', 'EUR/AUD', 'GBP/AUD', 'USD/MXN',
      'USD/SGD', 'USD/HKD', 'USD/NOK', 'USD/SEK', 'USD/DKK', 'USD/ZAR',
      'EUR/NZD', 'GBP/NZD', 'AUD/NZD', 'AUD/CAD', 'CAD/JPY', 'CHF/JPY',
    ],
  },
  {
    group: 'Crypto',
    items: [
      'BTC/USD', 'ETH/USD', 'BNB/USD', 'SOL/USD', 'XRP/USD', 'ADA/USD',
      'DOGE/USD', 'AVAX/USD', 'DOT/USD', 'MATIC/USD', 'LTC/USD', 'LINK/USD',
      'UNI/USD', 'ATOM/USD', 'XLM/USD', 'BCH/USD', 'FIL/USD', 'APT/USD',
      'OP/USD', 'ARB/USD', 'SUI/USD', 'INJ/USD', 'TIA/USD', 'SEI/USD',
    ],
  },
  {
    group: 'US Stocks',
    items: [
      'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AVGO',
      'JPM', 'V', 'UNH', 'XOM', 'LLY', 'JNJ', 'MA', 'HD', 'PG', 'MRK',
      'COST', 'ABBV', 'CRM', 'AMD', 'NFLX', 'BAC', 'KO', 'PEP', 'TMO',
      'WMT', 'MCD', 'ORCL', 'CSCO', 'DIS', 'NKE', 'INTC', 'ADBE',
      'PLTR', 'COIN', 'HOOD', 'RBLX', 'SNAP', 'UBER', 'LYFT', 'ABNB',
      'SHOP', 'SQ', 'PYPL', 'SPOT', 'ROKU', 'ZM', 'DOCU', 'TWLO',
    ],
  },
  {
    group: 'Indices',
    items: [
      'SPX (S&P 500)', 'NDX (NASDAQ 100)', 'DJI (Dow Jones)', 'RUT (Russell 2000)',
      'VIX (Volatility)', 'DAX (Germany)', 'FTSE 100 (UK)', 'CAC 40 (France)',
      'Nikkei 225 (Japan)', 'Hang Seng (HK)', 'ASX 200 (Australia)',
      'Euro Stoxx 50', 'IBEX 35 (Spain)', 'SMI (Switzerland)', 'AEX (Netherlands)',
    ],
  },
  {
    group: 'Commodities',
    items: [
      'XAU/USD (Gold)', 'XAG/USD (Silver)', 'XPT/USD (Platinum)', 'XPD/USD (Palladium)',
      'CL (Crude Oil WTI)', 'BRN (Brent Crude)', 'NG (Natural Gas)',
      'ZC (Corn)', 'ZW (Wheat)', 'ZS (Soybeans)', 'KC (Coffee)',
      'CT (Cotton)', 'SB (Sugar)', 'CC (Cocoa)', 'LBS (Lumber)',
      'HG (Copper)', 'ALUM (Aluminium)',
    ],
  },
  {
    group: 'Futures',
    items: [
      'ES (S&P 500 Futures)', 'NQ (NASDAQ Futures)', 'YM (Dow Futures)',
      'RTY (Russell 2000 Futures)', 'MES (Micro S&P)', 'MNQ (Micro NASDAQ)',
      'MYM (Micro Dow)', 'M2K (Micro Russell)',
      'GC (Gold Futures)', 'SI (Silver Futures)', 'HG (Copper Futures)',
      'CL (Crude Oil Futures)', 'NG (Nat Gas Futures)', 'RB (RBOB Gasoline)',
      'ZB (30Y T-Bond)', 'ZN (10Y T-Note)', 'ZF (5Y T-Note)', 'ZT (2Y T-Note)',
      '6E (Euro FX Futures)', '6B (British Pound Futures)', '6J (Japanese Yen Futures)',
      '6A (Australian Dollar Futures)', '6C (Canadian Dollar Futures)',
      'ZC (Corn Futures)', 'ZW (Wheat Futures)', 'ZS (Soybean Futures)',
      'LE (Live Cattle)', 'HE (Lean Hogs)',
    ],
  },
  {
    group: 'Options',
    items: [
      'SPY Options', 'QQQ Options', 'IWM Options', 'AAPL Options',
      'TSLA Options', 'NVDA Options', 'AMZN Options', 'META Options',
      'VIX Options', 'GLD Options', 'TLT Options',
    ],
  },
]

const ALL_ITEMS = INSTRUMENTS.flatMap((g) => g.items)

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function InstrumentPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [highlighted, setHighlighted] = useState(0)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setHighlighted(0)
    }
  }, [open])

  // Build filtered results
  const filtered = useCallback((): { group: string; items: string[] }[] => {
    const q = query.toLowerCase().trim()
    if (!q) return INSTRUMENTS
    return INSTRUMENTS.map((g) => ({
      group: g.group,
      items: g.items.filter((item) => item.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0)
  }, [query])

  const flatFiltered = filtered().flatMap((g) => g.items)

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } return }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, flatFiltered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatFiltered[highlighted]) {
        select(flatFiltered[highlighted])
      } else if (query.trim()) {
        select(query.trim().toUpperCase())
      }
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${highlighted}"]`) as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  function select(val: string) {
    onChange(val)
    setOpen(false)
    setQuery('')
    setHighlighted(0)
  }

  const isKnown = ALL_ITEMS.includes(value)
  const showCustomRow = query.trim() && !flatFiltered.some((i) => i.toLowerCase() === query.toLowerCase())

  // Display label: show group tag for known items
  const groupTag = INSTRUMENTS.find((g) => g.items.includes(value))?.group ?? null

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery('') }}
        className={`input w-full flex items-center justify-between text-left gap-2 pr-3 transition-all duration-200 ${
          open ? 'border-white/20 bg-[#141414]' : ''
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {groupTag && (
            <span className="text-[10px] font-semibold text-[#444] bg-white/[0.05] px-1.5 py-0.5 rounded-md tracking-wider shrink-0">
              {groupTag.toUpperCase()}
            </span>
          )}
          <span className={`truncate text-sm ${value ? 'text-white' : 'text-[#444]'}`}>
            {value || 'Search instrument…'}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#444] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[200] bg-[#111] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)' }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444] pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHighlighted(0) }}
                placeholder="Search any instrument…"
                className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-xl pl-8 pr-8 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/15 transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setHighlighted(0); inputRef.current?.focus() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results list */}
          <div ref={listRef} className="max-h-[280px] overflow-y-auto scroll-smooth-mobile py-1.5">
            {filtered().map((group) => (
              <div key={group.group}>
                {/* Group header */}
                <div className="px-3 py-1.5 sticky top-0 bg-[#111] z-10">
                  <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest">
                    {group.group}
                  </span>
                </div>

                {/* Items */}
                {group.items.map((item) => {
                  const idx = flatFiltered.indexOf(item)
                  const isSelected = item === value
                  const isHigh = idx === highlighted
                  return (
                    <button
                      key={item}
                      type="button"
                      data-idx={idx}
                      onMouseEnter={() => setHighlighted(idx)}
                      onClick={() => select(item)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors duration-75 ${
                        isHigh
                          ? 'bg-white/[0.06] text-white'
                          : isSelected
                          ? 'text-blue-400 bg-blue-500/[0.08]'
                          : 'text-[#888] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <span>{item}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}

            {/* Custom instrument row */}
            {showCustomRow && (
              <div>
                <div className="px-3 py-1.5 sticky top-0 bg-[#111] z-10">
                  <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest">Custom</span>
                </div>
                <button
                  type="button"
                  onClick={() => select(query.trim().toUpperCase())}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#888] hover:text-white hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                >
                  <span className="text-[#555]">Use</span>
                  <span className="text-white font-semibold">&ldquo;{query.trim().toUpperCase()}&rdquo;</span>
                  <span className="text-[#555]">as custom instrument</span>
                </button>
              </div>
            )}

            {/* Empty state */}
            {filtered().length === 0 && !showCustomRow && (
              <p className="text-center text-[#444] text-sm py-8 font-light">No results for &ldquo;{query}&rdquo;</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
