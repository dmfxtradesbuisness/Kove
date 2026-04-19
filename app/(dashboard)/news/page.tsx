'use client'

import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface EconEvent {
  name: string
  date: Date
  impact: 'high' | 'medium' | 'low'
  description: string
  currencies: string[]
  time?: string
}

// ─── Real 2026 economic calendar (approximate official schedule) ──────────────
// FOMC: Jan 27-28, Mar 17-18, Apr 28-29, Jun 16-17, Jul 28-29, Sep 15-16, Oct 27-28, Dec 8-9
// CPI: ~10th-15th each month (BLS release pattern)
// NFP: First Friday each month
// GDP: Advance estimate ~4 weeks after quarter end
function buildCalendar(): EconEvent[] {
  const y = 2026
  return [
    // ── FOMC ──────────────────────────────────────────────────────────────
    { name: 'FOMC Decision',    date: new Date(y,0,28),  impact:'high',   description:'Federal Reserve interest rate decision & statement',   currencies:['USD','NQ','US30','GOLD'], time:'14:00 ET' },
    { name: 'FOMC Decision',    date: new Date(y,2,18),  impact:'high',   description:'Federal Reserve interest rate decision & statement',   currencies:['USD','NQ','US30','GOLD'], time:'14:00 ET' },
    { name: 'FOMC Decision',    date: new Date(y,3,29),  impact:'high',   description:'Federal Reserve interest rate decision & statement',   currencies:['USD','NQ','US30','GOLD'], time:'14:00 ET' },
    { name: 'FOMC Decision',    date: new Date(y,5,17),  impact:'high',   description:'Federal Reserve interest rate decision & statement',   currencies:['USD','NQ','US30','GOLD'], time:'14:00 ET' },
    { name: 'FOMC Decision',    date: new Date(y,6,29),  impact:'high',   description:'Federal Reserve interest rate decision & statement',   currencies:['USD','NQ','US30','GOLD'], time:'14:00 ET' },
    { name: 'FOMC Decision',    date: new Date(y,8,16),  impact:'high',   description:'Federal Reserve interest rate decision & statement',   currencies:['USD','NQ','US30','GOLD'], time:'14:00 ET' },
    { name: 'FOMC Decision',    date: new Date(y,9,28),  impact:'high',   description:'Federal Reserve interest rate decision & statement',   currencies:['USD','NQ','US30','GOLD'], time:'14:00 ET' },
    { name: 'FOMC Decision',    date: new Date(y,11,9),  impact:'high',   description:'Federal Reserve interest rate decision & statement',   currencies:['USD','NQ','US30','GOLD'], time:'14:00 ET' },

    // ── CPI ───────────────────────────────────────────────────────────────
    { name: 'CPI',              date: new Date(y,0,14),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,1,11),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,2,11),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,3,14),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,4,13),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,5,10),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,6,14),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,7,12),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,8,9),   impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,9,14),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,10,12), impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },
    { name: 'CPI',              date: new Date(y,11,9),  impact:'high',   description:'Consumer Price Index — core & headline inflation YoY/MoM',  currencies:['USD','NQ','EUR/USD'], time:'08:30 ET' },

    // ── NFP ───────────────────────────────────────────────────────────────
    { name: 'Non-Farm Payrolls', date: new Date(y,0,9),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,1,6),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,2,6),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,3,3),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,4,1),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,5,5),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,6,2),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,7,7),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,8,4),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,9,2),  impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,10,6), impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },
    { name: 'Non-Farm Payrolls', date: new Date(y,11,4), impact:'high',   description:'Jobs added to the economy — the most market-moving release', currencies:['USD','NQ','US30','XAU/USD'], time:'08:30 ET' },

    // ── PPI ───────────────────────────────────────────────────────────────
    { name: 'PPI',              date: new Date(y,0,15),  impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,1,12),  impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,2,12),  impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,3,10),  impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,4,14),  impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,5,11),  impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,6,15),  impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,7,13),  impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,8,10),  impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,9,9),   impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,10,13), impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },
    { name: 'PPI',              date: new Date(y,11,10), impact:'medium', description:'Producer Price Index — upstream inflation signal',    currencies:['USD'],           time:'08:30 ET' },

    // ── GDP (advance estimate, quarterly) ─────────────────────────────────
    { name: 'GDP (Advance)',    date: new Date(y,0,29),  impact:'high',   description:'Q4 2025 GDP advance estimate — annualised QoQ growth', currencies:['USD','NQ','US30'], time:'08:30 ET' },
    { name: 'GDP (Advance)',    date: new Date(y,3,29),  impact:'high',   description:'Q1 2026 GDP advance estimate — annualised QoQ growth', currencies:['USD','NQ','US30'], time:'08:30 ET' },
    { name: 'GDP (Advance)',    date: new Date(y,6,29),  impact:'high',   description:'Q2 2026 GDP advance estimate — annualised QoQ growth', currencies:['USD','NQ','US30'], time:'08:30 ET' },
    { name: 'GDP (Advance)',    date: new Date(y,9,29),  impact:'high',   description:'Q3 2026 GDP advance estimate — annualised QoQ growth', currencies:['USD','NQ','US30'], time:'08:30 ET' },

    // ── Retail Sales ──────────────────────────────────────────────────────
    { name: 'Retail Sales',    date: new Date(y,0,16),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,1,18),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,2,17),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,3,15),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,4,15),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,5,16),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,6,16),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,7,14),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,8,16),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,9,15),  impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,10,17), impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },
    { name: 'Retail Sales',    date: new Date(y,11,16), impact:'medium', description:'US retail sales MoM — consumer spending gauge',      currencies:['USD'],           time:'08:30 ET' },

    // ── Initial Jobless Claims (weekly — select Thursdays) ────────────────
    ...[4,11,18,25].map(d => ({ name:'Jobless Claims', date: new Date(y,0,d),  impact:'low' as const, description:'Weekly initial unemployment claims', currencies:['USD'], time:'08:30 ET' })),
    ...[5,12,19,26].map(d => ({ name:'Jobless Claims', date: new Date(y,1,d),  impact:'low' as const, description:'Weekly initial unemployment claims', currencies:['USD'], time:'08:30 ET' })),
    ...[5,12,19,26].map(d => ({ name:'Jobless Claims', date: new Date(y,2,d),  impact:'low' as const, description:'Weekly initial unemployment claims', currencies:['USD'], time:'08:30 ET' })),
    ...[2,9,16,23,30].map(d => ({ name:'Jobless Claims', date: new Date(y,3,d),impact:'low' as const, description:'Weekly initial unemployment claims', currencies:['USD'], time:'08:30 ET' })),
    ...[7,14,21,28].map(d => ({ name:'Jobless Claims', date: new Date(y,4,d),  impact:'low' as const, description:'Weekly initial unemployment claims', currencies:['USD'], time:'08:30 ET' })),
    ...[4,11,18,25].map(d => ({ name:'Jobless Claims', date: new Date(y,5,d),  impact:'low' as const, description:'Weekly initial unemployment claims', currencies:['USD'], time:'08:30 ET' })),

    // ── ISM Manufacturing ─────────────────────────────────────────────────
    ...[2,3,1,1,1,1,1,3,1,1,2,1].map((d, m) => ({
      name: 'ISM Manufacturing PMI', date: new Date(y,m,d), impact:'medium' as const,
      description:'Manufacturing sector activity — above 50 = expansion', currencies:['USD','NQ'], time:'10:00 ET'
    })),

    // ── ECB Rate Decision (approx 6-weekly) ───────────────────────────────
    { name: 'ECB Rate Decision', date: new Date(y,0,30),  impact:'high',   description:'European Central Bank interest rate decision',        currencies:['EUR/USD','EUR/GBP'], time:'13:15 ET' },
    { name: 'ECB Rate Decision', date: new Date(y,2,5),   impact:'high',   description:'European Central Bank interest rate decision',        currencies:['EUR/USD','EUR/GBP'], time:'13:15 ET' },
    { name: 'ECB Rate Decision', date: new Date(y,3,16),  impact:'high',   description:'European Central Bank interest rate decision',        currencies:['EUR/USD','EUR/GBP'], time:'13:15 ET' },
    { name: 'ECB Rate Decision', date: new Date(y,5,4),   impact:'high',   description:'European Central Bank interest rate decision',        currencies:['EUR/USD','EUR/GBP'], time:'13:15 ET' },
    { name: 'ECB Rate Decision', date: new Date(y,6,23),  impact:'high',   description:'European Central Bank interest rate decision',        currencies:['EUR/USD','EUR/GBP'], time:'13:15 ET' },
    { name: 'ECB Rate Decision', date: new Date(y,8,10),  impact:'high',   description:'European Central Bank interest rate decision',        currencies:['EUR/USD','EUR/GBP'], time:'13:15 ET' },
    { name: 'ECB Rate Decision', date: new Date(y,9,29),  impact:'high',   description:'European Central Bank interest rate decision',        currencies:['EUR/USD','EUR/GBP'], time:'13:15 ET' },
    { name: 'ECB Rate Decision', date: new Date(y,11,10), impact:'high',   description:'European Central Bank interest rate decision',        currencies:['EUR/USD','EUR/GBP'], time:'13:15 ET' },

    // ── BoE Rate Decision (approx 6-weekly) ───────────────────────────────
    { name: 'BoE Rate Decision', date: new Date(y,1,5),   impact:'high',   description:'Bank of England interest rate decision',             currencies:['GBP/USD','EUR/GBP'], time:'12:00 ET' },
    { name: 'BoE Rate Decision', date: new Date(y,2,19),  impact:'high',   description:'Bank of England interest rate decision',             currencies:['GBP/USD','EUR/GBP'], time:'12:00 ET' },
    { name: 'BoE Rate Decision', date: new Date(y,4,7),   impact:'high',   description:'Bank of England interest rate decision',             currencies:['GBP/USD','EUR/GBP'], time:'12:00 ET' },
    { name: 'BoE Rate Decision', date: new Date(y,5,18),  impact:'high',   description:'Bank of England interest rate decision',             currencies:['GBP/USD','EUR/GBP'], time:'12:00 ET' },
    { name: 'BoE Rate Decision', date: new Date(y,7,6),   impact:'high',   description:'Bank of England interest rate decision',             currencies:['GBP/USD','EUR/GBP'], time:'12:00 ET' },
    { name: 'BoE Rate Decision', date: new Date(y,8,17),  impact:'high',   description:'Bank of England interest rate decision',             currencies:['GBP/USD','EUR/GBP'], time:'12:00 ET' },
    { name: 'BoE Rate Decision', date: new Date(y,10,5),  impact:'high',   description:'Bank of England interest rate decision',             currencies:['GBP/USD','EUR/GBP'], time:'12:00 ET' },
    { name: 'BoE Rate Decision', date: new Date(y,11,17), impact:'high',   description:'Bank of England interest rate decision',             currencies:['GBP/USD','EUR/GBP'], time:'12:00 ET' },
  ]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekStart(offset: number): Date {
  const now = new Date()
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const IMPACT_CFG = {
  high:   { label: 'HIGH', color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',  dot: '#f87171', emoji: '🔴' },
  medium: { label: 'MED',  color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)', dot: '#fbbf24', emoji: '🟡' },
  low:    { label: 'LOW',  color: '#6b7280', bg: 'rgba(107,114,128,0.08)',border: 'rgba(107,114,128,0.18)',dot: '#6b7280', emoji: '⚪' },
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [weekOffset, setWeekOffset]     = useState(0)

  const allEvents  = buildCalendar()
  const weekStart  = getWeekStart(weekOffset)
  const weekDays   = getWeekDays(weekStart)
  const today      = new Date(); today.setHours(0,0,0,0)

  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999)

  const weekEvents = allEvents
    .filter(e => e.date >= weekStart && e.date <= weekEnd)
    .filter(e => impactFilter === 'all' || e.impact === impactFilter)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const weekLabel = `${fmt(weekStart)} – ${fmt(weekEnd)}`

  const isCurrentWeek = weekOffset === 0

  return (
    <div className="px-4 md:px-8 pt-6 md:pt-10 pb-12 animate-fade-in">

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <p className="page-label">Market Intelligence</p>
        <h1 className="page-title">Market Events</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', marginTop: 4 }}>
          Economic calendar — key events that move the market
        </p>
      </div>

      {/* ── Week nav + impact filter ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        {/* Week navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setWeekOffset(v => v - 1)}
            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronLeft style={{ width: 15, height: 15 }} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff' }}>
              {isCurrentWeek ? 'This Week' : weekOffset > 0 ? `In ${weekOffset} week${weekOffset > 1 ? 's' : ''}` : `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago`}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{weekLabel}</p>
          </div>
          <button
            onClick={() => setWeekOffset(v => v + 1)}
            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
          >
            <ChevronRight style={{ width: 15, height: 15 }} />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(30,110,255,0.1)', border: '1px solid rgba(30,110,255,0.2)', color: '#4D90FF', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer' }}
            >
              Today
            </button>
          )}
        </div>

        {/* Impact filter */}
        <div style={{ display: 'flex', gap: 5 }}>
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setImpactFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s',
                background: impactFilter === f ? '#4D90FF' : 'rgba(255,255,255,0.04)',
                color: impactFilter === f ? '#fff' : 'rgba(255,255,255,0.4)',
                border: impactFilter === f ? '1px solid #4D90FF' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {f === 'all' ? 'All' : f === 'high' ? '🔴 High' : f === 'medium' ? '🟡 Med' : '⚪ Low'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Day columns (desktop) / day sections (mobile) ── */}
      {weekEvents.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
          <Calendar style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.1)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-body)' }}>
            No events match your filters this week.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: 7-column grid */}
          <div className="hidden md:grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {weekDays.map((day, i) => {
              const isToday     = isSameDay(day, today)
              const isPast      = day < today && !isToday
              const dayEvents   = weekEvents.filter(e => isSameDay(e.date, day))
              const isWeekend   = i >= 5
              return (
                <div key={i}>
                  {/* Day header */}
                  <div style={{
                    padding: '8px 10px', borderRadius: '10px 10px 0 0', marginBottom: 4,
                    background: isToday ? 'rgba(30,110,255,0.15)' : isWeekend ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isToday ? 'rgba(30,110,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderBottom: 'none',
                  }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: isToday ? '#4D90FF' : isPast ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {DAYS[i]}
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: isToday ? '#fff' : isPast ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', lineHeight: 1.1, marginTop: 1 }}>
                      {day.getDate()}
                    </p>
                    {isToday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4D90FF', marginTop: 4 }} />}
                  </div>
                  {/* Events */}
                  <div style={{
                    minHeight: 120, padding: 6, borderRadius: '0 0 10px 10px',
                    background: isToday ? 'rgba(30,110,255,0.05)' : isWeekend ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isToday ? 'rgba(30,110,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                    display: 'flex', flexDirection: 'column', gap: 4,
                    opacity: isPast ? 0.5 : 1,
                  }}>
                    {dayEvents.length === 0 && (
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.1)', fontFamily: 'var(--font-body)', textAlign: 'center', marginTop: 12 }}>—</p>
                    )}
                    {dayEvents.map((ev, j) => {
                      const cfg = IMPACT_CFG[ev.impact]
                      return (
                        <div
                          key={j}
                          style={{
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                            borderRadius: 7, padding: '6px 8px',
                          }}
                          title={ev.description}
                        >
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: cfg.color, lineHeight: 1.2, marginBottom: 2 }}>
                            {cfg.emoji} {ev.name}
                          </p>
                          {ev.time && (
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{ev.time}</p>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 4 }}>
                            {ev.currencies.slice(0, 2).map(c => (
                              <span key={c} style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'rgba(77,144,255,0.1)', color: '#4D90FF', fontFamily: 'var(--font-display)' }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile: day sections */}
          <div className="flex flex-col gap-3 md:hidden">
            {weekDays.map((day, i) => {
              const isToday   = isSameDay(day, today)
              const isPast    = day < today && !isToday
              const dayEvents = weekEvents.filter(e => isSameDay(e.date, day))
              if (dayEvents.length === 0) return null
              return (
                <div key={i} style={{ opacity: isPast ? 0.55 : 1 }}>
                  {/* Day label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isToday ? 'rgba(30,110,255,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isToday ? 'rgba(30,110,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 700, color: isToday ? '#4D90FF' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', lineHeight: 1 }}>{DAYS[i]}</p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: isToday ? '#fff' : 'rgba(255,255,255,0.6)', lineHeight: 1 }}>{day.getDate()}</p>
                    </div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      {day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      {isToday && <span style={{ marginLeft: 6, color: '#4D90FF', fontWeight: 700 }}>· Today</span>}
                    </p>
                  </div>
                  {/* Events */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {dayEvents.map((ev, j) => {
                      const cfg = IMPACT_CFG[ev.impact]
                      return (
                        <div
                          key={j}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                            borderRadius: 12, padding: '12px 14px',
                          }}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, marginTop: 4, flexShrink: 0, boxShadow: `0 0 6px ${cfg.dot}88` }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                              <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff' }}>{ev.name}</p>
                              {ev.time && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{ev.time}</span>}
                            </div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, marginBottom: 6 }}>{ev.description}</p>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {ev.currencies.map(c => (
                                <span key={c} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(77,144,255,0.1)', border: '1px solid rgba(77,144,255,0.18)', color: '#4D90FF', fontFamily: 'var(--font-display)' }}>
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
