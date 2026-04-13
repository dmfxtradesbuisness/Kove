'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Loader2, Plus, Globe, ArrowLeftRight, RefreshCw,
  Mic, BarChart2, ChevronDown, Lock, Sparkles,
} from 'lucide-react'
import type { Trade } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
  loading?: boolean
}

interface Analysis {
  mistakes: string
  patterns: string
  feedback: string
}

// ─── Suggestions ─────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Analyze my last trade',
  'What patterns am I repeating?',
  'How can I improve my entries?',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2)
}

function formatAnalysis(a: Analysis): string {
  const parts: string[] = []
  if (a.mistakes) parts.push(`**Mistakes**\n${a.mistakes}`)
  if (a.patterns) parts.push(`**Patterns**\n${a.patterns}`)
  if (a.feedback) parts.push(`**Feedback**\n${a.feedback}`)
  return parts.join('\n\n')
}

/** Render bold markdown (**text**) inline */
function renderText(text: string) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g)
  return segments.map((seg, i) =>
    seg.startsWith('**') && seg.endsWith('**')
      ? <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{seg.slice(2, -2)}</strong>
      : <span key={i}>{seg}</span>
  )
}

// ─── Orb ─────────────────────────────────────────────────────────────────────
function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

// ─── Bubble ──────────────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div
      className="flex animate-fade-in"
      style={{ justifyContent: isUser ? 'flex-start' : 'flex-end', marginBottom: 16 }}
    >
      <div
        style={{
          maxWidth: '62%',
          padding: '12px 18px',
          borderRadius: isUser ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
          background: isUser
            ? 'rgba(230,230,240,0.93)'
            : 'rgba(42,36,110,0.85)',
          color: isUser ? '#111' : 'rgba(220,215,255,0.92)',
          fontSize: 14,
          lineHeight: '1.65',
          fontFamily: 'var(--font-body)',
          backdropFilter: 'blur(8px)',
          border: isUser
            ? '1px solid rgba(255,255,255,0.18)'
            : '1px solid rgba(108,93,211,0.35)',
          boxShadow: isUser
            ? '0 4px 24px rgba(0,0,0,0.35)'
            : '0 4px 24px rgba(60,40,140,0.35)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {msg.loading ? (
          <span className="flex items-center gap-2" style={{ color: 'rgba(180,170,255,0.7)' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Thinking…
          </span>
        ) : (
          renderText(msg.text)
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AIPage() {
  const [subscribed, setSubscribed]       = useState<boolean | null>(null)
  const [trades, setTrades]               = useState<Trade[]>([])
  const [checking, setChecking]           = useState(true)
  const [messages, setMessages]           = useState<Message[]>([])
  const [input, setInput]                 = useState('')
  const [sending, setSending]             = useState(false)
  const [selectedTradeId, setSelectedTradeId] = useState('')
  const [showTradeBar, setShowTradeBar]   = useState(false)
  const [upgrading, setUpgrading]         = useState(false)

  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function init() {
      try {
        const [subRes, tradesRes] = await Promise.all([
          fetch('/api/stripe/subscription-status'),
          fetch('/api/trades'),
        ])
        const subData    = await subRes.json()
        const tradesData = await tradesRes.json()
        setSubscribed(subData.active === true)
        if (tradesData.trades) setTrades(tradesData.trades)
      } finally {
        setChecking(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || sending) return
    setSending(true)

    const userMsg: Message = { id: uid(), role: 'user', text: text.trim() }
    const loadingMsg: Message = { id: uid(), role: 'ai', text: '', loading: true }
    setMessages((prev) => [...prev, userMsg, loadingMsg])
    setInput('')

    try {
      const selectedTrade = trades.find((t) => t.id === selectedTradeId) || null
      const res  = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeData: selectedTrade,
          notes: text.trim(),
        }),
      })
      const data = await res.json()

      let aiText: string
      if (!res.ok) {
        aiText = `⚠️ ${data.error || 'Analysis failed. Please try again.'}`
      } else {
        aiText = formatAnalysis(data.analysis)
      }

      setMessages((prev) =>
        prev.map((m) => (m.loading ? { ...m, text: aiText, loading: false } : m))
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? { ...m, text: '⚠️ Connection error. Please try again.', loading: false }
            : m
        )
      )
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const res  = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setUpgrading(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%', minHeight: '60vh' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.4)' }} />
      </div>
    )
  }

  // ── Upgrade wall ─────────────────────────────────────────────────────────
  if (!subscribed) {
    return (
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '80vh' }}
      >
        <Orb style={{ width: 500, height: 500, top: -120, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle,rgba(60,40,140,0.7) 0%,rgba(20,10,60,0.3) 60%,transparent 100%)' }} />
        <Orb style={{ width: 300, height: 300, bottom: 0, left: -80, background: 'radial-gradient(circle,rgba(40,30,100,0.5) 0%,transparent 70%)' }} />
        <Orb style={{ width: 250, height: 250, top: 60, right: -60, background: 'radial-gradient(circle,rgba(50,35,120,0.45) 0%,transparent 70%)' }} />

        <div className="relative z-10 text-center px-6" style={{ maxWidth: 400 }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(108,93,211,0.15)', border: '1px solid rgba(108,93,211,0.25)', backdropFilter: 'blur(8px)' }}
          >
            <Lock className="w-7 h-7" style={{ color: '#8B7CF8' }} />
          </div>
          <h2
            className="text-2xl font-black mb-3"
            style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '-0.02em' }}
          >
            Unlock KoveAI
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)' }}>
            GPT-4 powered trade analysis. Identify mistakes, detect patterns, and get personalized coaching — all from a natural conversation.
          </p>
          <div className="flex flex-col gap-2.5 mb-8 text-left">
            {[
              'Mistake identification per trade',
              'Pattern detection across your journal',
              'Personalized entry/exit feedback',
              'Natural chat interface',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7B6CF5' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              boxShadow: '0 0 32px rgba(108,93,211,0.4)',
              border: 'none',
              cursor: upgrading ? 'not-allowed' : 'pointer',
              opacity: upgrading ? 0.6 : 1,
            }}
          >
            {upgrading && <Loader2 className="w-4 h-4 animate-spin" />}
            Upgrade — $12/month
          </button>
        </div>
      </div>
    )
  }

  // ── Main chat UI ─────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 0px)', maxHeight: '100vh', background: '#080808' }}
    >
      {/* ── Orbs ── */}
      <Orb style={{ width: 560, height: 560, top: -160, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle,rgba(55,38,130,0.75) 0%,rgba(25,15,70,0.35) 55%,transparent 100%)', zIndex: 0 }} />
      <Orb style={{ width: 320, height: 320, top: 20, left: -80, background: 'radial-gradient(circle,rgba(35,25,90,0.55) 0%,transparent 70%)', zIndex: 0 }} />
      <Orb style={{ width: 280, height: 280, top: 40, right: -60, background: 'radial-gradient(circle,rgba(45,30,100,0.5) 0%,transparent 70%)', zIndex: 0 }} />
      <Orb style={{ width: 340, height: 340, bottom: -100, left: -80, background: 'radial-gradient(circle,rgba(30,20,80,0.5) 0%,transparent 70%)', zIndex: 0 }} />
      <Orb style={{ width: 300, height: 300, bottom: -60, right: -60, background: 'radial-gradient(circle,rgba(40,28,100,0.5) 0%,transparent 70%)', zIndex: 0 }} />

      {/* ── KoveAI brand (only when no messages) ── */}
      {messages.length === 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <div
            className="flex items-center gap-2.5 mb-3"
            style={{
              background: 'radial-gradient(circle at center, rgba(90,70,200,0.18) 0%, transparent 80%)',
              padding: '20px 36px',
              borderRadius: 24,
            }}
          >
            <BarChart2 className="w-6 h-6" style={{ color: 'rgba(160,145,255,0.7)' }} />
            <span
              className="text-3xl font-black tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'rgba(200,190,255,0.55)',
                letterSpacing: '-0.03em',
              }}
            >
              KoveAI
            </span>
          </div>
        </div>
      )}

      {/* ── Messages area ── */}
      <div
        className="flex-1 overflow-y-auto relative"
        style={{ zIndex: 2, paddingTop: messages.length === 0 ? 0 : 24 }}
      >
        {messages.length > 0 && (
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 24px' }}>
            {messages.map((msg) => (
              <Bubble key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Bottom section ── */}
      <div
        className="relative flex-shrink-0"
        style={{ zIndex: 3, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Trade selector bar (shown when + clicked) */}
          {showTradeBar && trades.length > 0 && (
            <div
              className="mb-3 flex items-center gap-2 animate-fade-in"
              style={{
                background: 'rgba(20,16,50,0.9)',
                border: '1px solid rgba(108,93,211,0.25)',
                borderRadius: 14,
                padding: '8px 12px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
                Trade:
              </span>
              <div className="relative flex-1">
                <select
                  value={selectedTradeId}
                  onChange={(e) => setSelectedTradeId(e.target.value)}
                  className="w-full appearance-none text-xs outline-none pr-6"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: selectedTradeId ? '#fff' : 'rgba(255,255,255,0.35)',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">None selected</option>
                  {trades.map((t) => (
                    <option key={t.id} value={t.id} style={{ background: '#1a1438' }}>
                      {t.pair} {t.type} · {new Date(t.created_at).toLocaleDateString()} · {t.pnl !== null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : 'Open'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </div>
            </div>
          )}

          {/* Suggestion chips */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-4 animate-fade-in">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs font-semibold px-4 py-2 rounded-full transition-all"
                  style={{
                    background: 'rgba(80,62,185,0.55)',
                    color: 'rgba(210,200,255,0.9)',
                    border: '1px solid rgba(108,93,211,0.35)',
                    fontFamily: 'var(--font-display)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(100,80,210,0.7)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(80,62,185,0.55)')}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input pill */}
          <div
            style={{
              background: 'rgba(28,26,36,0.92)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Textarea row */}
            <div className="flex items-center px-4 pt-3 pb-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                rows={1}
                className="flex-1 resize-none outline-none text-sm"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: '1.5',
                  maxHeight: 120,
                  overflow: 'auto',
                  caretColor: '#8B7CF8',
                }}
              />
            </div>

            {/* Toolbar row */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex items-center gap-0.5">
                {/* + button */}
                <button
                  onClick={() => setShowTradeBar((v) => !v)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    color: showTradeBar ? '#8B7CF8' : 'rgba(255,255,255,0.35)',
                    background: showTradeBar ? 'rgba(108,93,211,0.15)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Attach trade"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'default' }}
                >
                  <Globe className="w-4 h-4" />
                </button>

                <button
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'default' }}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>

                <button
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'default' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <span
                  className="text-[11px] font-bold ml-1 px-2 py-0.5 rounded-md"
                  style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'var(--font-display)',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  GPT-4o
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'default' }}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send / wave button */}
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                  style={{
                    background: input.trim() && !sending
                      ? 'linear-gradient(135deg,#7B6CF5,#5C4ED4)'
                      : 'rgba(108,93,211,0.4)',
                    border: 'none',
                    cursor: !input.trim() || sending ? 'not-allowed' : 'pointer',
                    boxShadow: input.trim() && !sending ? '0 0 16px rgba(108,93,211,0.5)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#fff' }} />
                  ) : (
                    /* Waveform bars */
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                      <rect x="0"  y="5" width="2.5" height="4"  rx="1.25" fill="white" opacity="0.7"/>
                      <rect x="4"  y="2" width="2.5" height="10" rx="1.25" fill="white"/>
                      <rect x="8"  y="0" width="2.5" height="14" rx="1.25" fill="white"/>
                      <rect x="12" y="2" width="2.5" height="10" rx="1.25" fill="white"/>
                      <rect x="16" y="5" width="2"   height="4"  rx="1"    fill="white" opacity="0.7"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
