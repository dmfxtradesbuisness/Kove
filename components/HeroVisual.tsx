'use client'

import React from 'react'

const BLUE    = '#1E6EFF'
const BLUE_HI = '#4D90FF'
const BG      = '#06060f'

/* ── Tiny status-bar icons ── */
function Signal({ s }: { s: number }) {
  return (
    <svg width={Math.round(13 * s)} height={Math.round(10 * s)} viewBox="0 0 13 10" fill="none">
      <rect x="0"   y="7" width="2.2" height="3"   rx="0.6" fill="white" fillOpacity="0.9"/>
      <rect x="3.3" y="5" width="2.2" height="5"   rx="0.6" fill="white" fillOpacity="0.9"/>
      <rect x="6.6" y="2.5" width="2.2" height="7.5" rx="0.6" fill="white" fillOpacity="0.9"/>
      <rect x="9.9" y="0.5" width="2.2" height="9.5" rx="0.6" fill="white" fillOpacity="0.9"/>
    </svg>
  )
}

function Wifi({ s }: { s: number }) {
  return (
    <svg width={Math.round(13 * s)} height={Math.round(10 * s)} viewBox="0 0 13 10" fill="none">
      <circle cx="6.5" cy="9" r="1.2" fill="white" fillOpacity="0.9"/>
      <path d="M3.5 6.2 Q6.5 4.2 9.5 6.2"   stroke="white" strokeOpacity="0.9" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M1 3.5 Q6.5 -0.2 12 3.5"      stroke="white" strokeOpacity="0.9" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function BatteryIcon({ s }: { s: number }) {
  const w = Math.round(20 * s), h = Math.round(10 * s)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <div style={{ width: w, height: h, border: '1px solid rgba(255,255,255,0.55)', borderRadius: Math.round(2.5 * s), padding: Math.round(1.5 * s) }}>
        <div style={{ width: '76%', height: '100%', background: 'white', borderRadius: Math.round(1.5 * s) }} />
      </div>
      <div style={{ width: Math.round(2 * s), height: Math.round(5 * s), background: 'rgba(255,255,255,0.5)', borderRadius: '0 1px 1px 0' }} />
    </div>
  )
}

/* ── Reusable iPhone frame ── */
function Phone({ width, glow = BLUE, children }: { width: number; glow?: string; children: React.ReactNode }) {
  const h  = Math.round(width * 2.166)
  const or = Math.round(width * 0.215) // outer border-radius
  const ir = Math.round(width * 0.175) // inner screen radius
  const sc = width / 200               // scale factor

  return (
    <div style={{
      width, height: h, flexShrink: 0, position: 'relative',
      borderRadius: or,
      background: 'linear-gradient(160deg, #404042 0%, #1c1c1e 55%, #2c2c2e 100%)',
      padding: 5,
      boxShadow: [
        '0 70px 150px rgba(0,0,0,0.98)',
        '0 35px 70px rgba(0,0,0,0.75)',
        '0 12px 28px rgba(0,0,0,0.6)',
        'inset 0 1.5px 0 rgba(255,255,255,0.14)',
        'inset 0 -1px 0 rgba(0,0,0,0.7)',
        '0 0 0 0.75px rgba(255,255,255,0.07)',
        `0 0 90px ${glow}20`,
      ].join(','),
    }}>
      {/* Mute toggle */}
      <div style={{ position:'absolute', left:-3, top:`${Math.round(h*0.19)}px`, width:3, height:Math.round(h*0.045), borderRadius:'2px 0 0 2px', background:'linear-gradient(to right,#3a3a3c,#2a2a2c)' }} />
      {/* Vol + */}
      <div style={{ position:'absolute', left:-3, top:`${Math.round(h*0.265)}px`, width:3, height:Math.round(h*0.082), borderRadius:'2px 0 0 2px', background:'linear-gradient(to right,#3a3a3c,#2a2a2c)' }} />
      {/* Vol – */}
      <div style={{ position:'absolute', left:-3, top:`${Math.round(h*0.362)}px`, width:3, height:Math.round(h*0.082), borderRadius:'2px 0 0 2px', background:'linear-gradient(to right,#3a3a3c,#2a2a2c)' }} />
      {/* Power */}
      <div style={{ position:'absolute', right:-3, top:`${Math.round(h*0.295)}px`, width:3, height:Math.round(h*0.135), borderRadius:'0 2px 2px 0', background:'linear-gradient(to left,#3a3a3c,#2a2a2c)' }} />

      {/* Screen */}
      <div style={{ width:'100%', height:'100%', borderRadius: ir, overflow:'hidden', background: BG, position:'relative', display:'flex', flexDirection:'column' }}>
        {/* Status bar */}
        <div style={{ height: Math.round(width*0.215), flexShrink:0, display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:`0 ${Math.round(width*0.1)}px ${Math.round(width*0.03)}px`, position:'relative', zIndex:5 }}>
          {/* Dynamic Island */}
          <div style={{ position:'absolute', top: Math.round(width*0.038), left:'50%', transform:'translateX(-50%)', width: Math.round(width*0.32), height: Math.round(width*0.052), background:'#000', borderRadius:999 }} />
          <span style={{ fontSize: Math.round(width*0.057), fontWeight:700, color:'#fff', letterSpacing:'-0.025em', fontFamily:'var(--font-display)' }}>9:41</span>
          <div style={{ display:'flex', alignItems:'center', gap: Math.round(3.5*sc) }}>
            <Signal s={sc*0.78} />
            <Wifi   s={sc*0.78} />
            <BatteryIcon s={sc*0.78} />
          </div>
        </div>

        {/* App content */}
        <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
          {children}
        </div>

        {/* Glass sheen */}
        <div style={{ position:'absolute', inset:0, borderRadius:ir, pointerEvents:'none', zIndex:30, background:'linear-gradient(148deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.012) 30%, transparent 58%)' }} />
      </div>
    </div>
  )
}

/* ── Journal screen ── */
function JournalScreen({ w }: { w: number }) {
  const fs = (n: number) => Math.round(n * w / 200)
  const trades = [
    { pair:'EUR/USD', dir:'BUY',  pnl:'+$142', win:true  },
    { pair:'GBP/JPY', dir:'SELL', pnl:'-$48',  win:false },
    { pair:'XAU/USD', dir:'BUY',  pnl:'+$210', win:true  },
  ]
  const prev = [
    { pair:'NAS100',  dir:'SELL', pnl:'+$95',  win:true  },
    { pair:'BTC/USD', dir:'BUY',  pnl:'-$65',  win:false },
  ]
  const pad = Math.round(w * 0.055)
  const gap = Math.round(w * 0.038)

  return (
    <div style={{ padding:`${pad}px`, display:'flex', flexDirection:'column', gap:gap, height:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:fs(10), fontWeight:800, color:'#fff', fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>Journal</span>
        <div style={{ width:fs(22), height:fs(22), borderRadius:fs(7), background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${BLUE}55` }}>
          <span style={{ fontSize:fs(13), color:'#fff', lineHeight:1, marginTop:-1 }}>+</span>
        </div>
      </div>

      {/* Day divider */}
      <Divider label="Today" fs={fs} />

      {trades.map((t, i) => <TradeRow key={i} t={t} fs={fs} pad={pad} />)}

      <Divider label="Yesterday" fs={fs} />

      {prev.map((t, i) => <TradeRow key={i} t={t} fs={fs} pad={pad} />)}
    </div>
  )
}

function Divider({ label, fs }: { label: string; fs: (n:number)=>number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:fs(5) }}>
      <span style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.09em', fontFamily:'var(--font-display)', flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }} />
    </div>
  )
}

function TradeRow({ t, fs, pad }: { t:{pair:string;dir:string;pnl:string;win:boolean}; fs:(n:number)=>number; pad:number }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.035)', border:'1px solid rgba(255,255,255,0.065)', borderRadius:fs(9), padding:`${fs(5)}px ${fs(7)}px`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ display:'flex', alignItems:'center', gap:fs(6) }}>
        <div style={{ width:fs(5), height:fs(5), borderRadius:'50%', background: t.win ? '#34d399' : '#f87171', flexShrink:0, boxShadow: t.win ? '0 0 4px #34d39988' : '0 0 4px #f8717188' }} />
        <div>
          <p style={{ fontSize:fs(7.5), fontWeight:700, color:'rgba(255,255,255,0.85)', margin:0, fontFamily:'var(--font-display)' }}>{t.pair}</p>
          <p style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.3)', margin:0 }}>{t.dir}</p>
        </div>
      </div>
      <span style={{ fontSize:fs(8), fontWeight:700, color: t.win ? '#34d399' : '#f87171' }}>{t.pnl}</span>
    </div>
  )
}

/* ── Dashboard screen ── */
function DashboardScreen({ w }: { w: number }) {
  const fs  = (n: number) => Math.round(n * w / 200)
  const pad = Math.round(w * 0.06)
  const gap = Math.round(w * 0.04)

  return (
    <div style={{ padding:`${pad}px`, display:'flex', flexDirection:'column', gap:gap, height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <p style={{ fontSize:fs(6), color:'rgba(255,255,255,0.28)', margin:'0 0 1px', letterSpacing:'0.01em' }}>Good morning</p>
          <p style={{ fontSize:fs(11.5), fontWeight:800, color:'#fff', margin:0, fontFamily:'var(--font-display)', letterSpacing:'-0.03em' }}>Dashboard</p>
        </div>
        <div style={{ width:fs(28), height:fs(28), borderRadius:fs(9), background:`linear-gradient(135deg,${BLUE},${BLUE_HI})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px ${BLUE}55`, flexShrink:0 }}>
          <span style={{ fontSize:fs(10), fontWeight:800, color:'#fff' }}>A</span>
        </div>
      </div>

      {/* P&L Hero Card */}
      <div style={{ background:`linear-gradient(140deg,rgba(30,110,255,0.25) 0%,rgba(8,24,90,0.45) 100%)`, border:'1px solid rgba(30,110,255,0.3)', borderRadius:fs(13), padding:`${fs(10)}px ${fs(12)}px`, flexShrink:0, boxShadow:'0 8px 32px rgba(30,110,255,0.12)' }}>
        <p style={{ fontSize:fs(6), color:'rgba(255,255,255,0.4)', margin:`0 0 ${fs(3)}px`, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'var(--font-display)' }}>Monthly P&L</p>
        <p style={{ fontSize:fs(24), fontWeight:800, color:'#fff', margin:`0 0 ${fs(2)}px`, fontFamily:'var(--font-display)', letterSpacing:'-0.04em', lineHeight:1 }}>+$2,847</p>
        <p style={{ fontSize:fs(7), color:'#34d399', margin:0 }}>↑ 18.2% from last month</p>
      </div>

      {/* Stat pills */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:fs(5), flexShrink:0 }}>
        {[
          { label:'Win Rate', val:'68%',    col:'#34d399' },
          { label:'Trades',   val:'24',     col:'rgba(255,255,255,0.9)' },
          { label:'Streak',   val:'🔥 7',   col:'rgba(255,255,255,0.9)' },
        ].map((s) => (
          <div key={s.label} style={{ background:'rgba(255,255,255,0.035)', border:'1px solid rgba(255,255,255,0.065)', borderRadius:fs(9), padding:`${fs(6)}px ${fs(4)}px`, textAlign:'center' }}>
            <p style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.28)', margin:`0 0 ${fs(2)}px`, fontFamily:'var(--font-display)', textTransform:'uppercase', letterSpacing:'0.07em' }}>{s.label}</p>
            <p style={{ fontSize:fs(11), fontWeight:800, color:s.col, margin:0, fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Equity curve */}
      <div style={{ background:'rgba(255,255,255,0.022)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:fs(11), padding:`${fs(8)}px ${fs(9)}px`, flexShrink:0 }}>
        <p style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.25)', margin:`0 0 ${fs(5)}px`, fontFamily:'var(--font-display)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Equity Curve</p>
        <svg viewBox="0 0 185 42" style={{ width:'100%', display:'block', overflow:'visible' }}>
          <defs>
            <linearGradient id="ecg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E6EFF" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#1E6EFF" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,36 C10,34 18,32 26,28 C36,23 42,26 52,21 C62,16 70,18 82,13 C94,8 104,11 116,8 C128,5 138,7 152,5 C162,3 172,4 185,2" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M0,36 C10,34 18,32 26,28 C36,23 42,26 52,21 C62,16 70,18 82,13 C94,8 104,11 116,8 C128,5 138,7 152,5 C162,3 172,4 185,2 L185,42 L0,42 Z" fill="url(#ecg)"/>
        </svg>
      </div>

      {/* Discipline score */}
      <div style={{ background:'rgba(255,255,255,0.022)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:fs(11), padding:`${fs(9)}px ${fs(10)}px`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:fs(7) }}>
          <p style={{ fontSize:fs(6.5), color:'rgba(255,255,255,0.38)', margin:0, fontFamily:'var(--font-display)' }}>Discipline Score</p>
          <p style={{ fontSize:fs(10), fontWeight:800, color:BLUE_HI, margin:0, fontFamily:'var(--font-display)' }}>74<span style={{ fontSize:fs(6), color:'rgba(255,255,255,0.22)', fontWeight:400 }}>/100</span></p>
        </div>
        {[
          { label:'Rule adherence', val:82, col:BLUE },
          { label:'Consistency',    val:68, col:'#FBBF24' },
          { label:'Trade quality',  val:71, col:BLUE },
        ].map((b, i) => (
          <div key={b.label} style={{ marginBottom: i < 2 ? fs(6) : 0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:fs(2.5) }}>
              <span style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.28)' }}>{b.label}</span>
              <span style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.4)', fontWeight:600 }}>{b.val}</span>
            </div>
            <div style={{ height:fs(3), background:'rgba(255,255,255,0.07)', borderRadius:999, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${b.val}%`, background:b.col, borderRadius:999, opacity:0.85 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Coach alert */}
      <div style={{ background:'rgba(251,191,36,0.065)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:fs(11), padding:`${fs(7)}px ${fs(9)}px`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:fs(4), marginBottom:fs(3) }}>
          <div style={{ width:fs(11), height:fs(11), borderRadius:fs(4), background:`linear-gradient(135deg,${BLUE},#7840FF)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width={fs(6)} height={fs(6)} viewBox="0 0 12 12" fill="none"><path d="M6 1l1.4 3.4L11 6l-3.6 1.6L6 11l-1.4-3.4L1 6l3.6-1.6z" fill="white"/></svg>
          </div>
          <span style={{ fontSize:fs(6), fontWeight:700, color:'#FBBF24', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'var(--font-display)' }}>Coach</span>
        </div>
        <p style={{ fontSize:fs(7), color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.55 }}>You've hit 6 trades today. Your average before things go wrong is 4.</p>
      </div>
    </div>
  )
}

/* ── Coach chat screen ── */
function CoachScreen({ w }: { w: number }) {
  const fs  = (n: number) => Math.round(n * w / 200)
  const pad = Math.round(w * 0.065)

  const messages = [
    { msg:'Your best trades share one pattern — you waited for confirmation before entering.', side:'ai'  },
    { msg:'How do I stop overtrading?', side:'user' },
    { msg:"Set a hard 4-trade daily limit. After that, your P&L drops 60% on average.", side:'ai'  },
    { msg:'That makes sense. What about revenge trading?', side:'user' },
  ]

  return (
    <div style={{ padding:`${pad}px`, height:'100%', display:'flex', flexDirection:'column', gap:fs(6) }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:fs(6), flexShrink:0 }}>
        <div style={{ width:fs(20), height:fs(20), borderRadius:fs(7), background:`linear-gradient(135deg,${BLUE},#7840FF)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 14px ${BLUE}55` }}>
          <svg width={fs(10)} height={fs(10)} viewBox="0 0 12 12" fill="none"><path d="M6 1l1.4 3.4L11 6l-3.6 1.6L6 11l-1.4-3.4L1 6l3.6-1.6z" fill="white"/></svg>
        </div>
        <div>
          <p style={{ fontSize:fs(9), fontWeight:800, color:'#fff', margin:0, fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>Coach</p>
          <p style={{ fontSize:fs(5.5), color:'rgba(255,255,255,0.28)', margin:0 }}>AI-powered insights</p>
        </div>
      </div>
      <div style={{ height:1, background:'rgba(255,255,255,0.065)', flexShrink:0 }} />

      {/* Messages */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:fs(6), overflow:'hidden' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent: m.side === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth:'90%',
              background: m.side === 'user' ? 'rgba(30,110,255,0.3)' : 'rgba(255,255,255,0.05)',
              border:`1px solid ${m.side === 'user' ? 'rgba(30,110,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: m.side === 'user' ? `${fs(9)}px ${fs(9)}px ${fs(3)}px ${fs(9)}px` : `${fs(9)}px ${fs(9)}px ${fs(9)}px ${fs(3)}px`,
              padding:`${fs(5)}px ${fs(7)}px`,
            }}>
              <p style={{ fontSize:fs(6.5), color: m.side === 'user' ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.6)', margin:0, lineHeight:1.55 }}>{m.msg}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <div style={{ display:'flex', gap:fs(3.5), padding:`${fs(2)}px 0`, alignItems:'center' }}>
          {[0, 0.3, 0.6].map((d, i) => (
            <div key={i} style={{ width:fs(4.5), height:fs(4.5), borderRadius:'50%', background:'rgba(30,110,255,0.6)', animation:`kv-dot-pulse 1.4s ease-in-out infinite ${d}s` }} />
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:fs(11), padding:`${fs(6)}px ${fs(8)}px`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <span style={{ fontSize:fs(6.5), color:'rgba(255,255,255,0.2)', fontStyle:'italic' }}>Ask anything...</span>
        <div style={{ width:fs(18), height:fs(18), borderRadius:fs(6), background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 3px 10px ${BLUE}55` }}>
          <svg width={fs(8)} height={fs(8)} viewBox="0 0 10 10" fill="none"><path d="M1 9L9 5L1 1V4.2L6.5 5L1 5.8V9Z" fill="white"/></svg>
        </div>
      </div>
    </div>
  )
}

/* ── Main export ── */
export default function HeroVisual() {
  return (
    <>
      <style>{`
        @keyframes kv-float-main {
          0%,100% { transform: rotateY(-5deg) rotateX(4deg) rotateZ(-2deg) translateY(0px); }
          50%      { transform: rotateY(-5deg) rotateX(4deg) rotateZ(-2deg) translateY(-18px); }
        }
        @keyframes kv-float-left {
          0%,100% { transform: rotateY(-34deg) rotateX(14deg) rotateZ(-11deg) translateY(0px); }
          50%      { transform: rotateY(-34deg) rotateX(14deg) rotateZ(-11deg) translateY(-13px); }
        }
        @keyframes kv-float-right {
          0%,100% { transform: rotateY(28deg) rotateX(-8deg) rotateZ(9deg) translateY(0px); }
          50%      { transform: rotateY(28deg) rotateX(-8deg) rotateZ(9deg) translateY(-11px); }
        }
        @keyframes kv-cluster-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kv-glow {
          0%,100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.06); }
        }
        @keyframes kv-dot-pulse {
          0%,80%,100% { opacity: 0.25; transform: scale(0.8); }
          40%          { opacity: 1;    transform: scale(1.1); }
        }
        .kv-phone-main  { animation: kv-float-main  6.4s cubic-bezier(0.45,0,0.55,1) infinite; }
        .kv-phone-left  { animation: kv-float-left  7.6s cubic-bezier(0.45,0,0.55,1) infinite 0.7s; }
        .kv-phone-right { animation: kv-float-right 5.9s cubic-bezier(0.45,0,0.55,1) infinite 1.4s; }
        .kv-cluster     { animation: kv-cluster-in  1s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .kv-glow-a { animation: kv-glow 5.5s ease-in-out infinite; }
        .kv-glow-b { animation: kv-glow 7.2s ease-in-out infinite 2.1s; }
        .kv-glow-c { animation: kv-glow 4.8s ease-in-out infinite 1.0s; }
      `}</style>

      <div style={{ position:'relative', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>

        {/* ── Atmosphere ── */}
        <div className="kv-glow-a" style={{ position:'absolute', top:'8%',  left:'8%',  width:440, height:440, borderRadius:'50%', background:'radial-gradient(circle, rgba(30,110,255,0.3) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div className="kv-glow-b" style={{ position:'absolute', bottom:'5%', right:'8%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(110,50,255,0.22) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div className="kv-glow-c" style={{ position:'absolute', top:'55%', left:'40%',  width:180, height:180, borderRadius:'50%', background:`radial-gradient(circle, ${BLUE}18 0%, transparent 70%)`,   pointerEvents:'none' }} />

        {/* ── Grid ── */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(30,110,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(30,110,255,0.055) 1px, transparent 1px)',
          backgroundSize:'46px 46px',
          maskImage:'radial-gradient(ellipse 88% 88% at 38% 50%, black 25%, transparent 100%)',
          WebkitMaskImage:'radial-gradient(ellipse 88% 88% at 38% 50%, black 25%, transparent 100%)',
        }} />

        {/* ── Phone cluster ── */}
        <div className="kv-cluster" style={{ position:'relative', width:480, height:540 }}>

          {/* Phone A — left, back — Journal */}
          <div className="kv-phone-left" style={{ position:'absolute', left:0, top:75, zIndex:1, transformOrigin:'center center', willChange:'transform' }}>
            <Phone width={162} glow="rgba(30,110,255,0.7)">
              <JournalScreen w={162} />
            </Phone>
          </div>

          {/* Phone B — center, front — Dashboard */}
          <div className="kv-phone-main" style={{ position:'absolute', left:130, top:14, zIndex:3, transformOrigin:'center center', willChange:'transform' }}>
            <Phone width={208} glow={BLUE}>
              <DashboardScreen w={208} />
            </Phone>
          </div>

          {/* Phone C — right, mid — Coach */}
          <div className="kv-phone-right" style={{ position:'absolute', right:0, top:95, zIndex:2, transformOrigin:'center center', willChange:'transform' }}>
            <Phone width={155} glow="rgba(120,64,255,0.7)">
              <CoachScreen w={155} />
            </Phone>
          </div>

        </div>
      </div>
    </>
  )
}
