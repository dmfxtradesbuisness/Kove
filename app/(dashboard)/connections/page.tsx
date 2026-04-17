'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, RefreshCw, ChevronRight, X, Upload, Loader2, Download, ArrowLeft } from 'lucide-react'

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://kovefx.com'

// ─── Code generators ──────────────────────────────────────────────────────────
function mt4Script(url: string) {
  return `#property strict
string KoveWebhookURL = "${url}";
int lastHistoryTotal = 0;
int OnInit() { lastHistoryTotal = OrdersHistoryTotal(); return INIT_SUCCEEDED; }
void OnTick() {
   int total = OrdersHistoryTotal();
   if (total <= lastHistoryTotal) return;
   for (int i = lastHistoryTotal; i < total; i++) {
      if (!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY)) continue;
      if (OrderType() != OP_BUY && OrderType() != OP_SELL) continue;
      string pair = OrderSymbol();
      if (StringLen(pair) == 6) pair = StringSubstr(pair,0,3)+"/"+StringSubstr(pair,3,3);
      string dir = (OrderType() == OP_BUY) ? "BUY" : "SELL";
      string json = StringFormat("{\\"pair\\":\\"%s\\",\\"type\\":\\"%s\\",\\"entry_price\\":%.5f,\\"exit_price\\":%.5f,\\"stop_loss\\":%.5f,\\"take_profit\\":%.5f,\\"lot_size\\":%.2f,\\"pnl\\":%.2f,\\"external_id\\":\\"%d\\"}",
         pair,dir,OrderOpenPrice(),OrderClosePrice(),OrderStopLoss(),OrderTakeProfit(),OrderLots(),OrderProfit(),OrderTicket());
      char data[]; char result[]; string hdrs="Content-Type: application/json\\r\\n"; string rh;
      StringToCharArray(json,data,0,StringLen(json));
      WebRequest("POST",KoveWebhookURL,hdrs,5000,data,result,rh);
   }
   lastHistoryTotal = total;
}`
}

function mt5Script(url: string) {
  return `#property strict
string KoveWebhookURL = "${url}";
ulong lastDeal = 0;
int OnInit() { HistorySelect(0,TimeCurrent()); int n=HistoryDealsTotal(); if(n>0) lastDeal=HistoryDealGetTicket(n-1); return INIT_SUCCEEDED; }
void OnTick() {
   HistorySelect(0,TimeCurrent()); int total=HistoryDealsTotal();
   for(int i=total-1;i>=0;i--) {
      ulong ticket=HistoryDealGetTicket(i); if(ticket<=lastDeal) break;
      long dt=HistoryDealGetInteger(ticket,DEAL_TYPE); long de=HistoryDealGetInteger(ticket,DEAL_ENTRY);
      if(de!=DEAL_ENTRY_OUT||( dt!=DEAL_TYPE_BUY&&dt!=DEAL_TYPE_SELL)) continue;
      string sym=HistoryDealGetString(ticket,DEAL_SYMBOL); string dir=(dt==DEAL_TYPE_BUY)?"BUY":"SELL";
      string json=StringFormat("{\\"pair\\":\\"%s\\",\\"type\\":\\"%s\\",\\"exit_price\\":%.5f,\\"lot_size\\":%.2f,\\"pnl\\":%.2f,\\"external_id\\":\\"%I64d\\"}",
         sym,dir,HistoryDealGetDouble(ticket,DEAL_PRICE),HistoryDealGetDouble(ticket,DEAL_VOLUME),HistoryDealGetDouble(ticket,DEAL_PROFIT),ticket);
      char data[]; char result[]; string hdrs="Content-Type: application/json\\r\\n"; string rh;
      StringToCharArray(json,data,0,StringLen(json));
      WebRequest("POST",KoveWebhookURL,hdrs,5000,data,result,rh);
   }
   if(total>0) lastDeal=HistoryDealGetTicket(total-1);
}`
}

function ninjaScript(url: string) {
  return `using System; using System.Net; using System.Text; using System.Globalization;
using NinjaTrader.Cbi; using NinjaTrader.NinjaScript.Strategies;

namespace NinjaTrader.NinjaScript.Strategies {
  public class KoveFXTracker : Strategy {
    private int lastTradeCount = 0;

    protected override void OnStateChange() {
      if (State == State.SetDefaults) {
        Name = "KoveFX Tracker"; Calculate = Calculate.OnBarClose; BarsRequiredToTrade = 1;
      } else if (State == State.Realtime) {
        lastTradeCount = SystemPerformance.AllTrades.Count;
      }
    }

    protected override void OnBarUpdate() {
      if (State != State.Realtime) return;
      int count = SystemPerformance.AllTrades.Count;
      if (count <= lastTradeCount) return;
      for (int i = lastTradeCount; i < count; i++) PostTrade(SystemPerformance.AllTrades[i]);
      lastTradeCount = count;
    }

    private void PostTrade(Trade t) {
      try {
        string dir = (t.TradeAction == TradeAction.Buy) ? "BUY" : "SELL";
        string sym = Instrument.MasterInstrument.Name;
        string json = string.Format(CultureInfo.InvariantCulture,
          "{\\"pair\\":\\"{0}\\",\\"type\\":\\"{1}\\",\\"entry_price\\":{2},\\"exit_price\\":{3},\\"lot_size\\":{4},\\"pnl\\":{5},\\"external_id\\":\\"{6}\\"}" ,
          sym, dir, t.Entry.Price, t.Exit.Price, t.Quantity, t.ProfitCurrency, t.Entry.Execution.ExecutionId);
        byte[] bytes = Encoding.UTF8.GetBytes(json);
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create("${url}");
        req.Method = "POST"; req.ContentType = "application/json"; req.ContentLength = bytes.Length; req.Timeout = 5000;
        using (var s = req.GetRequestStream()) s.Write(bytes, 0, bytes.Length);
        req.GetResponse().Dispose();
      } catch {}
    }
  }
}`
}

// ─── Broker definitions ───────────────────────────────────────────────────────
type SetupType = 'ninja' | 'mt4' | 'mt5' | 'csv'

interface Broker {
  id: string
  name: string
  category: string
  setup: SetupType
  color: string
  steps: string[]
  note?: string
}

const BROKERS: Broker[] = [
  {
    id: 'topstep', name: 'Topstep', category: 'Futures Prop Firm', setup: 'ninja', color: '#3B82F6',
    steps: ['Download the KoveFX script below', 'Open NinjaTrader → Tools → Edit NinjaScript → Import', 'Add the strategy to any chart — trades sync automatically'],
  },
  {
    id: 'apex', name: 'Apex Trader Funding', category: 'Futures Prop Firm', setup: 'ninja', color: '#F59E0B',
    steps: ['Download the KoveFX script below', 'Open NinjaTrader → Tools → Edit NinjaScript → Import', 'Add the strategy to any chart — trades sync automatically'],
  },
  {
    id: 'lucid', name: 'Lucid Trading', category: 'Futures Prop Firm', setup: 'ninja', color: '#8B5CF6',
    steps: ['Download the KoveFX script below', 'Open NinjaTrader → Tools → Edit NinjaScript → Import', 'Add the strategy to any chart — trades sync automatically'],
  },
  {
    id: 'alpha', name: 'Alpha Futures', category: 'Futures Prop Firm', setup: 'ninja', color: '#EF4444',
    steps: ['Download the KoveFX script below', 'Open NinjaTrader → Tools → Edit NinjaScript → Import', 'Add the strategy to any chart — trades sync automatically'],
  },
  {
    id: 'bulenox', name: 'Bulenox', category: 'Futures Prop Firm', setup: 'ninja', color: '#10B981',
    steps: ['Download the KoveFX script below', 'Open NinjaTrader → Tools → Edit NinjaScript → Import', 'Add the strategy to any chart — trades sync automatically'],
  },
  {
    id: 'earn2trade', name: 'Earn2Trade', category: 'Futures Prop Firm', setup: 'ninja', color: '#06B6D4',
    steps: ['Download the KoveFX script below', 'Open NinjaTrader → Tools → Edit NinjaScript → Import', 'Add the strategy to any chart — trades sync automatically'],
  },
  {
    id: 'ftmo', name: 'FTMO', category: 'Forex Prop Firm', setup: 'mt4', color: '#1D4ED8',
    steps: ['Download the KoveFX EA below', 'Open MetaEditor (press F4 in MT4) → File → Open → select the file', 'Press F7 to compile, then drag the EA onto any chart'],
    note: 'Also go to Tools → Options → Expert Advisors → enable "Allow WebRequest" → add kovefx.com',
  },
  {
    id: 'the5ers', name: 'The5ers', category: 'Forex Prop Firm', setup: 'mt4', color: '#065F46',
    steps: ['Download the KoveFX EA below', 'Open MetaEditor (press F4 in MT4) → File → Open → select the file', 'Press F7 to compile, then drag the EA onto any chart'],
    note: 'Also go to Tools → Options → Expert Advisors → enable "Allow WebRequest" → add kovefx.com',
  },
  {
    id: 'myfundedfx', name: 'MyFundedFX', category: 'Forex Prop Firm', setup: 'mt5', color: '#7C3AED',
    steps: ['Download the KoveFX EA below', 'Open MetaEditor (press F4 in MT5) → File → Open → select the file', 'Press F7 to compile, then drag the EA onto any chart'],
    note: 'Also go to Tools → Options → Expert Advisors → enable "Allow WebRequest" → add kovefx.com',
  },
  {
    id: 'csv', name: 'Any other broker', category: 'CSV Import', setup: 'csv', color: '#6B7280',
    steps: ['Export your trade history as CSV from your broker or platform', 'Upload the file below — we auto-detect the columns', 'Your trades import instantly'],
  },
]

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
      style={{ fontFamily: 'var(--font-display)', background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.07)', border: `1px solid ${copied ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#34D399' : 'rgba(255,255,255,0.5)', cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ─── Download helper ──────────────────────────────────────────────────────────
function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

// ─── Setup modal ──────────────────────────────────────────────────────────────
function SetupModal({ broker, webhookUrl, onClose, fileRef, importing, importResult, onCsvChange }: {
  broker: Broker
  webhookUrl: string
  onClose: () => void
  fileRef: React.RefObject<HTMLInputElement>
  importing: boolean
  importResult: { ok?: string; err?: string } | null
  onCsvChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const scriptContent = broker.setup === 'ninja' ? ninjaScript(webhookUrl)
    : broker.setup === 'mt4' ? mt4Script(webhookUrl)
    : broker.setup === 'mt5' ? mt5Script(webhookUrl)
    : ''

  const filename = broker.setup === 'ninja' ? 'KoveFX_Tracker.cs'
    : broker.setup === 'mt4' ? 'KoveFX_EA.mq4'
    : 'KoveFX_EA.mq5'

  const scriptLabel = broker.setup === 'ninja' ? 'NinjaScript (.cs)'
    : broker.setup === 'mt4' ? 'MT4 Expert Advisor (.mq4)'
    : broker.setup === 'mt5' ? 'MT5 Expert Advisor (.mq5)'
    : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full md:max-w-lg max-h-[92vh] overflow-y-auto"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px 20px 0 0', boxShadow: '0 -20px 60px rgba(0,0,0,0.8)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 md:hidden">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${broker.color}20`, border: `1px solid ${broker.color}40` }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: broker.color, fontFamily: 'var(--font-display)' }}>
                {broker.name[0]}
              </span>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{broker.name}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{broker.category}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">

          {/* Steps */}
          <div className="flex flex-col gap-3">
            {broker.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${broker.color}20`, border: `1px solid ${broker.color}40` }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: broker.color }}>{i + 1}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.6 }}>{step}</p>
              </div>
            ))}
          </div>

          {/* Warning note for MT4/MT5 */}
          {broker.note && (
            <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.85)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
              ⚠ {broker.note}
            </div>
          )}

          {/* Script download / CSV upload */}
          {broker.setup !== 'csv' ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => downloadFile(filename, scriptContent)}
                className="flex items-center justify-center gap-2.5 w-full h-12 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: `${broker.color}20`, border: `1px solid ${broker.color}40`, color: broker.color, cursor: 'pointer', fontFamily: 'var(--font-display)' }}
              >
                <Download className="w-4 h-4" />
                Download {scriptLabel}
              </button>

              <details className="group">
                <summary style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'rgba(255,255,255,0.25)', cursor: 'pointer', listStyle: 'none', userSelect: 'none' }}
                  className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                  View raw code
                </summary>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex justify-end">
                    <CopyBtn text={scriptContent} />
                  </div>
                  <pre className="text-xs overflow-x-auto rounded-xl p-3"
                    style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', color: '#a5b4c8', fontFamily: 'monospace', lineHeight: 1.6, maxHeight: 280, margin: 0 }}>
                    {scriptContent}
                  </pre>
                </div>
              </details>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {importResult && (
                <div className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: importResult.ok ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${importResult.ok ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, color: importResult.ok ? '#34D399' : '#F87171', fontFamily: 'var(--font-body)' }}>
                  {importResult.ok ?? importResult.err}
                </div>
              )}
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={onCsvChange} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={importing}
                className="flex items-center justify-center gap-2.5 w-full h-12 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(108,93,211,0.1)', border: '1px dashed rgba(108,93,211,0.35)', color: importing ? 'rgba(139,124,248,0.5)' : '#8B7CF8', cursor: importing ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)' }}>
                {importing ? <><Loader2 className="w-4 h-4 animate-spin" />Importing…</> : <><Upload className="w-4 h-4" />Upload CSV</>}
              </button>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
                Supports NinjaTrader, Tradovate, Topstep, FTMO, MT4/MT5, Interactive Brokers exports
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const [token, setToken]     = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState(true)
  const [selected, setSelected] = useState<Broker | null>(null)
  const [regen, setRegen]     = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ ok?: string; err?: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/connections').then(r => r.json()).then(d => { if (d.webhook_token) setToken(d.webhook_token) }).catch(() => {}).finally(() => setLoadingToken(false))
  }, [])

  async function regenerate() {
    setRegen(true)
    const res = await fetch('/api/connections', { method: 'POST' })
    const d = await res.json()
    if (d.webhook_token) setToken(d.webhook_token)
    setRegen(false)
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)
    setImportResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/trades/import', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) setImportResult({ err: data.error })
      else setImportResult({ ok: `✓ Imported ${data.imported} trade${data.imported !== 1 ? 's' : ''} successfully.` })
    } catch {
      setImportResult({ err: 'Upload failed — please try again.' })
    } finally {
      setImporting(false)
    }
  }

  const webhookUrl = token ? `${BASE_URL}/api/webhook/${token}` : ''

  const futures = BROKERS.filter(b => b.category === 'Futures Prop Firm')
  const forex   = BROKERS.filter(b => b.category === 'Forex Prop Firm')
  const other   = BROKERS.filter(b => b.category === 'CSV Import')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          Connect Your Broker
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0 0' }}>
          Auto-sync trades from your prop firm or broker
        </p>
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col gap-6" style={{ maxWidth: 700 }}>

        {/* Futures prop firms */}
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, margin: '0 0 12px 0' }}>
            Futures Prop Firms
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {futures.map(broker => (
              <button key={broker.id} onClick={() => setSelected(broker)}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all group"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${broker.color}50`; (e.currentTarget as HTMLElement).style.background = `${broker.color}08` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = '#111' }}
              >
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{broker.name}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0 0' }}>NinjaTrader</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Forex prop firms */}
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0' }}>
            Forex Prop Firms
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {forex.map(broker => (
              <button key={broker.id} onClick={() => setSelected(broker)}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${broker.color}50`; (e.currentTarget as HTMLElement).style.background = `${broker.color}08` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = '#111' }}
              >
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{broker.name}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0 0' }}>{broker.setup === 'mt5' ? 'MT5' : 'MT4'}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* CSV / Other */}
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0' }}>
            Other / Import
          </p>
          <div className="grid grid-cols-1 gap-3">
            {other.map(broker => (
              <button key={broker.id} onClick={() => setSelected(broker)}
                className="flex items-center justify-between px-4 py-4 rounded-2xl text-left transition-all"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,124,248,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(108,93,211,0.06)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = '#111' }}
              >
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Import from CSV</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0 0' }}>
                    Tradovate, Interactive Brokers, Rithmic, any other platform
                  </p>
                </div>
                <Upload className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Webhook token — for advanced users, collapsed */}
        <details className="group">
          <summary style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'rgba(255,255,255,0.2)', cursor: 'pointer', listStyle: 'none', userSelect: 'none' }}
            className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
            Advanced — raw webhook URL
          </summary>
          <div className="mt-3 p-4 rounded-2xl flex flex-col gap-3" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)' }}>
            {loadingToken ? (
              <div className="h-9 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ) : (
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 text-xs rounded-lg px-3 py-2.5 overflow-x-auto"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#8B7CF8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {webhookUrl}
                </code>
                <CopyBtn text={webhookUrl} />
              </div>
            )}
            <button onClick={regenerate} disabled={regen}
              className="flex items-center gap-1.5 text-xs self-start px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-display)', cursor: 'pointer' }}>
              <RefreshCw className={`w-3 h-3 ${regen ? 'animate-spin' : ''}`} />
              Regenerate token
            </button>
          </div>
        </details>

      </div>

      {/* Setup modal */}
      {selected && (
        <SetupModal
          broker={selected}
          webhookUrl={webhookUrl}
          onClose={() => { setSelected(null); setImportResult(null) }}
          fileRef={fileRef as React.RefObject<HTMLInputElement>}
          importing={importing}
          importResult={importResult}
          onCsvChange={handleCsvImport}
        />
      )}
    </div>
  )
}
