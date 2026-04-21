'use client'

import React from 'react'
import { motion } from 'framer-motion'

/* ─── constants ─────────────────────────────────────────────────────────────── */
const BLUE    = '#1E6EFF'
const BLUE_HI = '#4D90FF'
const BG      = '#07070f'

/* ─── easing curves ─────────────────────────────────────────────────────────── */
const EASE_SINE = [0.37, 0, 0.63, 1] as const   // smooth sine-like
const EASE_OUT  = [0.22, 1, 0.36, 1] as const   // spring-like entry

/* ─── status bar components ─────────────────────────────────────────────────── */
function Signal({ s }: { s: number }) {
  return (
    <svg width={Math.round(13*s)} height={Math.round(10*s)} viewBox="0 0 13 10" fill="none">
      <rect x="0"    y="7"   width="2.2" height="3"   rx="0.5" fill="white" fillOpacity="0.92"/>
      <rect x="3.3"  y="5"   width="2.2" height="5"   rx="0.5" fill="white" fillOpacity="0.92"/>
      <rect x="6.6"  y="2.5" width="2.2" height="7.5" rx="0.5" fill="white" fillOpacity="0.92"/>
      <rect x="9.9"  y="0.5" width="2.2" height="9.5" rx="0.5" fill="white" fillOpacity="0.92"/>
    </svg>
  )
}
function Wifi({ s }: { s: number }) {
  return (
    <svg width={Math.round(13*s)} height={Math.round(10*s)} viewBox="0 0 13 10" fill="none">
      <circle cx="6.5" cy="9"   r="1.3"                        fill="white" fillOpacity="0.92"/>
      <path d="M3.5 6 Q6.5 4 9.5 6"   stroke="white" strokeOpacity="0.92" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M1 3.5 Q6.5 -0.5 12 3.5" stroke="white" strokeOpacity="0.92" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function BatteryIcon({ s }: { s: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:1 }}>
      <div style={{ width:Math.round(20*s), height:Math.round(10*s), border:'1px solid rgba(255,255,255,0.55)', borderRadius:Math.round(2.5*s), padding:Math.round(1.5*s) }}>
        <div style={{ width:'76%', height:'100%', background:'white', borderRadius:Math.round(1.5*s) }}/>
      </div>
      <div style={{ width:Math.round(2*s), height:Math.round(5*s), background:'rgba(255,255,255,0.5)', borderRadius:'0 1px 1px 0' }}/>
    </div>
  )
}

/* ─── iPhone frame ───────────────────────────────────────────────────────────── */
function Phone({
  width,
  glowColor = BLUE,
  children,
}: {
  width: number
  glowColor?: string
  children: React.ReactNode
}) {
  const h  = Math.round(width * 2.166)
  const or = Math.round(width * 0.215)
  const ir = Math.round(width * 0.176)
  const sc = width / 210

  return (
    <div style={{ width, height:h, position:'relative', flexShrink:0 }}>
      {/* Contact shadow */}
      <div style={{
        position:'absolute', bottom:-28, left:'8%', right:'8%', height:28,
        background:'rgba(0,0,0,0.65)',
        borderRadius:'50%',
        filter:'blur(18px)',
        zIndex:-1,
      }}/>
      {/* Screen bloom */}
      <div style={{
        position:'absolute', inset:'-22%',
        background:`radial-gradient(ellipse 65% 55% at 50% 42%, ${glowColor}26 0%, transparent 65%)`,
        filter:'blur(14px)',
        zIndex:-1,
        borderRadius:'50%',
      }}/>

      {/* Frame */}
      <div style={{
        width:'100%', height:'100%',
        borderRadius:or,
        background:'linear-gradient(160deg, #454548 0%, #1c1c1e 52%, #2e2e30 100%)',
        padding:5,
        boxShadow:[
          '0 80px 160px rgba(0,0,0,1)',
          '0 40px 80px rgba(0,0,0,0.8)',
          '0 16px 32px rgba(0,0,0,0.6)',
          'inset 0 2px 0 rgba(255,255,255,0.15)',
          'inset 0 -1px 0 rgba(0,0,0,0.8)',
          '0 0 0 0.75px rgba(255,255,255,0.09)',
          `0 0 100px ${glowColor}1a`,
        ].join(','),
      }}>
        {/* Mute */}
        <div style={{ position:'absolute', left:-3.5, top:`${Math.round(h*0.190)}px`, width:3.5, height:Math.round(h*0.044), borderRadius:'2px 0 0 2px', background:'linear-gradient(to right,#414144,#2a2a2c)' }}/>
        {/* Vol + */}
        <div style={{ position:'absolute', left:-3.5, top:`${Math.round(h*0.264)}px`, width:3.5, height:Math.round(h*0.082), borderRadius:'2px 0 0 2px', background:'linear-gradient(to right,#414144,#2a2a2c)' }}/>
        {/* Vol – */}
        <div style={{ position:'absolute', left:-3.5, top:`${Math.round(h*0.360)}px`, width:3.5, height:Math.round(h*0.082), borderRadius:'2px 0 0 2px', background:'linear-gradient(to right,#414144,#2a2a2c)' }}/>
        {/* Power */}
        <div style={{ position:'absolute', right:-3.5, top:`${Math.round(h*0.294)}px`, width:3.5, height:Math.round(h*0.134), borderRadius:'0 2px 2px 0', background:'linear-gradient(to left,#414144,#2a2a2c)' }}/>

        {/* Screen */}
        <div style={{ width:'100%', height:'100%', borderRadius:ir, overflow:'hidden', background:BG, position:'relative', display:'flex', flexDirection:'column' }}>
          {/* Status bar */}
          <div style={{ height:Math.round(width*0.214), flexShrink:0, display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:`0 ${Math.round(width*0.1)}px ${Math.round(width*0.032)}px`, position:'relative', zIndex:5 }}>
            {/* Dynamic Island */}
            <div style={{ position:'absolute', top:Math.round(width*0.038), left:'50%', transform:'translateX(-50%)', width:Math.round(width*0.31), height:Math.round(width*0.052), background:'#000', borderRadius:999 }}/>
            <span style={{ fontSize:Math.round(width*0.056), fontWeight:700, color:'#fff', letterSpacing:'-0.025em', fontFamily:'var(--font-display)' }}>9:41</span>
            <div style={{ display:'flex', alignItems:'center', gap:Math.round(3.5*sc) }}>
              <Signal s={sc*0.78}/>
              <Wifi   s={sc*0.78}/>
              <BatteryIcon s={sc*0.78}/>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
            {children}
          </div>

          {/* Glass sheen */}
          <div style={{ position:'absolute', inset:0, borderRadius:ir, pointerEvents:'none', zIndex:40, background:'linear-gradient(148deg, rgba(255,255,255,0.052) 0%, rgba(255,255,255,0.014) 28%, transparent 55%)' }}/>
          {/* Edge specular (left side lit) */}
          <div style={{ position:'absolute', top:0, left:0, bottom:0, width:3, borderRadius:`${ir}px 0 0 ${ir}px`, background:'linear-gradient(to right, rgba(255,255,255,0.06), transparent)', zIndex:41, pointerEvents:'none' }}/>
        </div>
      </div>
    </div>
  )
}

/* ─── screen contents ────────────────────────────────────────────────────────── */
function DashboardScreen({ w }: { w: number }) {
  const fs  = (n: number) => Math.round(n * w / 210)
  const pad = Math.round(w * 0.058)
  const r   = (n: number) => Math.round(n * w / 210)

  return (
    <div style={{ padding:`${pad}px`, display:'flex', flexDirection:'column', gap:r(6), height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <p style={{ fontSize:fs(6), color:'rgba(255,255,255,0.28)', margin:'0 0 1px' }}>Good morning</p>
          <p style={{ fontSize:fs(11), fontWeight:800, color:'#fff', margin:0, fontFamily:'var(--font-display)', letterSpacing:'-0.03em' }}>Dashboard</p>
        </div>
        <div style={{ width:fs(28), height:fs(28), borderRadius:fs(9), background:`linear-gradient(135deg,${BLUE},${BLUE_HI})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px ${BLUE}66`, flexShrink:0 }}>
          <span style={{ fontSize:fs(10), fontWeight:800, color:'#fff' }}>A</span>
        </div>
      </div>

      {/* P&L Card */}
      <div style={{ background:`linear-gradient(140deg,rgba(30,110,255,0.26) 0%,rgba(8,20,80,0.5) 100%)`, border:'1px solid rgba(30,110,255,0.32)', borderRadius:r(13), padding:`${r(10)}px ${r(12)}px`, flexShrink:0, boxShadow:'0 8px 36px rgba(30,110,255,0.14)' }}>
        <p style={{ fontSize:fs(6), color:'rgba(255,255,255,0.4)', margin:`0 0 ${r(3)}px`, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'var(--font-display)' }}>Monthly P&L</p>
        <p style={{ fontSize:fs(24), fontWeight:800, color:'#fff', margin:`0 0 ${r(2)}px`, fontFamily:'var(--font-display)', letterSpacing:'-0.04em', lineHeight:1 }}>+$2,847</p>
        <p style={{ fontSize:fs(7), color:'#34d399', margin:0 }}>↑ 18.2% from last month</p>
      </div>

      {/* Stat pills */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:r(5), flexShrink:0 }}>
        {[
          { label:'Win Rate', val:'68%',  col:'#34d399' },
          { label:'Trades',   val:'24',   col:'rgba(255,255,255,0.88)' },
          { label:'Streak',   val:'🔥 7', col:'rgba(255,255,255,0.88)' },
        ].map(s => (
          <div key={s.label} style={{ background:'rgba(255,255,255,0.038)', border:'1px solid rgba(255,255,255,0.068)', borderRadius:r(9), padding:`${r(6)}px ${r(4)}px`, textAlign:'center' }}>
            <p style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.28)', margin:`0 0 ${r(2)}px`, fontFamily:'var(--font-display)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{s.label}</p>
            <p style={{ fontSize:fs(10.5), fontWeight:800, color:s.col, margin:0, fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Equity curve */}
      <div style={{ background:'rgba(255,255,255,0.022)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:r(11), padding:`${r(8)}px ${r(9)}px`, flexShrink:0 }}>
        <p style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.24)', margin:`0 0 ${r(5)}px`, fontFamily:'var(--font-display)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Equity Curve</p>
        <svg viewBox="0 0 185 42" style={{ width:'100%', display:'block', overflow:'visible' }}>
          <defs>
            <linearGradient id="ecg2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E6EFF" stopOpacity="0.42"/>
              <stop offset="100%" stopColor="#1E6EFF" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,36 C12,33 20,31 28,26 C38,20 44,24 54,18 C65,12 72,16 84,11 C96,6 106,9 118,7 C130,4 140,6 154,4 C164,2 172,3 185,1" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M0,36 C12,33 20,31 28,26 C38,20 44,24 54,18 C65,12 72,16 84,11 C96,6 106,9 118,7 C130,4 140,6 154,4 C164,2 172,3 185,1 L185,42 L0,42Z" fill="url(#ecg2)"/>
        </svg>
      </div>

      {/* Discipline */}
      <div style={{ background:'rgba(255,255,255,0.022)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:r(11), padding:`${r(9)}px ${r(10)}px`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:r(7) }}>
          <p style={{ fontSize:fs(6.5), color:'rgba(255,255,255,0.36)', margin:0, fontFamily:'var(--font-display)' }}>Discipline Score</p>
          <p style={{ fontSize:fs(10), fontWeight:800, color:BLUE_HI, margin:0, fontFamily:'var(--font-display)' }}>74<span style={{ fontSize:fs(6), color:'rgba(255,255,255,0.22)', fontWeight:400 }}>/100</span></p>
        </div>
        {[
          { label:'Rule adherence', val:82, col:BLUE },
          { label:'Consistency',    val:68, col:'#FBBF24' },
          { label:'Trade quality',  val:71, col:BLUE },
        ].map((b, i) => (
          <div key={b.label} style={{ marginBottom: i < 2 ? r(6) : 0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:r(2.5) }}>
              <span style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.28)' }}>{b.label}</span>
              <span style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.4)', fontWeight:600 }}>{b.val}</span>
            </div>
            <div style={{ height:r(3), background:'rgba(255,255,255,0.08)', borderRadius:999, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${b.val}%`, background:b.col, borderRadius:999, opacity:0.88 }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Coach */}
      <div style={{ background:'rgba(251,191,36,0.065)', border:'1px solid rgba(251,191,36,0.22)', borderRadius:r(11), padding:`${r(7)}px ${r(9)}px`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:r(5), marginBottom:r(3) }}>
          <div style={{ width:r(11), height:r(11), borderRadius:r(4), background:`linear-gradient(135deg,${BLUE},#7840FF)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width={r(6)} height={r(6)} viewBox="0 0 12 12" fill="none"><path d="M6 1l1.4 3.4L11 6l-3.6 1.6L6 11l-1.4-3.4L1 6l3.6-1.6z" fill="white"/></svg>
          </div>
          <span style={{ fontSize:fs(6), fontWeight:700, color:'#FBBF24', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'var(--font-display)' }}>Coach</span>
        </div>
        <p style={{ fontSize:fs(7), color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.55 }}>You've hit 6 trades today. Your average before things slip is 4.</p>
      </div>
    </div>
  )
}

function JournalScreen({ w }: { w: number }) {
  const fs  = (n: number) => Math.round(n * w / 175)
  const r   = (n: number) => Math.round(n * w / 175)
  const pad = Math.round(w * 0.06)

  const trades = [
    { pair:'EUR/USD', dir:'BUY',  pnl:'+$142', win:true  },
    { pair:'GBP/JPY', dir:'SELL', pnl:'-$48',  win:false },
    { pair:'XAU/USD', dir:'BUY',  pnl:'+$210', win:true  },
    { pair:'NAS100',  dir:'SELL', pnl:'+$95',  win:true  },
    { pair:'BTC/USD', dir:'BUY',  pnl:'-$65',  win:false },
  ]

  return (
    <div style={{ padding:`${pad}px`, display:'flex', flexDirection:'column', gap:r(6), height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <span style={{ fontSize:fs(10), fontWeight:800, color:'#fff', fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>Journal</span>
        <div style={{ width:fs(22), height:fs(22), borderRadius:fs(7), background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px ${BLUE}66` }}>
          <span style={{ fontSize:fs(13), color:'#fff', lineHeight:1, marginTop:-1 }}>+</span>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:r(6) }}>
        <span style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.09em', fontFamily:'var(--font-display)', flexShrink:0 }}>Today</span>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
      </div>

      {trades.slice(0,3).map((t,i) => (
        <div key={i} style={{ background:'rgba(255,255,255,0.038)', border:'1px solid rgba(255,255,255,0.068)', borderRadius:r(9), padding:`${r(5)}px ${r(7)}px`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:r(6) }}>
            <div style={{ width:r(5), height:r(5), borderRadius:'50%', background:t.win?'#34d399':'#f87171', flexShrink:0, boxShadow:t.win?'0 0 6px #34d39966':'0 0 6px #f8717166' }}/>
            <div>
              <p style={{ fontSize:fs(7.5), fontWeight:700, color:'rgba(255,255,255,0.85)', margin:0, fontFamily:'var(--font-display)' }}>{t.pair}</p>
              <p style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.3)', margin:0 }}>{t.dir}</p>
            </div>
          </div>
          <span style={{ fontSize:fs(8), fontWeight:700, color:t.win?'#34d399':'#f87171' }}>{t.pnl}</span>
        </div>
      ))}

      <div style={{ display:'flex', alignItems:'center', gap:r(6) }}>
        <span style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.09em', fontFamily:'var(--font-display)', flexShrink:0 }}>Yesterday</span>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
      </div>

      {trades.slice(3).map((t,i) => (
        <div key={i} style={{ background:'rgba(255,255,255,0.038)', border:'1px solid rgba(255,255,255,0.068)', borderRadius:r(9), padding:`${r(5)}px ${r(7)}px`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:r(6) }}>
            <div style={{ width:r(5), height:r(5), borderRadius:'50%', background:t.win?'#34d399':'#f87171', flexShrink:0, boxShadow:t.win?'0 0 6px #34d39966':'0 0 6px #f8717166' }}/>
            <div>
              <p style={{ fontSize:fs(7.5), fontWeight:700, color:'rgba(255,255,255,0.85)', margin:0, fontFamily:'var(--font-display)' }}>{t.pair}</p>
              <p style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.3)', margin:0 }}>{t.dir}</p>
            </div>
          </div>
          <span style={{ fontSize:fs(8), fontWeight:700, color:t.win?'#34d399':'#f87171' }}>{t.pnl}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── floating UI cards ─────────────────────────────────────────────────────── */
function WinRateCard() {
  return (
    <motion.div
      initial={{ opacity:0, y:16, scale:0.94 }}
      animate={{ opacity:1, y:0,  scale:1 }}
      transition={{ duration:0.9, ease:EASE_OUT, delay:1.1 }}
      style={{
        position:'absolute', top:52, right:-8, zIndex:10,
        background:'rgba(10,12,24,0.88)',
        border:'1px solid rgba(30,110,255,0.28)',
        borderRadius:14,
        padding:'10px 14px',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        boxShadow:'0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 0 40px rgba(30,110,255,0.1)',
        minWidth:120,
      }}
    >
      <motion.div
        animate={{ y:[0,-5,0] }}
        transition={{ duration:5.8, ease:EASE_SINE, repeat:Infinity, delay:0.4 }}
      >
        <p style={{ fontSize:8, color:'rgba(255,255,255,0.3)', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'var(--font-display)' }}>Win Rate</p>
        <p style={{ fontSize:22, fontWeight:800, color:'#34d399', margin:'0 0 2px', fontFamily:'var(--font-display)', letterSpacing:'-0.04em', lineHeight:1 }}>68%</p>
        <p style={{ fontSize:8, color:'rgba(52,211,153,0.6)', margin:0 }}>↑ +3% this week</p>
      </motion.div>
    </motion.div>
  )
}

function StreakCard() {
  return (
    <motion.div
      initial={{ opacity:0, y:16, scale:0.94 }}
      animate={{ opacity:1, y:0,  scale:1 }}
      transition={{ duration:0.9, ease:EASE_OUT, delay:1.35 }}
      style={{
        position:'absolute', bottom:70, left:-18, zIndex:10,
        background:'rgba(10,12,24,0.88)',
        border:'1px solid rgba(251,191,36,0.25)',
        borderRadius:14,
        padding:'10px 14px',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        boxShadow:'0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 0 30px rgba(251,191,36,0.08)',
        minWidth:110,
      }}
    >
      <motion.div
        animate={{ y:[0,-4,0] }}
        transition={{ duration:6.4, ease:EASE_SINE, repeat:Infinity, delay:1.2 }}
      >
        <p style={{ fontSize:8, color:'rgba(255,255,255,0.3)', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'var(--font-display)' }}>Trading Streak</p>
        <p style={{ fontSize:22, fontWeight:800, color:'#fff', margin:'0 0 2px', fontFamily:'var(--font-display)', letterSpacing:'-0.04em', lineHeight:1 }}>🔥 7</p>
        <p style={{ fontSize:8, color:'rgba(255,255,255,0.3)', margin:0 }}>days in a row</p>
      </motion.div>
    </motion.div>
  )
}

function CoachCard() {
  return (
    <motion.div
      initial={{ opacity:0, x:20, scale:0.94 }}
      animate={{ opacity:1, x:0,  scale:1 }}
      transition={{ duration:0.9, ease:EASE_OUT, delay:1.55 }}
      style={{
        position:'absolute', bottom:38, right:-14, zIndex:10,
        background:'rgba(10,12,24,0.88)',
        border:'1px solid rgba(120,64,255,0.28)',
        borderRadius:14,
        padding:'10px 13px',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        boxShadow:'0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.06) inset, 0 0 30px rgba(120,64,255,0.1)',
        maxWidth:148,
      }}
    >
      <motion.div
        animate={{ y:[0,-4,0] }}
        transition={{ duration:7.1, ease:EASE_SINE, repeat:Infinity, delay:2 }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
          <div style={{ width:14, height:14, borderRadius:5, background:`linear-gradient(135deg,${BLUE},#7840FF)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="7" height="7" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.4 3.4L11 6l-3.6 1.6L6 11l-1.4-3.4L1 6l3.6-1.6z" fill="white"/></svg>
          </div>
          <span style={{ fontSize:8, fontWeight:700, color:'rgba(180,140,255,0.9)', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'var(--font-display)' }}>Coach</span>
        </div>
        <p style={{ fontSize:9, color:'rgba(255,255,255,0.55)', margin:0, lineHeight:1.5 }}>Your best entries all had confirmation. Stop front-running.</p>
      </motion.div>
    </motion.div>
  )
}

/* ─── main export ────────────────────────────────────────────────────────────── */
/* Fixed phone angles — ONLY translateY animates */
const MAIN_TRANSFORM  = 'perspective(1100px) rotateX(7deg) rotateY(-14deg) rotateZ(-1.5deg)'
const BACK_TRANSFORM  = 'perspective(1100px) rotateX(10deg) rotateY(-30deg) rotateZ(-4deg)'

export default function HeroVisual() {
  return (
    <div style={{ position:'relative', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>

      {/* ── Atmosphere ── */}
      <motion.div
        animate={{ opacity:[0.5,0.8,0.5], scale:[1,1.06,1] }}
        transition={{ duration:6, ease:'easeInOut', repeat:Infinity }}
        style={{ position:'absolute', top:'5%', left:'10%', width:460, height:460, borderRadius:'50%', background:'radial-gradient(circle, rgba(30,110,255,0.28) 0%, transparent 68%)', pointerEvents:'none' }}
      />
      <motion.div
        animate={{ opacity:[0.4,0.7,0.4], scale:[1,1.08,1] }}
        transition={{ duration:8, ease:'easeInOut', repeat:Infinity, delay:2.5 }}
        style={{ position:'absolute', bottom:'4%', right:'12%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(110,50,255,0.22) 0%, transparent 68%)', pointerEvents:'none' }}
      />

      {/* ── Grid ── */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(30,110,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(30,110,255,0.06) 1px, transparent 1px)',
        backgroundSize:'48px 48px',
        maskImage:'radial-gradient(ellipse 90% 90% at 55% 50%, black 20%, transparent 100%)',
        WebkitMaskImage:'radial-gradient(ellipse 90% 90% at 55% 50%, black 20%, transparent 100%)',
      }}/>

      {/* ── Phone cluster ── */}
      <motion.div
        initial={{ opacity:0, y:28 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:1.1, ease:EASE_OUT, delay:0.1 }}
        style={{ position:'relative', width:480, height:560 }}
      >

        {/* Floating cards */}
        <WinRateCard />
        <StreakCard />
        <CoachCard />

        {/* Back phone — Journal (left, more angled, depth-blurred) */}
        <motion.div
          animate={{ y:[0,-12,0] }}
          transition={{ duration:7.8, ease:EASE_SINE, repeat:Infinity, delay:0.9 }}
          style={{
            position:'absolute', left:0, top:68, zIndex:1,
            transform: BACK_TRANSFORM,
            transformOrigin:'center center',
            willChange:'transform',
            filter:'blur(0.6px) brightness(0.72) saturate(0.8)',
          }}
        >
          <Phone width={175} glowColor="rgba(30,110,255,0.65)">
            <JournalScreen w={175} />
          </Phone>
        </motion.div>

        {/* Main phone — Dashboard (right of center, gentle angle) */}
        <motion.div
          animate={{ y:[0,-18,0] }}
          transition={{ duration:6.4, ease:EASE_SINE, repeat:Infinity }}
          style={{
            position:'absolute', left:148, top:12, zIndex:3,
            transform: MAIN_TRANSFORM,
            transformOrigin:'center center',
            willChange:'transform',
          }}
        >
          <Phone width={210} glowColor={BLUE}>
            <DashboardScreen w={210} />
          </Phone>
        </motion.div>

      </motion.div>
    </div>
  )
}
