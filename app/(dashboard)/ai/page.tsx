'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Loader2, Plus,
  BarChart2, ChevronDown, AlertCircle,
} from 'lucide-react'
import type { Trade } from '@/lib/types'
import { ProGate } from '@/components/ProGate'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  loading?: boolean
  error?: boolean
}

// ─── Suggestion chips ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Where am I leaking the most money?',
  'Am I revenge trading?',
  'Break down my last 20 trades',
  'What time of day do I trade best?',
  'Am I cutting winners too early?',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2)
}

/** Render markdown: **bold**, bullet lists */
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, li) => {
    const isBullet = /^[-•*]\s/.test(line)
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    const rendered = parts.map((seg, si) =>
      seg.startsWith('**') && seg.endsWith('**')
        ? <strong key={si} style={{ color: '#fff', fontWeight: 700 }}>{seg.slice(2, -2)}</strong>
        : <span key={si}>{isBullet && si === 0 ? seg.replace(/^[-•*]\s/, '') : seg}</span>
    )
    return (
      <div key={li} style={{
        marginBottom: li < lines.length - 1 ? (isBullet ? 3 : 6) : 0,
        paddingLeft: isBullet ? 12 : 0,
        position: 'relative',
      }}>
        {isBullet && (
          <span style={{ position: 'absolute', left: 2, top: 0, color: 'rgba(77,144,255,0.8)', fontSize: 10 }}>•</span>
        )}
        {rendered}
      </div>
    )
  })
}

// ─── Orb ─────────────────────────────────────────────────────────────────────
function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', ...style }} />
  )
}

// ─── Bubble ──────────────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div
      className="flex animate-fade-in"
      style={{ justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16 }}
    >
      {!isUser && (
        <div
          style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg,rgba(30,110,255,0.8),rgba(10,40,140,0.85))',
            border: '1px solid rgba(30,110,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 10, marginTop: 4,
          }}
        >
          <BarChart2 style={{ width: 13, height: 13, color: 'rgba(160,200,255,0.9)' }} />
        </div>
      )}
      <div
        style={{
          maxWidth: '72%',
          padding: isUser ? '10px 16px' : '14px 18px',
          borderRadius: isUser ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
          background: isUser
            ? 'rgba(230,230,240,0.93)'
            : 'rgba(8,14,32,0.92)',
          color: isUser ? '#111' : 'rgba(210,225,255,0.9)',
          fontSize: 13.5,
          lineHeight: '1.7',
          fontFamily: 'var(--font-body)',
          backdropFilter: 'blur(12px)',
          border: isUser
            ? '1px solid rgba(255,255,255,0.15)'
            : '1px solid rgba(30,110,255,0.2)',
          boxShadow: isUser
            ? '0 2px 16px rgba(0,0,0,0.3)'
            : '0 4px 28px rgba(10,30,80,0.25)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {msg.loading ? (
          <span className="flex items-center gap-2" style={{ color: 'rgba(130,180,255,0.5)' }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span style={{ fontSize: 12 }}>Thinking…</span>
          </span>
        ) : msg.error ? (
          <span className="flex items-start gap-2" style={{ color: '#F87171' }}>
            <AlertCircle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }} />
            <span>{msg.text}</span>
          </span>
        ) : (
          renderMarkdown(msg.text)
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AIPage() {
  const [subscribed, setSubscribed]           = useState<boolean | null>(null)
  const [trades, setTrades]                   = useState<Trade[]>([])
  const [checking, setChecking]               = useState(true)
  const [messages, setMessages]               = useState<Message[]>([])
  const [input, setInput]                     = useState('')
  const [sending, setSending]                 = useState(false)
  const [selectedTradeId, setSelectedTradeId] = useState('')
  const [showTradeBar, setShowTradeBar]       = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function init() {
      try {
        const [subRes, tradesRes, checkRes] = await Promise.all([
          fetch('/api/stripe/subscription-status'),
          fetch('/api/trades'),
          fetch('/api/ai/daily-check'),
        ])
        const subData    = await subRes.json()
        const tradesData = await tradesRes.json()
        const checkData  = checkRes.ok ? await checkRes.json() : null
        setSubscribed(subData.active === true)
        if (tradesData.trades) setTrades(tradesData.trades)

        // Auto-inject proactive insights as first AI message if alerts exist
        if (subData.active === true && checkData?.alerts?.length > 0) {
          const alerts: { message: string; severity: string }[] = checkData.alerts
          const dangerAlerts  = alerts.filter((a) => a.severity === 'danger')
          const warnAlerts    = alerts.filter((a) => a.severity === 'warning')
          const infoAlerts    = alerts.filter((a) => a.severity === 'info')

          let intro = ''
          if (dangerAlerts.length > 0) {
            intro = `🚨 **Stop and read this.**\n\n`
          } else if (warnAlerts.length > 0) {
            intro = `⚠️ **Heads up — I noticed something.**\n\n`
          } else {
            intro = `📊 **Today's session check-in:**\n\n`
          }

          const body = alerts.map((a) => `- ${a.message}`).join('\n')
          const footer = checkData.todayCount > 0
            ? `\n\nYou've taken **${checkData.todayCount} trade${checkData.todayCount !== 1 ? 's' : ''}** today${checkData.winRateToday !== null ? ` with a ${checkData.winRateToday}% win rate` : ''}. Ask me anything — I'm here to help you trade better, not just more.`
            : `\n\nNo trades logged yet today. How are you planning your session?`

          setMessages([{
            id: uid(),
            role: 'assistant',
            text: intro + body + footer,
          }])
        }
      } catch {
        setSubscribed(false)
      } finally {
        setChecking(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async (text: string) => {
    if (!text.trim() || sending) return
    setSending(true)

    const userMsg: Message = { id: uid(), role: 'user', text: text.trim() }
    const loadingMsg: Message = { id: uid(), role: 'assistant', text: '', loading: true }

    setMessages((prev) => [...prev, userMsg, loadingMsg])
    setInput('')

    // Build conversation history for the API (user+assistant pairs, plain text)
    const history = messages
      .filter((m) => !m.loading && !m.error)
      .map((m) => ({ role: m.role, content: m.text }))
    history.push({ role: 'user', content: text.trim() })

    // Attach selected trade context if any
    const tradeContext = trades.find((t) => t.id === selectedTradeId) ?? null

    try {
      const res  = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages:     history,
          tradeContext: tradeContext ?? undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.loading ? { ...m, text: data.error ?? 'Something went wrong. Please try again.', loading: false, error: true } : m
          )
        )
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.loading ? { ...m, text: data.reply, loading: false } : m
          )
        )
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? { ...m, text: 'Network error — check your connection and try again.', loading: false, error: true }
            : m
        )
      )
    } finally {
      setSending(false)
    }
  }, [messages, sending, selectedTradeId, trades])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%', minHeight: '60vh' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.08)', borderTopColor: 'rgba(77,144,255,0.5)' }} />
      </div>
    )
  }

  // ── Upgrade wall ─────────────────────────────────────────────────────────
  if (!subscribed) {
    return (
      <ProGate
        title="KoveAI"
        description="Your AI trading coach — powered by GPT-4.1. It reads every trade you've logged, spots the patterns you're missing, and tells you exactly what's costing you money."
      />
    )
  }

  // ── Main chat UI ─────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex flex-col overflow-hidden h-[calc(100dvh-56px)] md:h-screen"
      style={{ background: '#080808' }}
    >
      {/* Orbs */}
      <Orb style={{ width: 560, height: 560, top: -160, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle,rgba(10,50,140,0.8) 0%,rgba(8,25,80,0.35) 55%,transparent 100%)', zIndex: 0 }} />
      <Orb style={{ width: 320, height: 320, top: 20, left: -80, background: 'radial-gradient(circle,rgba(10,30,100,0.5) 0%,transparent 70%)', zIndex: 0 }} />
      <Orb style={{ width: 280, height: 280, top: 40, right: -60, background: 'radial-gradient(circle,rgba(15,35,100,0.45) 0%,transparent 70%)', zIndex: 0 }} />
      <Orb style={{ width: 340, height: 340, bottom: -100, left: -80, background: 'radial-gradient(circle,rgba(8,20,80,0.45) 0%,transparent 70%)', zIndex: 0 }} />
      <Orb style={{ width: 300, height: 300, bottom: -60, right: -60, background: 'radial-gradient(circle,rgba(10,28,90,0.45) 0%,transparent 70%)', zIndex: 0 }} />

      {/* KoveAI brand — empty state */}
      {messages.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
          <div
            style={{
              background: 'radial-gradient(circle at center, rgba(20,60,180,0.12) 0%, transparent 80%)',
              padding: '24px 40px',
              borderRadius: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'rgba(30,110,255,0.12)',
              border: '1px solid rgba(30,110,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 4,
            }}>
              <BarChart2 style={{ width: 22, height: 22, color: 'rgba(77,144,255,0.8)' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 800,
                color: 'rgba(130,180,255,0.55)',
                letterSpacing: '-0.03em',
              }}
            >
              KoveAI
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
              Knows your trades. Tells you the truth.
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto relative" style={{ zIndex: 2 }}>
        {/* Spacer pushes messages to the bottom when chat is short */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <div style={{ flex: 1 }} />
          {messages.length > 0 && (
            <div style={{ maxWidth: 700, width: '100%', margin: '0 auto', padding: '16px 20px 16px' }}>
              {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative flex-shrink-0" style={{ zIndex: 3, padding: '0 20px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          {/* Trade selector bar */}
          {showTradeBar && trades.length > 0 && (
            <div
              className="mb-3 flex items-center gap-2 animate-fade-in"
              style={{
                background: 'rgba(6,12,28,0.92)',
                border: '1px solid rgba(30,110,255,0.25)',
                borderRadius: 14,
                padding: '8px 14px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Trade context:
              </span>
              <div className="relative flex-1">
                <select
                  value={selectedTradeId}
                  onChange={(e) => setSelectedTradeId(e.target.value)}
                  className="w-full appearance-none text-xs outline-none pr-6"
                  style={{ background: 'transparent', border: 'none', color: selectedTradeId ? '#fff' : 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                >
                  <option value="">None — general chat</option>
                  {trades.map((t) => (
                    <option key={t.id} value={t.id} style={{ background: '#080e20' }}>
                      {t.pair} {t.type} · {new Date(t.created_at).toLocaleDateString()} · {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : 'Open'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
              </div>
            </div>
          )}

          {showTradeBar && trades.length === 0 && (
            <div className="mb-3 animate-fade-in" style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>
              No trades logged yet — chat without context or log a trade first.
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
                    background: 'rgba(20,60,180,0.35)',
                    color: 'rgba(160,200,255,0.9)',
                    border: '1px solid rgba(30,110,255,0.3)',
                    fontFamily: 'var(--font-display)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(30,80,210,0.55)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(20,60,180,0.35)')}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input pill */}
          <div
            style={{
              background: 'rgba(6,10,22,0.96)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
              overflow: 'hidden',
            }}
          >
            {/* Textarea */}
            <div className="flex items-center px-4 pt-3.5 pb-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  // Auto-resize
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything — I know your numbers."
                rows={1}
                className="flex-1 resize-none outline-none text-sm"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.88)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: '1.55',
                  maxHeight: 130,
                  overflow: 'auto',
                  caretColor: '#4D90FF',
                  fontSize: 13.5,
                }}
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex items-center gap-1">
                {/* Trade attach */}
                <button
                  onClick={() => setShowTradeBar((v) => !v)}
                  title="Attach a trade for analysis"
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: showTradeBar ? '#4D90FF' : 'rgba(255,255,255,0.32)',
                    background: showTradeBar ? 'rgba(30,110,255,0.15)' : 'none',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Plus style={{ width: 15, height: 15 }} />
                </button>

                <span style={{
                  fontSize: 10, fontWeight: 700, marginLeft: 2,
                  padding: '2px 8px', borderRadius: 6,
                  color: 'rgba(255,255,255,0.22)',
                  fontFamily: 'var(--font-display)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  GPT-4.1
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Send button */}
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || sending}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: input.trim() && !sending
                      ? 'linear-gradient(135deg,#1E6EFF,#1050CC)'
                      : 'rgba(30,110,255,0.3)',
                    border: 'none',
                    cursor: !input.trim() || sending ? 'not-allowed' : 'pointer',
                    boxShadow: input.trim() && !sending ? '0 0 18px rgba(30,110,255,0.5)' : 'none',
                    transition: 'all 0.18s',
                    opacity: !input.trim() && !sending ? 0.5 : 1,
                  }}
                >
                  {sending ? (
                    <Loader2 style={{ width: 14, height: 14, color: '#fff' }} className="animate-spin" />
                  ) : (
                    <svg width="16" height="13" viewBox="0 0 18 14" fill="none">
                      <rect x="0"  y="5" width="2.5" height="4"  rx="1.25" fill="white" opacity="0.65"/>
                      <rect x="4"  y="2" width="2.5" height="10" rx="1.25" fill="white"/>
                      <rect x="8"  y="0" width="2.5" height="14" rx="1.25" fill="white"/>
                      <rect x="12" y="2" width="2.5" height="10" rx="1.25" fill="white"/>
                      <rect x="16" y="5" width="2"   height="4"  rx="1"   fill="white" opacity="0.65"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-body)', marginTop: 10 }}>
            KoveAI reads your real trade data. Always verify before changing your strategy.
          </p>
        </div>
      </div>
    </div>
  )
}
