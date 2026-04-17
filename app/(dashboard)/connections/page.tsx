'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, RefreshCw, Zap, AlertTriangle, Upload, Loader2, FileText } from 'lucide-react'

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://kovefx.com'

// ─── Code templates ────────────────────────────────────────────────────────────
function mt4Code(url: string) {
  return `//+------------------------------------------------------------------+
//| KoveFX Auto-Journal for MT4                                      |
//| Open MetaEditor → File → New → Expert Advisor → paste & compile |
//| Then attach to any chart. Logs every closed trade automatically. |
//+------------------------------------------------------------------+
#property strict

string KoveWebhookURL = "${url}";
int    lastHistoryTotal = 0;

int OnInit()  { lastHistoryTotal = OrdersHistoryTotal(); return INIT_SUCCEEDED; }

void OnTick() {
   int total = OrdersHistoryTotal();
   if (total <= lastHistoryTotal) return;
   for (int i = lastHistoryTotal; i < total; i++) {
      if (!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY)) continue;
      if (OrderType() != OP_BUY && OrderType() != OP_SELL) continue;
      string pair = OrderSymbol();
      if (StringLen(pair) == 6)
         pair = StringSubstr(pair,0,3) + "/" + StringSubstr(pair,3,3);
      string dir = (OrderType() == OP_BUY) ? "BUY" : "SELL";
      string json = StringFormat(
         "{\\"pair\\":\\"%s\\",\\"type\\":\\"%s\\","
         "\\"entry_price\\":%.5f,\\"exit_price\\":%.5f,"
         "\\"stop_loss\\":%.5f,\\"take_profit\\":%.5f,"
         "\\"lot_size\\":%.2f,\\"pnl\\":%.2f,\\"external_id\\":\\"%d\\"}",
         pair, dir, OrderOpenPrice(), OrderClosePrice(),
         OrderStopLoss(), OrderTakeProfit(), OrderLots(),
         OrderProfit(), OrderTicket());
      char data[]; char result[]; string hdrs = "Content-Type: application/json\\r\\n"; string rHdrs;
      StringToCharArray(json, data, 0, StringLen(json));
      WebRequest("POST", KoveWebhookURL, hdrs, 5000, data, result, rHdrs);
   }
   lastHistoryTotal = total;
}`
}

function mt5Code(url: string) {
  return `//+------------------------------------------------------------------+
//| KoveFX Auto-Journal for MT5                                      |
//+------------------------------------------------------------------+
#property strict

string KoveWebhookURL = "${url}";
ulong  lastDeal = 0;

int OnInit() {
   HistorySelect(0, TimeCurrent());
   int n = HistoryDealsTotal();
   if (n > 0) lastDeal = HistoryDealGetTicket(n-1);
   return INIT_SUCCEEDED;
}

void OnTick() {
   HistorySelect(0, TimeCurrent());
   int total = HistoryDealsTotal();
   for (int i = total-1; i >= 0; i--) {
      ulong ticket = HistoryDealGetTicket(i);
      if (ticket <= lastDeal) break;
      long dealType  = HistoryDealGetInteger(ticket, DEAL_TYPE);
      long dealEntry = HistoryDealGetInteger(ticket, DEAL_ENTRY);
      if (dealEntry != DEAL_ENTRY_OUT) continue;
      if (dealType != DEAL_TYPE_BUY && dealType != DEAL_TYPE_SELL) continue;
      string sym   = HistoryDealGetString(ticket, DEAL_SYMBOL);
      string dir   = (dealType == DEAL_TYPE_BUY) ? "BUY" : "SELL";
      double price = HistoryDealGetDouble(ticket, DEAL_PRICE);
      double pnl   = HistoryDealGetDouble(ticket, DEAL_PROFIT);
      double lots  = HistoryDealGetDouble(ticket, DEAL_VOLUME);
      string json  = StringFormat(
         "{\\"pair\\":\\"%s\\",\\"type\\":\\"%s\\","
         "\\"exit_price\\":%.5f,\\"lot_size\\":%.2f,"
         "\\"pnl\\":%.2f,\\"external_id\\":\\"%I64d\\"}",
         sym, dir, price, lots, pnl, ticket);
      char data[]; char result[]; string hdrs = "Content-Type: application/json\\r\\n"; string rHdrs;
      StringToCharArray(json, data, 0, StringLen(json));
      WebRequest("POST", KoveWebhookURL, hdrs, 5000, data, result, rHdrs);
   }
   if (total > 0) lastDeal = HistoryDealGetTicket(total-1);
}`
}

function ninjaCode(url: string) {
  return `// KoveFX Auto-Journal Strategy for NinjaTrader 8
// ─────────────────────────────────────────────────────────────────
// 1. Open NinjaTrader → Tools → Edit NinjaScript
// 2. New → Strategy → paste this code → Compile (F5)
// 3. Add the strategy to any chart (any instrument, any timeframe)
// 4. Set "WebhookUrl" to your webhook URL in strategy properties
// 5. Run in real-time — every completed trade auto-logs to KoveFX
// ─────────────────────────────────────────────────────────────────

#region Using declarations
using System;
using System.Net;
using System.Text;
using System.Globalization;
using NinjaTrader.Cbi;
using NinjaTrader.NinjaScript.Strategies;
#endregion

namespace NinjaTrader.NinjaScript.Strategies
{
    public class KoveFXTracker : Strategy
    {
        private int lastTradeCount = 0;

        [NinjaScriptProperty]
        [Display(Name = "Webhook URL", Order = 1, GroupName = "KoveFX")]
        public string WebhookUrl { get; set; }

        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Name        = "KoveFX Tracker";
                Description = "Auto-logs closed trades to KoveFX journal.";
                WebhookUrl  = "${url}";
                Calculate   = Calculate.OnBarClose;
                IsUnmanaged = false;
                BarsRequiredToTrade = 1;
            }
            else if (State == State.Realtime)
            {
                lastTradeCount = SystemPerformance.AllTrades.Count;
            }
        }

        protected override void OnBarUpdate()
        {
            if (State != State.Realtime) return;

            int count = SystemPerformance.AllTrades.Count;
            if (count <= lastTradeCount) return;

            for (int i = lastTradeCount; i < count; i++)
                PostTrade(SystemPerformance.AllTrades[i]);

            lastTradeCount = count;
        }

        private void PostTrade(Trade t)
        {
            try
            {
                string dir = (t.TradeAction == TradeAction.Buy) ? "BUY" : "SELL";
                // Strip contract month suffix (e.g. "NQ 03-25" → "NQ")
                string sym = Instrument.MasterInstrument.Name;

                string json = string.Format(CultureInfo.InvariantCulture,
                    "{\\"pair\\":\\"{0}\\",\\"type\\":\\"{1}\\"," +
                    "\\"entry_price\\":{2},\\"exit_price\\":{3}," +
                    "\\"lot_size\\":{4},\\"pnl\\":{5}," +
                    "\\"external_id\\":\\"{6}\\"}",
                    sym, dir,
                    t.Entry.Price, t.Exit.Price,
                    t.Quantity, t.ProfitCurrency,
                    t.Entry.Execution.ExecutionId);

                byte[] bytes = Encoding.UTF8.GetBytes(json);
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(WebhookUrl);
                req.Method      = "POST";
                req.ContentType = "application/json; charset=utf-8";
                req.ContentLength = bytes.Length;
                req.Timeout     = 5000;
                using (System.IO.Stream s = req.GetRequestStream())
                    s.Write(bytes, 0, bytes.Length);
                req.GetResponse().Dispose();
            }
            catch { /* never crash the strategy */ }
        }
    }
}`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  function go() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }
  return (
    <button onClick={go}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{ background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#34D399' : 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-display)', cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', ...style }}>{children}</div>
}

function CardHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0 0' }}>{sub}</p>}
    </div>
  )
}

const PLATFORM_TABS = [
  { id: 'ninja',  label: 'NinjaTrader' },
  { id: 'mt4',    label: 'MT4' },
  { id: 'mt5',    label: 'MT5' },
  { id: 'csv',    label: 'CSV Import' },
  { id: 'api',    label: 'Raw API' },
] as const

type TabId = typeof PLATFORM_TABS[number]['id']

// ─── Platform → prop firms map ────────────────────────────────────────────────
const PLATFORM_FIRMS: Record<string, string[]> = {
  ninja: ['Topstep', 'Apex Trader Funding', 'Alpha Futures', 'Bulenox', 'Take Profit Trader', 'Earn2Trade', 'Uprofit'],
  mt4:   ['FTMO', 'MyForexFunds', 'The5ers', 'Funded Engineer', 'E8 Funding', 'Lux Trading Firm'],
  mt5:   ['FTMO', 'MyFundedFX', 'Alpha Capital', 'Funder Trading', 'The Trading Pit'],
  csv:   ['Any platform — NinjaTrader, Tradovate, Topstep, FTMO, MT4/MT5, Interactive Brokers'],
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const [token, setToken]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [regen, setRegen]       = useState(false)
  const [tab, setTab]           = useState<TabId>('ninja')
  const [importing, setImport]  = useState(false)
  const [importResult, setImportResult] = useState<{ ok?: string; err?: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/connections').then(r => r.json()).then(d => { if (d.webhook_token) setToken(d.webhook_token) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function regenerate() {
    setRegen(true)
    const res = await fetch('/api/connections', { method: 'POST' })
    const d   = await res.json()
    if (d.webhook_token) setToken(d.webhook_token)
    setRegen(false)
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImport(true)
    setImportResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/trades/import', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) setImportResult({ err: data.error })
      else setImportResult({ ok: `Imported ${data.imported} of ${data.total} trades successfully.` })
    } catch {
      setImportResult({ err: 'Upload failed. Please try again.' })
    } finally {
      setImport(false)
    }
  }

  const webhookUrl = token ? `${BASE_URL}/api/webhook/${token}` : ''

  const codeForTab = () => {
    if (!token) return ''
    if (tab === 'ninja') return ninjaCode(webhookUrl)
    if (tab === 'mt4')   return mt4Code(webhookUrl)
    if (tab === 'mt5')   return mt5Code(webhookUrl)
    return ''
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Broker Connection</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: '2px 0 0 0' }}>
            Auto-sync trades from NinjaTrader, MT4/MT5, or import from any platform
          </p>
        </div>
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col gap-5" style={{ maxWidth: 780 }}>

        {/* Prop firm logos row */}
        <div className="flex flex-wrap gap-2">
          {['Topstep', 'Apex', 'Lucid', 'Alpha Futures', 'FTMO', 'MyFundedFX', 'The5ers', 'Bulenox', 'Earn2Trade', '+ any MT4/MT5 or NinjaTrader broker'].map((f) => (
            <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
              {f}
            </span>
          ))}
        </div>

        {/* Webhook URL */}
        <Card>
          <div className="px-5 py-4 flex items-start gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7CF8' }} />
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Your Webhook URL</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0 0' }}>
                Private — keep it secret. The scripts below already have it embedded.
              </p>
            </div>
          </div>
          <div className="px-5 py-4">
            {loading ? (
              <div className="h-10 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ) : (
              <div className="flex items-center gap-3">
                <code className="flex-1 min-w-0 text-xs rounded-lg px-3 py-2.5 overflow-x-auto"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8B7CF8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {webhookUrl}
                </code>
                <CopyButton text={webhookUrl} label="Copy" />
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <button onClick={regenerate} disabled={regen}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-display)', cursor: 'pointer' }}>
                <RefreshCw className={`w-3 h-3 ${regen ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-body)' }}>old URL stops working</span>
            </div>
          </div>
        </Card>

        {/* Platform tabs */}
        <Card>
          {/* Tab bar */}
          <div className="px-4 pt-3 pb-0 flex items-center gap-1 flex-wrap" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {PLATFORM_TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-3 py-2 mb-0 text-xs font-semibold transition-all rounded-t-lg"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: tab === t.id ? 'rgba(108,93,211,0.12)' : 'transparent',
                  color: tab === t.id ? '#8B7CF8' : 'rgba(255,255,255,0.3)',
                  borderBottom: tab === t.id ? '2px solid #8B7CF8' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 flex flex-col gap-4">

            {/* Supported firms for this tab */}
            {PLATFORM_FIRMS[tab] && (
              <div className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)' }}>
                <span style={{ color: '#8B7CF8', flexShrink: 0 }}>Works with:</span>
                <span>{PLATFORM_FIRMS[tab].join(', ')}</span>
              </div>
            )}

            {/* NinjaTrader */}
            {tab === 'ninja' && (
              <>
                <div className="flex flex-col gap-2">
                  {[
                    ['1', 'Open NinjaTrader → Tools → Edit NinjaScript → New → Strategy'],
                    ['2', 'Delete the default code, paste the script below, press F5 to compile'],
                    ['3', 'Open a chart → right-click → Strategies → Add Strategy → KoveFX Tracker'],
                    ['4', 'Your webhook URL is already embedded in the script — just enable and run'],
                    ['5', 'Every trade that closes will appear in your journal automatically'],
                  ].map(([n, t]) => (
                    <div key={n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(108,93,211,0.15)', border: '1px solid rgba(108,93,211,0.3)' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: '#8B7CF8' }}>{n}</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>{t}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <CopyButton text={codeForTab()} label="Copy NinjaScript" />
                </div>
                <pre className="text-xs overflow-x-auto rounded-xl p-4"
                  style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', color: '#c9d1d9', fontFamily: 'monospace', lineHeight: 1.65, margin: 0, maxHeight: 420 }}>
                  {codeForTab()}
                </pre>
              </>
            )}

            {/* MT4 / MT5 */}
            {(tab === 'mt4' || tab === 'mt5') && (
              <>
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(251,191,36,0.8)', margin: 0, lineHeight: 1.5 }}>
                    Before attaching: <strong>Tools → Options → Expert Advisors</strong> → enable <strong>Allow WebRequest</strong> → add <code style={{ fontFamily: 'monospace' }}>{typeof window !== 'undefined' ? window.location.origin : 'https://kovefx.com'}</code>
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    ['1', `Open MetaEditor (F4) → File → New → Expert Advisor → paste the code below → Compile (F7)`],
                    ['2', 'Back in MT4/MT5 → Navigator panel → Expert Advisors → drag onto any chart'],
                    ['3', 'Enable "Allow live trading" in the EA settings'],
                    ['4', 'Every trade that closes will log to your journal automatically'],
                  ].map(([n, t]) => (
                    <div key={n} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(108,93,211,0.15)', border: '1px solid rgba(108,93,211,0.3)' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: '#8B7CF8' }}>{n}</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>{t}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <CopyButton text={codeForTab()} label={`Copy ${tab.toUpperCase()} code`} />
                </div>
                <pre className="text-xs overflow-x-auto rounded-xl p-4"
                  style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', color: '#c9d1d9', fontFamily: 'monospace', lineHeight: 1.65, margin: 0, maxHeight: 420 }}>
                  {codeForTab()}
                </pre>
              </>
            )}

            {/* CSV Import */}
            {tab === 'csv' && (
              <div className="flex flex-col gap-4">
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.7 }}>
                  Export your trade history as CSV from any platform and import it here. We auto-detect columns for NinjaTrader, Tradovate, Topstep, FTMO, MT4/MT5, Interactive Brokers, and most other platforms.
                </p>

                <div className="flex flex-col gap-3">
                  {[
                    ['NinjaTrader 8', 'Account Performance → Trades tab → right-click → Export to CSV'],
                    ['Tradovate', 'Account → Trade History → Export CSV'],
                    ['Topstep / TopstepX', 'Dashboard → Trade History → Export'],
                    ['MT4 / MT5', 'Account History tab → right-click → Save as Report (Detailed) → .htm works too'],
                    ['FTMO / Funded accounts', 'MetaTrader Account History → save as CSV'],
                    ['Interactive Brokers', 'Reports → Activity → Trades → Export'],
                  ].map(([platform, instructions]) => (
                    <div key={platform} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#8B7CF8' }} />
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{platform}</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0 0' }}>{instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCsvImport} className="hidden" />

                {importResult && (
                  <div className="px-4 py-3 rounded-xl text-sm"
                    style={{ background: importResult.ok ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${importResult.ok ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, color: importResult.ok ? '#34D399' : '#F87171', fontFamily: 'var(--font-body)' }}>
                    {importResult.ok ?? importResult.err}
                  </div>
                )}

                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={importing}
                  className="flex items-center justify-center gap-2.5 w-full h-14 rounded-2xl text-sm font-semibold transition-all"
                  style={{ background: importing ? 'rgba(108,93,211,0.08)' : 'rgba(108,93,211,0.1)', border: '1px dashed rgba(108,93,211,0.35)', color: importing ? 'rgba(139,124,248,0.5)' : '#8B7CF8', cursor: importing ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)' }}>
                  {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : <><Upload className="w-4 h-4" /> Upload CSV file</>}
                </button>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
                  After importing, open each trade to add a chart screenshot and notes
                </p>
              </div>
            )}

            {/* Raw API */}
            {tab === 'api' && (
              <div className="flex flex-col gap-4">
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  POST JSON to your webhook from any script, automation tool, or custom integration.
                </p>
                <div className="flex justify-end">
                  <CopyButton text={`curl -X POST "${webhookUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"pair":"NQ","type":"BUY","entry_price":21450.00,"exit_price":21500.00,"lot_size":1,"pnl":250.00,"external_id":"order_12345"}'`} label="Copy example" />
                </div>
                <pre className="text-xs overflow-x-auto rounded-xl p-4"
                  style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', color: '#a5f3c0', fontFamily: 'monospace', lineHeight: 1.7, margin: 0 }}>
{`POST ${webhookUrl || 'YOUR_WEBHOOK_URL'}
Content-Type: application/json

{
  "pair":         "NQ",           // required — any symbol: NQ, ES, EUR/USD, etc.
  "type":         "BUY",          // required — BUY or SELL
  "entry_price":  21450.00,
  "exit_price":   21500.00,
  "stop_loss":    21400.00,
  "take_profit":  21550.00,
  "lot_size":     1,              // contracts for futures, lots for forex
  "pnl":          250.00,         // positive = profit, negative = loss
  "external_id":  "order_12345", // broker order/ticket ID — prevents duplicates
  "opened_at":    "2024-01-15T09:30:00Z"
}

// 200 Response
{ "success": true, "trade_id": "uuid" }`}
                </pre>
              </div>
            )}
          </div>
        </Card>

        {/* Funded account note */}
        <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(108,93,211,0.06)', border: '1px solid rgba(108,93,211,0.14)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Topstep, Apex, Lucid, Alpha Futures</strong> — all use NinjaTrader or Tradovate. Use the NinjaTrader script above, or export from Tradovate/TopstepX as CSV and use the CSV Import tab.
          </p>
        </div>

      </div>
    </div>
  )
}
