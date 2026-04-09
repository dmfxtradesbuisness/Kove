'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Lock, Loader2, ChevronDown, AlertTriangle, TrendingUp, MessageSquare } from 'lucide-react'
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
      setError('Please select a trade or enter notes to analyze.')
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
        body: JSON.stringify({
          tradeData: selectedTrade,
          notes: notes.trim() || undefined,
        }),
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
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!subscribed) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-400" />
            AI Insights
          </h1>
          <p className="text-[#555] text-sm mt-1">
            AI-powered trade analysis and pattern detection
          </p>
        </div>

        <div className="max-w-lg mx-auto mt-12 text-center">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            Upgrade to unlock AI insights
          </h2>
          <p className="text-[#666] text-sm leading-relaxed mb-8">
            Get GPT-4 powered analysis of your trades. Identify recurring
            mistakes, detect profitable patterns, and receive personalized
            feedback to improve your trading.
          </p>

          <div className="card p-6 mb-6 text-left">
            {[
              'Mistake identification in each trade',
              'Pattern detection across your journal',
              'Personalized improvement recommendations',
              'Detailed feedback on entries and exits',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 py-2.5 border-b border-[#111] last:border-0">
                <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-[#ccc]">{f}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto"
          >
            {upgrading && <Loader2 className="w-4 h-4 animate-spin" />}
            Upgrade to Pro — $12/month
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-blue-400" />
          AI Insights
        </h1>
        <p className="text-[#555] text-sm mt-1">
          Select a trade and let AI analyze your performance
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Input section */}
        <div className="card p-6 mb-5">
          <div className="flex flex-col gap-5">
            {/* Trade selector */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Select a Trade (optional)</label>
              <div className="relative">
                <select
                  value={selectedTradeId}
                  onChange={(e) => setSelectedTradeId(e.target.value)}
                  className="input appearance-none pr-8"
                >
                  <option value="">— No trade selected —</option>
                  {trades.map((trade) => (
                    <option key={trade.id} value={trade.id}>
                      {trade.pair} {trade.type} · {new Date(trade.created_at).toLocaleDateString()} ·{' '}
                      {trade.pnl !== null
                        ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}`
                        : 'Open'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] pointer-events-none" />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="label">Additional Context</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe market conditions, your reasoning, what you felt during the trade, anything you want AI to factor in..."
                rows={4}
                className="input resize-none"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary flex items-center gap-2 self-start"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analysis result */}
        {analysis && (
          <div className="flex flex-col gap-4 animate-slide-up">
            {analysis.mistakes && (
              <div className="card p-6 border-red-500/15">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 bg-red-500/15 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Mistakes Identified</h3>
                </div>
                <p className="text-sm text-[#aaa] leading-relaxed whitespace-pre-wrap">
                  {analysis.mistakes}
                </p>
              </div>
            )}

            {analysis.patterns && (
              <div className="card p-6 border-blue-500/15">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 bg-blue-500/15 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Pattern Detection</h3>
                </div>
                <p className="text-sm text-[#aaa] leading-relaxed whitespace-pre-wrap">
                  {analysis.patterns}
                </p>
              </div>
            )}

            {analysis.feedback && (
              <div className="card p-6 border-emerald-500/15">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 bg-emerald-500/15 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Feedback Summary</h3>
                </div>
                <p className="text-sm text-[#aaa] leading-relaxed whitespace-pre-wrap">
                  {analysis.feedback}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
