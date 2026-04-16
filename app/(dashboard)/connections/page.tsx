'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, RefreshCw, Zap, AlertTriangle } from 'lucide-react'

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://kovefx.com'

// ─── MT4 EA code template ─────────────────────────────────────────────────────
function eaCode(webhookUrl: string) {
  return `//+------------------------------------------------------------------+
//| KoveFX Auto-Journal EA for MT4                                   |
//| Paste this into MetaEditor, compile, and attach to any chart.    |
//| Attach once — it runs in the background and logs every closed    |
//| trade to your KoveFX journal automatically.                      |
//+------------------------------------------------------------------+
#property strict

string KoveWebhookURL = "${webhookUrl}";
int    lastHistoryTotal = 0;

int OnInit() {
   lastHistoryTotal = OrdersHistoryTotal();
   return INIT_SUCCEEDED;
}

void OnTick() {
   int histTotal = OrdersHistoryTotal();
   if (histTotal <= lastHistoryTotal) return;

   for (int i = histTotal - 1; i >= lastHistoryTotal; i--) {
      if (!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY)) continue;
      if (OrderType() != OP_BUY && OrderType() != OP_SELL) continue;

      string pair = OrderSymbol();

      // Normalize 6-char pairs to XXX/YYY format
      if (StringLen(pair) == 6)
         pair = StringSubstr(pair,0,3) + "/" + StringSubstr(pair,3,3);

      string direction = (OrderType() == OP_BUY) ? "BUY" : "SELL";

      string json = StringFormat(
         "{\"pair\":\"%s\",\"type\":\"%s\","
         "\"entry_price\":%.5f,\"exit_price\":%.5f,"
         "\"stop_loss\":%.5f,\"take_profit\":%.5f,"
         "\"lot_size\":%.2f,\"pnl\":%.2f,"
         "\"external_id\":\"%d\"}",
         pair, direction,
         OrderOpenPrice(), OrderClosePrice(),
         OrderStopLoss(), OrderTakeProfit(),
         OrderLots(), OrderProfit(),
         OrderTicket()
      );

      char   postData[];
      char   result[];
      string headers = "Content-Type: application/json\\r\\n";
      string responseHeaders;

      StringToCharArray(json, postData, 0, StringLen(json));
      WebRequest("POST", KoveWebhookURL, headers, 5000, postData, result, responseHeaders);
   }

   lastHistoryTotal = histTotal;
}
//+------------------------------------------------------------------+`
}

// ─── MT5 EA code template ─────────────────────────────────────────────────────
function ea5Code(webhookUrl: string) {
  return `//+------------------------------------------------------------------+
//| KoveFX Auto-Journal EA for MT5                                   |
//+------------------------------------------------------------------+
#property strict

string KoveWebhookURL = "${webhookUrl}";
ulong  lastDealTicket = 0;

int OnInit() {
   HistorySelect(0, TimeCurrent());
   if (HistoryDealsTotal() > 0)
      lastDealTicket = HistoryDealGetTicket(HistoryDealsTotal() - 1);
   return INIT_SUCCEEDED;
}

void OnTick() {
   HistorySelect(0, TimeCurrent());
   int total = HistoryDealsTotal();

   for (int i = total - 1; i >= 0; i--) {
      ulong ticket = HistoryDealGetTicket(i);
      if (ticket <= lastDealTicket) break;

      long type = HistoryDealGetInteger(ticket, DEAL_TYPE);
      if (type != DEAL_TYPE_BUY && type != DEAL_TYPE_SELL) continue;
      long entry = HistoryDealGetInteger(ticket, DEAL_ENTRY);
      if (entry != DEAL_ENTRY_OUT) continue;

      string sym   = HistoryDealGetString(ticket, DEAL_SYMBOL);
      string dir   = (type == DEAL_TYPE_BUY) ? "BUY" : "SELL";
      double price = HistoryDealGetDouble(ticket, DEAL_PRICE);
      double pnl   = HistoryDealGetDouble(ticket, DEAL_PROFIT);
      double lots  = HistoryDealGetDouble(ticket, DEAL_VOLUME);

      string json = StringFormat(
         "{\"pair\":\"%s\",\"type\":\"%s\","
         "\"exit_price\":%.5f,\"lot_size\":%.2f,"
         "\"pnl\":%.2f,\"external_id\":\"%I64d\"}",
         sym, dir, price, lots, pnl, ticket
      );

      char   postData[];
      char   result[];
      string headers = "Content-Type: application/json\\r\\n";
      string responseHeaders;
      StringToCharArray(json, postData, 0, StringLen(json));
      WebRequest("POST", KoveWebhookURL, headers, 5000, postData, result, responseHeaders);
   }

   if (total > 0)
      lastDealTicket = HistoryDealGetTicket(total - 1);
}
//+------------------------------------------------------------------+`
}

// ─── Copy button ─────────────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.1)'}`,
        color: copied ? '#34D399' : 'rgba(255,255,255,0.5)',
        fontFamily: 'var(--font-display)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const [token, setToken]         = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const [regenerating, setRegen]  = useState(false)
  const [tab, setTab]             = useState<'mt4' | 'mt5' | 'api'>('mt4')

  useEffect(() => {
    fetch('/api/connections')
      .then((r) => r.json())
      .then((d) => { if (d.webhook_token) setToken(d.webhook_token) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function regenerateToken() {
    setRegen(true)
    try {
      const res  = await fetch('/api/connections', { method: 'POST' })
      const data = await res.json()
      if (data.webhook_token) setToken(data.webhook_token)
    } finally {
      setRegen(false)
    }
  }

  const webhookUrl = token ? `${BASE_URL}/api/webhook/${token}` : ''

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Broker Connection
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0 0' }}>
            Auto-sync trades from MT4, MT5, or any broker platform
          </p>
        </div>
      </div>

      <div className="flex-1 p-5 md:p-6 max-w-3xl flex flex-col gap-5">

        {/* Webhook URL card */}
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4" style={{ color: '#8B7CF8' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>
                Your Webhook URL
              </h2>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              This is your personal webhook. Keep it private — anyone with this URL can add trades to your journal.
            </p>
          </div>
          <div className="px-5 py-4">
            {loading ? (
              <div className="h-10 bg-white/[0.03] rounded-lg animate-pulse" />
            ) : (
              <div className="flex items-center gap-3">
                <code
                  className="flex-1 min-w-0 text-xs rounded-lg px-3 py-2.5 overflow-x-auto"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8B7CF8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}
                >
                  {webhookUrl || '—'}
                </code>
                <CopyButton text={webhookUrl} label="Copy URL" />
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={regenerateToken}
                disabled={regenerating}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', cursor: 'pointer' }}
              >
                <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                Regenerate token
              </button>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>
                Old URL will stop working
              </span>
            </div>
          </div>
        </Card>

        {/* How it works */}
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>
              How it works
            </h2>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            {[
              ['1', 'Copy the EA code below for your platform (MT4 or MT5)'],
              ['2', 'Open MetaEditor in your terminal → New → Expert Advisor → paste the code → compile'],
              ['3', 'In MT4/MT5 go to Tools → Options → Expert Advisors → check "Allow WebRequest" → add your webhook URL to the list'],
              ['4', 'Attach the EA to any chart — it runs silently and sends every closed trade to your journal'],
              ['5', 'Go back to your journal and you will see trades appear automatically. Then add a photo and notes.'],
            ].map(([num, text]) => (
              <div key={num} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(108,93,211,0.15)', border: '1px solid rgba(108,93,211,0.3)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: '#8B7CF8' }}>{num}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* EA code tabs */}
        <Card>
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1">
              {(['mt4', 'mt5', 'api'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: tab === t ? 'rgba(108,93,211,0.15)' : 'transparent',
                    color: tab === t ? '#8B7CF8' : 'rgba(255,255,255,0.3)',
                    border: tab === t ? '1px solid rgba(108,93,211,0.25)' : '1px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  {t === 'mt4' ? 'MT4 EA' : t === 'mt5' ? 'MT5 EA' : 'Raw API'}
                </button>
              ))}
            </div>
            {token && (tab === 'mt4' || tab === 'mt5') && (
              <CopyButton text={tab === 'mt4' ? eaCode(webhookUrl) : ea5Code(webhookUrl)} label="Copy code" />
            )}
            {tab === 'api' && token && (
              <CopyButton text={`curl -X POST ${webhookUrl} \\\n  -H "Content-Type: application/json" \\\n  -d '{"pair":"EUR/USD","type":"BUY","entry_price":1.085,"exit_price":1.092,"pnl":70.00}'`} label="Copy example" />
            )}
          </div>

          <div className="p-4">
            {tab === 'api' ? (
              <div className="flex flex-col gap-4">
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  POST JSON to your webhook URL from any platform, automation tool, or script.
                </p>
                <pre
                  className="text-xs overflow-x-auto rounded-xl p-4"
                  style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', color: '#a5f3c0', fontFamily: 'monospace', lineHeight: 1.7, margin: 0 }}
                >{`POST ${webhookUrl || 'YOUR_WEBHOOK_URL'}

{
  "pair":         "EUR/USD",       // required
  "type":         "BUY",           // required — BUY or SELL
  "entry_price":  1.08500,
  "exit_price":   1.09200,
  "stop_loss":    1.08000,
  "take_profit":  1.10000,
  "lot_size":     0.10,
  "pnl":          70.00,           // positive = profit
  "external_id":  "123456789",     // broker ticket — prevents duplicates
  "opened_at":    "2024-01-15T10:30:00Z"
}

// Response
{ "success": true, "trade_id": "uuid" }`}</pre>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(251,191,36,0.8)', margin: 0, lineHeight: 1.5 }}>
                    Before attaching the EA: go to <strong>Tools → Options → Expert Advisors</strong>, enable <strong>Allow WebRequest for listed URLs</strong>, and add <code style={{ fontFamily: 'monospace' }}>{typeof window !== 'undefined' ? window.location.origin : 'https://kovefx.com'}</code> to the list.
                  </p>
                </div>
                {loading ? (
                  <div className="h-64 bg-white/[0.02] rounded-xl animate-pulse" />
                ) : (
                  <pre
                    className="text-xs overflow-x-auto rounded-xl p-4"
                    style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', color: '#c9d1d9', fontFamily: 'monospace', lineHeight: 1.6, margin: 0, maxHeight: 420 }}
                  >
                    {tab === 'mt4' ? eaCode(webhookUrl) : ea5Code(webhookUrl)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Funded account note */}
        <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(108,93,211,0.06)', border: '1px solid rgba(108,93,211,0.14)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Funded accounts (FTMO, MyFundedFX, The5ers, etc.)</strong> — all funded accounts use MT4 or MT5. Follow the same steps above using your funded account terminal.
          </p>
        </div>

      </div>
    </div>
  )
}
