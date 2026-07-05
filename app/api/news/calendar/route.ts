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

// ─── Forex Factory fallback (no API key required) ─────────────────────────────
interface FFEvent {
  title:    string
  country:  string   // currency code: USD, EUR, GBP, ...
  date:     string   // ISO with offset, e.g. "2026-07-06T08:30:00-04:00"
  impact:   string   // High | Medium | Low | Holiday
  forecast: string
  previous: string
}

const FF_CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: 'US', EUR: 'EU', GBP: 'GB', JPY: 'JP',
  CAD: 'CA', AUD: 'AU', NZD: 'NZ', CHF: 'CH',
}

async function fetchForexFactory(): Promise<CalendarEvent[]> {
  const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
    next: { revalidate: 21600 },
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KoveJournal/1.0)' },
  })
  if (!res.ok) throw new Error(`ForexFactory ${res.status}`)
  const raw: FFEvent[] = await res.json()

  return raw
    .filter(e => FF_CURRENCY_TO_COUNTRY[e.country] && ['High', 'Medium', 'Low'].includes(e.impact))
    .map(e => {
      const country = FF_CURRENCY_TO_COUNTRY[e.country]
      const d = new Date(e.date)
      const parts: string[] = []
      if (e.forecast) parts.push(`Est: ${e.forecast}`)
      if (e.previous) parts.push(`Prev: ${e.previous}`)
      return {
        name:        e.title,
        date:        d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' }),
        time:        `${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', hour12: true })} ET`,
        impact:      e.impact.toLowerCase() as 'high' | 'medium' | 'low',
        description: parts.length ? parts.join(' · ') : e.title,
        currencies:  COUNTRY_CURRENCIES[country] ?? [e.country],
        actual:      null,
        estimate:    e.forecast || null,
        prev:        e.previous || null,
        unit:        null,
        country,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
}

// ─── Finnhub (primary, when key is configured) ────────────────────────────────
async function fetchFinnhub(apiKey: string): Promise<CalendarEvent[]> {
  // Fetch 3 months: 2 weeks back + 10 weeks forward
  const from = new Date()
  from.setDate(from.getDate() - 14)
  const to = new Date()
  to.setDate(to.getDate() + 70)

  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const url = `https://finnhub.io/api/v1/calendar/economic?from=${fmt(from)}&to=${fmt(to)}&token=${apiKey}`

  const res = await fetch(url, { next: { revalidate: 21600 } })
  if (!res.ok) throw new Error(`Finnhub ${res.status}`)

  const json = await res.json()
  const raw: FinnhubEvent[] = json.economicCalendar ?? []

  return raw
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
}

// ─── Route ───────────────────────────────────────────────────────────────────
export async function GET() {
  // Return cache if still fresh
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
    return NextResponse.json({ events: _cache.data, cached: true })
  }

  const apiKey = process.env.FINNHUB_API_KEY

  try {
    let events: CalendarEvent[]
    if (apiKey) {
      try {
        events = await fetchFinnhub(apiKey)
      } catch (err) {
        console.error('[calendar] Finnhub failed, falling back to ForexFactory', err)
        events = await fetchForexFactory()
      }
    } else {
      events = await fetchForexFactory()
    }

    _cache = { data: events, ts: Date.now() }
    return NextResponse.json({ events })
  } catch (err) {
    console.error('[calendar]', err)
    // Return stale cache on error rather than showing nothing
    if (_cache) return NextResponse.json({ events: _cache.data, stale: true })
    return NextResponse.json({ events: [], error: 'Failed to fetch calendar' }, { status: 502 })
  }
}
