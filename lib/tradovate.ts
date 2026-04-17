// ─── Tradovate API client + FIFO trade matcher ────────────────────────────────

export const TRADOVATE_LIVE = 'https://live.tradovateapi.com/v1'
export const TRADOVATE_DEMO = 'https://demo.tradovateapi.com/v1'

function base(isDemo: boolean) {
  return isDemo ? TRADOVATE_DEMO : TRADOVATE_LIVE
}

// ── Dollar value per 1 full point move per 1 contract ────────────────────────
const POINT_VALUES: Record<string, number> = {
  NQ: 20, MNQ: 2,
  ES: 50, MES: 5,
  YM: 5,  MYM: 0.5,
  RTY: 50, M2K: 5,
  CL: 1000, MCL: 100,
  GC: 100,  MGC: 10,
  SI: 5000, MSI: 500,
  NG: 10000,
  ZB: 1000, ZN: 1000, ZF: 1000, ZT: 2000,
  '6E': 125000, '6J': 12500000,
  '6B': 62500,  '6A': 100000, '6C': 100000,
  BTC: 5, MBT: 0.1, ETH: 50, MET: 0.1,
  NKD: 5, NIY: 500,
  ZC: 50, ZW: 50, ZS: 50,
}

export function getPointValue(rawSymbol: string): number {
  // Strip contract month suffix: NQH25 → NQ, ESM4 → ES
  const base = rawSymbol.replace(/[A-Z]\d{1,4}$/, '').replace(/\d+$/, '').trim()
  return POINT_VALUES[base] ?? 1
}

// ── Token encryption (AES-256-GCM) ───────────────────────────────────────────
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

function encryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'fallback-key-change-in-prod-32ch'
  return Buffer.from(raw.padEnd(32).slice(0, 32))
}

export function encryptToken(text: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('hex'), enc.toString('hex'), tag.toString('hex')].join(':')
}

export function decryptToken(encrypted: string): string {
  const [ivHex, encHex, tagHex] = encrypted.split(':')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()]).toString('utf8')
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface TradovateAuthResult {
  accessToken?: string
  expirationTime?: string
  userId?: number
  name?: string
  hasLive?: boolean
  errorText?: string
  p2?: boolean        // MFA required
}

export async function authenticate(
  username: string,
  password: string,
  isDemo: boolean
): Promise<TradovateAuthResult> {
  if (!process.env.TRADOVATE_CLIENT_ID || !process.env.TRADOVATE_CLIENT_SECRET) {
    return { errorText: 'TRADOVATE_NOT_CONFIGURED' }
  }
  const res = await fetch(`${base(isDemo)}/auth/accesstokenrequest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: username,
      password,
      appId: process.env.TRADOVATE_APP_ID ?? 'KoveFX',
      appVersion: '1.0.0',
      cid: Number(process.env.TRADOVATE_CLIENT_ID),
      sec: process.env.TRADOVATE_CLIENT_SECRET,
      deviceId: 'kove-journal',
    }),
  })
  return res.json()
}

export async function renewToken(
  accessToken: string,
  isDemo: boolean
): Promise<TradovateAuthResult> {
  const res = await fetch(`${base(isDemo)}/auth/renewaccesstoken`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.json()
}

// ── Data fetching ─────────────────────────────────────────────────────────────
export interface TradovateFill {
  id: number
  orderId: number
  contractId: number
  timestamp: string
  price: number
  qty: number
  side: 'Buy' | 'Sell'
}

export interface TradovateContract {
  id: number
  name: string
}

export async function getFills(
  accessToken: string,
  isDemo: boolean
): Promise<TradovateFill[]> {
  const res = await fetch(`${base(isDemo)}/fill/list`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Tradovate fill/list: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function getContracts(
  accessToken: string,
  isDemo: boolean,
  ids: number[]
): Promise<Map<number, string>> {
  const map = new Map<number, string>()
  // Fetch contracts in parallel, up to 10 at a time
  const chunks: number[][] = []
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10))

  for (const chunk of chunks) {
    await Promise.allSettled(
      chunk.map(async (id) => {
        const res = await fetch(`${base(isDemo)}/contract/item?id=${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (res.ok) {
          const c: TradovateContract = await res.json()
          if (c?.name) map.set(id, c.name)
        }
      })
    )
  }
  return map
}

export async function getAccounts(
  accessToken: string,
  isDemo: boolean
): Promise<Array<{ id: number; name: string }>> {
  const res = await fetch(`${base(isDemo)}/account/list`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data.map((a: { id: number; name: string }) => ({ id: a.id, name: a.name })) : []
}

// ── FIFO trade matching ───────────────────────────────────────────────────────
export interface ClosedTrade {
  pair: string
  type: 'BUY' | 'SELL'
  entry_price: number
  exit_price: number
  lot_size: number
  pnl: number
  outcome: 'win' | 'loss' | 'breakeven'
  external_id: string
  opened_at: string
  closed_at: string
  source: 'broker'
}

interface QueueItem {
  fill: TradovateFill
  remainingQty: number
}

export function matchFifo(fills: TradovateFill[], contractName: string): ClosedTrade[] {
  // Strip month suffix to get base symbol: NQH25 → NQ
  const sym = contractName.replace(/[A-Z]\d{1,4}$/, '').trim()
  const pointValue = getPointValue(sym)

  const sorted = [...fills].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const longQ: QueueItem[] = []   // open longs waiting for exit
  const shortQ: QueueItem[] = []  // open shorts waiting for exit
  const closed: ClosedTrade[] = []

  for (const fill of sorted) {
    let remaining = fill.qty

    if (fill.side === 'Buy') {
      // Close shorts first
      while (remaining > 0 && shortQ.length > 0) {
        const entry = shortQ[0]
        const qty = Math.min(remaining, entry.remainingQty)
        const pnl = Math.round((entry.fill.price - fill.price) * qty * pointValue * 100) / 100
        closed.push({
          pair: sym, type: 'SELL',
          entry_price: entry.fill.price, exit_price: fill.price,
          lot_size: qty, pnl,
          outcome: pnl > 0.005 ? 'win' : pnl < -0.005 ? 'loss' : 'breakeven',
          external_id: `tv_${entry.fill.id}_${fill.id}`,
          opened_at: entry.fill.timestamp, closed_at: fill.timestamp,
          source: 'broker',
        })
        entry.remainingQty -= qty
        remaining -= qty
        if (entry.remainingQty === 0) shortQ.shift()
      }
      if (remaining > 0) longQ.push({ fill: { ...fill, qty: remaining }, remainingQty: remaining })

    } else {
      // Close longs first
      while (remaining > 0 && longQ.length > 0) {
        const entry = longQ[0]
        const qty = Math.min(remaining, entry.remainingQty)
        const pnl = Math.round((fill.price - entry.fill.price) * qty * pointValue * 100) / 100
        closed.push({
          pair: sym, type: 'BUY',
          entry_price: entry.fill.price, exit_price: fill.price,
          lot_size: qty, pnl,
          outcome: pnl > 0.005 ? 'win' : pnl < -0.005 ? 'loss' : 'breakeven',
          external_id: `tv_${entry.fill.id}_${fill.id}`,
          opened_at: entry.fill.timestamp, closed_at: fill.timestamp,
          source: 'broker',
        })
        entry.remainingQty -= qty
        remaining -= qty
        if (entry.remainingQty === 0) longQ.shift()
      }
      if (remaining > 0) shortQ.push({ fill: { ...fill, qty: remaining }, remainingQty: remaining })
    }
  }

  return closed
}

// ── Full sync: fills → matched trades ─────────────────────────────────────────
export async function syncTrades(
  accessToken: string,
  isDemo: boolean,
  since?: string
): Promise<ClosedTrade[]> {
  const allFills = await getFills(accessToken, isDemo)

  // Filter by since date
  const fills = since
    ? allFills.filter((f) => new Date(f.timestamp) > new Date(since))
    : allFills

  if (fills.length === 0) return []

  // Get unique contract IDs and look them up
  const contractIds = [...new Set(fills.map((f) => f.contractId))]
  const contractMap = await getContracts(accessToken, isDemo, contractIds)

  // Group fills by contractId, run FIFO per contract
  const byContract = new Map<number, TradovateFill[]>()
  for (const fill of fills) {
    const arr = byContract.get(fill.contractId) ?? []
    arr.push(fill)
    byContract.set(fill.contractId, arr)
  }

  const result: ClosedTrade[] = []
  for (const [contractId, contractFills] of byContract) {
    const name = contractMap.get(contractId) ?? String(contractId)
    result.push(...matchFifo(contractFills, name))
  }

  // Sort chronologically
  return result.sort((a, b) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime())
}
