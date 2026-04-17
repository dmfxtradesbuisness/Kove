'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckCircle, Loader2, RefreshCw, LogOut, Upload, ChevronRight, X, Download, Copy, Check, Eye, EyeOff } from 'lucide-react'

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://kovefx.com'

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
      style={{ background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.07)', border: `1px solid ${copied ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#34D399' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function downloadFile(name: string, content: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
  a.download = name; a.click(); URL.revokeObjectURL(a.href)
}

// ─── EA code generators (used in "other methods" section) ─────────────────────
function mt4Code(url: string) {
  return `#property strict
string KoveWebhookURL = "${url}";
int last = 0;
int OnInit() { last = OrdersHistoryTotal(); return INIT_SUCCEEDED; }
void OnTick() {
   int total = OrdersHistoryTotal();
   if(total<=last) return;
   for(int i=last;i<total;i++) {
      if(!OrderSelect(i,SELECT_BY_POS,MODE_HISTORY)) continue;
      if(OrderType()!=OP_BUY&&OrderType()!=OP_SELL) continue;
      string p=OrderSymbol(); if(StringLen(p)==6) p=StringSubstr(p,0,3)+"/"+StringSubstr(p,3,3);
      string j=StringFormat("{\\"pair\\":\\"%s\\",\\"type\\":\\"%s\\",\\"entry_price\\":%.5f,\\"exit_price\\":%.5f,\\"lot_size\\":%.2f,\\"pnl\\":%.2f,\\"external_id\\":\\"%d\\"}",
         p,(OrderType()==OP_BUY)?"BUY":"SELL",OrderOpenPrice(),OrderClosePrice(),OrderLots(),OrderProfit(),OrderTicket());
      char d[];char r[];string h="Content-Type: application/json\\r\\n";string rh;
      StringToCharArray(j,d,0,StringLen(j));WebRequest("POST",KoveWebhookURL,h,5000,d,r,rh);
   }
   last=total;
}`
}

function ninjaCode(url: string) {
  return `using System;using System.Net;using System.Text;using System.Globalization;
using NinjaTrader.Cbi;using NinjaTrader.NinjaScript.Strategies;
namespace NinjaTrader.NinjaScript.Strategies {
  public class KoveFXTracker:Strategy {
    private int _last=0;
    protected override void OnStateChange() {
      if(State==State.SetDefaults){Name="KoveFX Tracker";Calculate=Calculate.OnBarClose;BarsRequiredToTrade=1;}
      else if(State==State.Realtime){_last=SystemPerformance.AllTrades.Count;}
    }
    protected override void OnBarUpdate() {
      if(State!=State.Realtime) return;
      int n=SystemPerformance.AllTrades.Count;
      for(int i=_last;i<n;i++){Post(SystemPerformance.AllTrades[i]);}
      _last=n;
    }
    private void Post(Trade t){
      try{
        string j=string.Format(CultureInfo.InvariantCulture,
          "{\\"pair\\":\\"{0}\\",\\"type\\":\\"{1}\\",\\"entry_price\\":{2},\\"exit_price\\":{3},\\"lot_size\\":{4},\\"pnl\\":{5},\\"external_id\\":\\"{6}\\"}" ,
          Instrument.MasterInstrument.Name,(t.TradeAction==TradeAction.Buy)?"BUY":"SELL",
          t.Entry.Price,t.Exit.Price,t.Quantity,t.ProfitCurrency,t.Entry.Execution.ExecutionId);
        byte[] b=Encoding.UTF8.GetBytes(j);
        var req=(HttpWebRequest)WebRequest.Create("${url}");
        req.Method="POST";req.ContentType="application/json";req.ContentLength=b.Length;req.Timeout=5000;
        using(var s=req.GetRequestStream())s.Write(b,0,b.Length);req.GetResponse().Dispose();
      }catch{}
    }
  }
}`
}

// ─── Tradovate login modal ─────────────────────────────────────────────────────
function TradovateModal({ onClose, onConnected }: { onClose: () => void; onConnected: (name: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [isDemo, setIsDemo]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function connect() {
    if (!username.trim() || !password) { setError('Please enter your username and password.'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/connections/tradovate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, is_demo: isDemo }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Connection failed.'); return }
      onConnected(data.account_name ?? username)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full md:max-w-sm animate-slide-up"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px 24px 0 0', padding: 0, boxShadow: '0 -24px 80px rgba(0,0,0,0.8)' }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 md:hidden">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Sign in with Tradovate</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0 0' }}>
              Topstep · Apex · Lucid · Alpha · Bulenox · Earn2Trade
            </p>
          </div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-8 flex flex-col gap-3">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tradovate Username</label>
            <input
              type="text" autoComplete="username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your@email.com"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#fff', fontFamily: 'var(--font-body)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(108,93,211,0.5)' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') connect() }}
                placeholder="••••••••"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 42px 12px 14px', fontSize: 14, color: '#fff', fontFamily: 'var(--font-body)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(108,93,211,0.5)' }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Demo toggle */}
          <button type="button" onClick={() => setIsDemo(v => !v)}
            className="flex items-center gap-2.5 text-xs self-start"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', padding: 0 }}>
            <div style={{ width: 32, height: 18, borderRadius: 9, background: isDemo ? '#8B7CF8' : 'rgba(255,255,255,0.1)', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: isDemo ? 16 : 2, transition: 'left 0.2s' }} />
            </div>
            Demo / paper trading account
          </button>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          {/* Connect button */}
          <button onClick={connect} disabled={loading}
            className="flex items-center justify-center gap-2 h-13 w-full rounded-2xl font-semibold text-sm transition-all mt-1"
            style={{ height: 52, background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)', border: 'none', color: '#fff', fontFamily: 'var(--font-display)', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 0 24px rgba(108,93,211,0.4)', opacity: loading ? 0.7 : 1 }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</> : 'Connect Account'}
          </button>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
            Your credentials are encrypted and only used to sync trades. We never store your password.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Other methods modal (MT4/MT5/NinjaTrader scripts + CSV) ──────────────────
function OtherMethodsModal({ webhookUrl, onClose, fileRef, importing, importResult, onCsvChange }: {
  webhookUrl: string
  onClose: () => void
  fileRef: React.RefObject<HTMLInputElement>
  importing: boolean
  importResult: { ok?: string; err?: string } | null
  onCsvChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [tab, setTab] = useState<'ninja' | 'mt4' | 'csv'>('ninja')

  const code = tab === 'ninja' ? ninjaCode(webhookUrl) : mt4Code(webhookUrl)
  const filename = tab === 'ninja' ? 'KoveFX_Tracker.cs' : 'KoveFX_EA.mq4'

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full md:max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px 24px 0 0', boxShadow: '0 -24px 80px rgba(0,0,0,0.8)' }}>

        <div className="flex justify-center pt-3 md:hidden">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>Other connection methods</h2>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-0">
          {(['ninja', 'mt4', 'csv'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: tab === t ? 'rgba(108,93,211,0.15)' : 'transparent', color: tab === t ? '#8B7CF8' : 'rgba(255,255,255,0.3)' }}>
              {t === 'ninja' ? 'NinjaTrader' : t === 'mt4' ? 'MT4/MT5' : 'CSV Import'}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-4">
          {tab !== 'csv' ? (
            <>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
                {tab === 'ninja'
                  ? 'For FTMO, The5ers, and other MT4/MT5 prop firms — download the EA, add it to MetaEditor, and drag onto any chart.'
                  : 'For Topstep, Apex, and other NinjaTrader platforms — download and import the strategy, then add it to any chart.'}
              </p>
              <button onClick={() => downloadFile(filename, code)}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'var(--font-display)', cursor: 'pointer' }}>
                <Download className="w-4 h-4" />
                Download {filename}
              </button>
              <details>
                <summary style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'rgba(255,255,255,0.2)', cursor: 'pointer', listStyle: 'none', userSelect: 'none' }}
                  className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3" />
                  View raw code
                </summary>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex justify-end"><CopyBtn text={code} /></div>
                  <pre className="text-xs overflow-x-auto rounded-xl p-3"
                    style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', color: '#a5b4c8', fontFamily: 'monospace', lineHeight: 1.6, maxHeight: 260, margin: 0 }}>
                    {code}
                  </pre>
                </div>
              </details>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
                Export your trade history as CSV from any platform and upload it here. Works with NinjaTrader, Tradovate, Rithmic, Interactive Brokers, and more.
              </p>
              {importResult && (
                <div className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: importResult.ok ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${importResult.ok ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, color: importResult.ok ? '#34D399' : '#F87171', fontFamily: 'var(--font-body)' }}>
                  {importResult.ok ?? importResult.err}
                </div>
              )}
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={onCsvChange} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={importing}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-semibold text-sm"
                style={{ background: 'rgba(108,93,211,0.1)', border: '1px dashed rgba(108,93,211,0.35)', color: importing ? 'rgba(139,124,248,0.5)' : '#8B7CF8', fontFamily: 'var(--font-display)', cursor: importing ? 'not-allowed' : 'pointer' }}>
                {importing ? <><Loader2 className="w-4 h-4 animate-spin" />Importing…</> : <><Upload className="w-4 h-4" />Upload CSV</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const [status, setStatus]           = useState<{ connected: boolean; account_name?: string; last_sync?: string; is_demo?: boolean } | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [showLogin, setShowLogin]     = useState(false)
  const [showOther, setShowOther]     = useState(false)
  const [syncing, setSyncing]         = useState(false)
  const [syncResult, setSyncResult]   = useState<{ ok?: string; err?: string } | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const [webhookToken, setWebhookToken] = useState<string | null>(null)
  const [importing, setImporting]     = useState(false)
  const [importResult, setImportResult] = useState<{ ok?: string; err?: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/connections/tradovate')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }))
      .finally(() => setLoadingStatus(false))

    // Get webhook token for other methods
    fetch('/api/connections')
      .then(r => r.json())
      .then(d => { if (d.webhook_token) setWebhookToken(d.webhook_token) })
      .catch(() => {})
  }, [])

  async function sync() {
    setSyncing(true); setSyncResult(null)
    try {
      const res  = await fetch('/api/connections/tradovate/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSyncResult({ err: data.error })
        if (res.status === 401) setStatus({ connected: false })
      } else {
        setSyncResult({ ok: data.synced === 0 ? 'Already up to date.' : `Synced ${data.synced} new trade${data.synced !== 1 ? 's' : ''}.` })
        // Refresh status to update last_sync
        const s = await fetch('/api/connections/tradovate').then(r => r.json())
        setStatus(s)
      }
    } catch {
      setSyncResult({ err: 'Sync failed. Check your connection.' })
    } finally {
      setSyncing(false)
    }
  }

  async function disconnect() {
    setDisconnecting(true)
    await fetch('/api/connections/tradovate', { method: 'DELETE' })
    setStatus({ connected: false })
    setSyncResult(null)
    setDisconnecting(false)
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    e.target.value = ''
    setImporting(true); setImportResult(null)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/trades/import', { method: 'POST', body: fd })
    const data = await res.json()
    setImportResult(res.ok ? { ok: `✓ Imported ${data.imported} trade${data.imported !== 1 ? 's' : ''}.` } : { err: data.error })
    setImporting(false)
  }

  const webhookUrl = webhookToken ? `${BASE_URL}/api/webhook/${webhookToken}` : ''
  const lastSyncStr = status?.last_sync ? new Date(status.last_sync).toLocaleString() : null

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          Connect Your Broker
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0 0' }}>
          Trades sync automatically when you close a position
        </p>
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col gap-5" style={{ maxWidth: 520 }}>

        {/* ── Tradovate card (main) ── */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>

          {/* Card header */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>Tradovate</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0 0' }}>
                  Topstep · Apex · Lucid · Alpha · Bulenox · Earn2Trade
                </p>
              </div>
              {status?.connected && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#34D399' }}>Connected</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-5">
            {loadingStatus ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
            ) : status?.connected ? (
              /* ── Connected state ── */
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>
                    {status.account_name}
                    {status.is_demo && <span style={{ marginLeft: 8, fontSize: 10, color: '#8B7CF8', background: 'rgba(108,93,211,0.15)', border: '1px solid rgba(108,93,211,0.25)', borderRadius: 4, padding: '1px 6px' }}>DEMO</span>}
                  </p>
                  {lastSyncStr && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                      Last synced {lastSyncStr}
                    </p>
                  )}
                </div>

                {syncResult && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: syncResult.ok ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${syncResult.ok ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, color: syncResult.ok ? '#34D399' : '#F87171', fontFamily: 'var(--font-body)' }}>
                    {syncResult.ok ?? syncResult.err}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button onClick={sync} disabled={syncing}
                    className="flex items-center gap-2 px-4 h-10 rounded-xl font-semibold text-sm flex-1 justify-center transition-all"
                    style={{ background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)', border: 'none', color: '#fff', fontFamily: 'var(--font-display)', cursor: syncing ? 'not-allowed' : 'pointer', opacity: syncing ? 0.7 : 1 }}>
                    {syncing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Syncing…</> : <><RefreshCw className="w-3.5 h-3.5" />Sync now</>}
                  </button>
                  <button onClick={disconnect} disabled={disconnecting}
                    className="flex items-center gap-2 px-4 h-10 rounded-xl font-semibold text-sm transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#F87171', fontFamily: 'var(--font-display)', cursor: 'pointer' }}>
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              /* ── Not connected state ── */
              <div className="flex flex-col gap-3">
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
                  Sign in once and your trades sync automatically every time you close a position. No scripts, no setup.
                </p>
                <button onClick={() => setShowLogin(true)}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-semibold text-sm transition-all"
                  style={{ background: 'linear-gradient(135deg,#7B6CF5,#5C4ED4)', border: 'none', color: '#fff', fontFamily: 'var(--font-display)', cursor: 'pointer', boxShadow: '0 0 24px rgba(108,93,211,0.3)' }}>
                  Sign in with Tradovate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── How it works ── */}
        {!status?.connected && (
          <div className="flex flex-col gap-2">
            {[
              ['Sign in', 'Enter your Tradovate username and password once'],
              ['Auto-sync', 'Every trade you close appears in your journal automatically'],
              ['Add context', 'Attach a chart screenshot and notes to any synced trade'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7CF8' }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{title}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '1px 0 0 0' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Other methods ── */}
        <button onClick={() => setShowOther(true)}
          className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}>
          <div className="text-left">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Other methods</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0 0' }}>MT4/MT5 EA · NinjaTrader script · CSV import</p>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
        </button>

      </div>

      {/* Modals */}
      {showLogin && (
        <TradovateModal
          onClose={() => setShowLogin(false)}
          onConnected={(name) => {
            setStatus({ connected: true, account_name: name })
            setShowLogin(false)
            sync()
          }}
        />
      )}
      {showOther && (
        <OtherMethodsModal
          webhookUrl={webhookUrl}
          onClose={() => { setShowOther(false); setImportResult(null) }}
          fileRef={fileRef as React.RefObject<HTMLInputElement>}
          importing={importing}
          importResult={importResult}
          onCsvChange={handleCsvImport}
        />
      )}
    </div>
  )
}
