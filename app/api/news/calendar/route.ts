import { NextResponse } from 'next/server'

// ─── Types ────────────────────────────────────────────────────────────────────
interface FinnhubEvent {
  actual:   string | null
  country:  string
  estimate: string | null
  event:    string
  impact:   string
  prev:     string | null
  time:     string   // "YYYY-MM-DD HH:mm:ss" UTC
  unit:     string | null
}

export interface CalendarEvent {
  name:      string
  date:      string   // YYYY-MM-DD
  time:      string   // "HH:MM ET"
  impact:    'high' | 'medium' | 'low'
  description: string
  currencies: string[]
  actual:    string | null
  estimate:  string | null
  prev:      string | null
  unit:      string | null
  country:   string
}

// ─── In-memory cache (survives warm lambda) ───────────────────────────────────
const CACHE_TTL = 6 * 60 * 60 * 1000  // 6 hours
let _cache: { data: CalendarEvent[]; ts: number } | null = null

// ─── Country → currency mapping ───────────────────────────────────────────────
const COUNTRY_CURRENCIES: Record<string, string[]> = {
  US: ['USD', 'NQ', 'US30', 'XAU/USD'],
  EU: ['EUR/USD', 'EUR/GBP'],
  GB: ['GBP/USD', 'EUR/GBP'],
  JP: ['USD/JPY', 'GBP/JPY'],
  CA: ['USD/CAD'],
  AU: ['AUD/USD'],
  NZ: ['NZD/USD'],
  CH: ['USD/CHF'],
}

const RELEVANT_COUNTRIES = new Set(['US', 'EU', 'GB', 'JP', 'CA', 'AU', 'NZ', 'CH'])

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toET(utcStr: string): string {
  try {
    // FinnHub: "2026-04-19 12:30:00" → treat as UTC
    const d = new Date(utcStr.replace(' ', 'T') + 'Z')
    const hhmm = d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
      timeZone: 'America/New_York', hour12: true,
    })
    return `${hhmm} ET`
  } catch {
    return ''
  }
}

function toDateStr(utcStr: string): string {
  // Returns YYYY-MM-DD in ET
  try {
    const d = new Date(utcStr.replace(' ', 'T') + 'Z')
    return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }) // en-CA gives YYYY-MM-DD
  } catch {
    return utcStr.slice(0, 10)
  }
}

function buildDescription(e: FinnhubEvent): string {
  const parts: string[] = []
  if (e.estimate != null) parts.push(`Est: ${e.estimate}${e.unit ?? ''}`)
  if (e.prev      != null) parts.push(`Prev: ${e.prev}${e.unit ?? ''}`)
  if (e.actual    != null) parts.push(`Act: ${e.actual}${e.unit ?? ''}`)
  return parts.length ? parts.join(' · ') : e.event
}

// ─── Route ───────────────────────────────────────────────────────────────────
export async function GET() {
  // Return cache if still fresh
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
    return NextResponse.json({ events: _cache.data, cached: true })
  }

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ events: [], error: 'FINNHUB_API_KEY not set' }, { status: 500 })
  }

  // Fetch 3 months: 2 weeks back + 10 weeks forward
  const from = new Date()
  from.setDate(from.getDate() - 14)
  const to = new Date()
  to.setDate(to.getDate() + 70)

  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const url = `https://finnhub.io/api/v1/calendar/economic?from=${fmt(from)}&to=${fmt(to)}&token=${apiKey}`

  try {
    const res = await fetch(url, { next: { revalidate: 21600 } })
    if (!res.ok) throw new Error(`Finnhub ${res.status}`)

    const json = await res.json()
    const raw: FinnhubEvent[] = json.economicCalendar ?? []

    const events: CalendarEvent[] = raw
      .filter(e => RELEVANT_COUNTRIES.has(e.country))
      .filter(e => ['high', 'medium', 'low'].includes(e.impact))
      .map(e => ({
        name:        e.event,
        date:        toDateStr(e.time),
        time:        toET(e.time),
        impact:      e.impact as 'high' | 'medium' | 'low',
        description: buildDescription(e),
        currencies:  COUNTRY_CURRENCIES[e.country] ?? [e.country],
        actual:      e.actual,
        estimate:    e.estimate,
        prev:        e.prev,
        unit:        e.unit,
        country:     e.country,
      }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

    _cache = { data: events, ts: Date.now() }
    return NextResponse.json({ events })
  } catch (err) {
    console.error('[calendar]', err)
    // Return stale cache on error rather than showing nothing
    if (_cache) return NextResponse.json({ events: _cache.data, stale: true })
    return NextResponse.json({ events: [], error: 'Failed to fetch calendar' }, { status: 502 })
  }
}
