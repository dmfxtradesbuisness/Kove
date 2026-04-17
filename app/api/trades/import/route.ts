import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ── Normalize instrument symbol ───────────────────────────────────────────────
function normalizePair(raw: string): string {
  const s = raw.trim().toUpperCase()
    .replace(/\s+\d{2}-\d{2}$/, '')   // strip "NQ 03-25" date suffix
    .replace(/\s+\w+\d+$/, '')         // strip "NQ MAR25" suffix
    .replace(/\s/g, '')                // remove spaces

  // Already has slash
  if (s.includes('/')) return s

  // Common futures — keep as-is
  const FUTURES = ['NQ', 'ES', 'MNQ', 'MES', 'RTY', 'YM', 'CL', 'GC', 'SI', 'NG', 'ZB', 'ZN', 'ZF', 'ZT', '6E', '6J', '6B', '6A', '6C', 'BTC', 'ETH']
  for (const f of FUTURES) {
    if (s === f || s.startsWith(f + '1') || s.startsWith(f + ' ')) return f
  }

  // 6-char forex → XXX/YYY
  if (s.length === 6 && /^[A-Z]+$/.test(s)) return `${s.slice(0, 3)}/${s.slice(3)}`

  return s
}

// ── Detect direction ──────────────────────────────────────────────────────────
function normalizeType(raw: string): 'BUY' | 'SELL' {
  const s = raw.trim().toUpperCase()
  return s === 'SELL' || s === 'SHORT' || s === 'S' || s === 'SLD' ? 'SELL' : 'BUY'
}

// ── Parse a number safely ─────────────────────────────────────────────────────
function parseNum(v: string | undefined): number | null {
  if (!v) return null
  const n = parseFloat(v.replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? null : n
}

// ── Map CSV header → field ─────────────────────────────────────────────────────
const HEADER_MAP: Record<string, string> = {
  // Symbol / pair
  instrument: 'pair', symbol: 'pair', contract: 'pair', market: 'pair', ticker: 'pair',
  // Direction
  'market pos.': 'type', 'market pos': 'type', 'market position': 'type',
  type: 'type', side: 'type', direction: 'type', 'b/s': 'type', action: 'type',
  // Entry
  'entry price': 'entry_price', entryprice: 'entry_price', 'open price': 'entry_price',
  openprice: 'entry_price', 'fill price': 'entry_price', fillprice: 'entry_price',
  'avg entry price': 'entry_price', avgentryprice: 'entry_price',
  // Exit
  'exit price': 'exit_price', exitprice: 'exit_price', 'close price': 'exit_price',
  closeprice: 'exit_price', 'avg exit price': 'exit_price', avgexitprice: 'exit_price',
  // P&L
  profit: 'pnl', 'profit (%)': 'pnl', 'profit/loss': 'pnl', 'p&l': 'pnl', pnl: 'pnl',
  'net profit': 'pnl', netprofit: 'pnl', 'realized p&l': 'pnl', realizedpnl: 'pnl',
  // Quantity / lot
  quantity: 'lot_size', qty: 'lot_size', lots: 'lot_size', 'lot size': 'lot_size',
  lotsize: 'lot_size', size: 'lot_size', contracts: 'lot_size', volume: 'lot_size',
  // SL / TP
  'stop loss': 'stop_loss', stoploss: 'stop_loss', sl: 'stop_loss',
  'take profit': 'take_profit', takeprofit: 'take_profit', tp: 'take_profit',
  // Notes
  notes: 'notes', comment: 'notes', comments: 'notes', note: 'notes',
  // Date (for created_at)
  'entry time': 'opened_at', entrytime: 'opened_at', 'open time': 'opened_at',
  opentime: 'opened_at', date: 'opened_at', time: 'opened_at', timestamp: 'opened_at',
}

function mapHeader(raw: string): string | null {
  const key = raw.trim().toLowerCase().replace(/[^a-z0-9 &./]/g, '')
  return HEADER_MAP[key] ?? null
}

// ── Parse CSV text → array of row objects ─────────────────────────────────────
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  // Find the header row (first line that has multiple commas)
  let headerIdx = 0
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    if (lines[i].split(',').length > 3) { headerIdx = i; break }
  }

  const splitLine = (line: string): string[] => {
    const result: string[] = []
    let cur = ''
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes }
      else if (ch === ',' && !inQuotes) { result.push(cur.replace(/^"|"$/g, '').trim()); cur = '' }
      else { cur += ch }
    }
    result.push(cur.replace(/^"|"$/g, '').trim())
    return result
  }

  const headers = splitLine(lines[headerIdx])
  const mapped = headers.map(mapHeader)

  const rows: Record<string, string>[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitLine(lines[i])
    if (cols.every((c) => !c)) continue
    const row: Record<string, string> = {}
    mapped.forEach((field, idx) => {
      if (field && cols[idx] !== undefined) row[field] = cols[idx]
    })
    rows.push(row)
  }
  return rows
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

    const text = await file.text()
    const rows = parseCsv(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Could not parse any trades from this file. Make sure it is a CSV with headers.' }, { status: 422 })
    }

    const trades = rows
      .filter((r) => r.pair && r.type)
      .map((r, idx) => {
        const pnl = parseNum(r.pnl)
        const outcome = pnl != null ? (pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven') : null
        return {
          user_id: user.id,
          pair: normalizePair(r.pair),
          type: normalizeType(r.type),
          outcome,
          entry_price: parseNum(r.entry_price),
          exit_price: parseNum(r.exit_price),
          stop_loss: parseNum(r.stop_loss),
          take_profit: parseNum(r.take_profit),
          lot_size: parseNum(r.lot_size),
          pnl,
          notes: r.notes || null,
          source: 'import',
          external_id: `import_${file.name}_${idx}`,
          ...(r.opened_at ? { created_at: new Date(r.opened_at).toISOString() } : {}),
        }
      })
      .filter((t) => t.entry_price !== null || t.pnl !== null) // need at least some data

    if (trades.length === 0) {
      return NextResponse.json({ error: 'No valid trades found. Check that your file has pair/symbol and direction columns.' }, { status: 422 })
    }

    // Upsert in batches of 50
    let imported = 0
    for (let i = 0; i < trades.length; i += 50) {
      const { error } = await supabase
        .from('trades')
        .upsert(trades.slice(i, i + 50), { onConflict: 'user_id,external_id' })
      if (!error) imported += Math.min(50, trades.length - i)
    }

    return NextResponse.json({ imported, total: trades.length })
  } catch (err) {
    console.error('[import]', err)
    return NextResponse.json({ error: 'Failed to import file.' }, { status: 500 })
  }
}
