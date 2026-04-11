'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles, Lock, Loader2, ChevronDown,
  AlertTriangle, TrendingUp, MessageSquare,
} from 'lucide-react'
import type { Trade } from '@/lib/types'

interface Analysis {
  mistakes: string
  patterns: string
  feedback: string
}

export default function AIPage() {
  const [subscribed, setSubscribed] = useState<boolean | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [selectedTradeId, setSelectedTradeId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSubscription, setCheckingSubscription] = useState(true)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState('')
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const [subRes, tradesRes] = await Promise.all([
          fetch('/api/stripe/subscription-status'),
          fetch('/api/trades'),
        ])
        const subData = await subRes.json()
        const tradesData = await tradesRes.json()
        setSubscribed(subData.active === true)
        if (tradesData.trades) setTrades(tradesData.trades)
      } finally {
        setCheckingSubscription(false)
      }
    }
    init()
  }, [])

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setError('Failed to start checkout. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  async function handleAnalyze() {
    if (!selectedTradeId && !notes.trim()) {
      setError('Please select a trade or enter notes.')
      return
    }
    setLoading(true)
    setError('')
    setAnalysis(null)
    try {
      const selectedTrade = trades.find((t) => t.id === selectedTradeId) || null
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeData: selectedTrade, notes: notes.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  if (!subscribed) {
    return (
      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-8">
        <div className="mb-8">
          <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">AI Insights</p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Unlock AI</h1>
        </div>

        <div className="max-w-md animate-fade-in-up">
          <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-8 mb-5">
            <div className="w-14 h-14 bg-violet-500/8 border border-violet-500/15 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-violet-400/70" />
            </div>
            <h2 className="text-xl font-black text-white mb-2 tracking-tight">
              Upgrade to Pro
            </h2>
            <p className="text-[#555] text-sm leading-relaxed mb-7 font-light">
              Get GPT-4 powered analysis. Identify recurring mistakes, detect profitable patterns, and receive personalized feedback.
            </p>

            <div className="flex flex-col gap-3 mb-7">
              {[
                'Mistake identification per trade',
                'Pattern detection across journal',
                'Personalized recommendations',
                'Detailed entry/exit feedback',
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400/70 flex-shrink-0" />
                  <span className="text-sm text-[#666] font-light">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="btn-blue w-full gap-2"
            >
              {upgrading && <Loader2 className="w-4 h-4 animate-spin" />}
              Upgrade — $12/month
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <div className="mb-7 md:mb-9">
        <p className="text-[#444] text-xs uppercase tracking-widest mb-2 font-medium">AI Insights</p>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Analyze</h1>
        <p className="text-[#444] text-xs font-light mt-1">
          Select a trade and let AI surface what matters
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Input card */}
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-5 md:p-7 mb-5">
          <div className="flex flex-col gap-5">
            {/* Trade selector */}
            <div className="flex flex-col gap-2">
              <label className="label">Select Trade (optional)</label>
              <div className="relative">
                <select
                  value={selectedTradeId}
                  onChange={(e) => setSelectedTradeId(e.target.value)}
                  className="input appearance-none pr-9"
                >
                  <option value="">— No trade selected —</option>
                  {trades.map((trade) => (
                    <option key={trade.id} value={trade.id}>
                      {trade.pair} {trade.type} · {new Date(trade.created_at).toLocaleDateString()} ·{' '}
                      {trade.pnl !== null ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : 'Open'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333] pointer-events-none" />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <label className="label">Additional Context</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Market conditions, your reasoning, emotional state during the trade…"
                rows={4}
                className="input resize-none"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-2xl px-4 py-3">
                {error}
              </div>
            )}

            <button onClick={handleAnalyze} disabled={loading} className="btn-blue w-full gap-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Analyze with AI</>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {analysis && (
          <div className="flex flex-col gap-4 animate-fade-in-up">
            {analysis.mistakes && (
              <div className="bg-[#0f0f0f] border border-red-500/10 rounded-3xl p-5 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-red-500/8 border border-red-500/15 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400/70" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Mistakes Identified</h3>
                </div>
                <p className="text-sm text-[#666] leading-relaxed whitespace-pre-wrap font-light">{analysis.mistakes}</p>
              </div>
            )}

            {analysis.patterns && (
              <div className="bg-[#0f0f0f] border border-violet-500/10 rounded-3xl p-5 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-violet-500/8 border border-violet-500/15 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-violet-400/70" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Pattern Detection</h3>
                </div>
                <p className="text-sm text-[#666] leading-relaxed whitespace-pre-wrap font-light">{analysis.patterns}</p>
              </div>
            )}

            {analysis.feedback && (
              <div className="bg-[#0f0f0f] border border-emerald-500/10 rounded-3xl p-5 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-500/8 border border-emerald-500/15 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-emerald-400/70" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Feedback Summary</h3>
                </div>
                <p className="text-sm text-[#666] leading-relaxed whitespace-pre-wrap font-light">{analysis.feedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
