'use client'

export default function HeroVisual() {
  return (
    <>
      <style>{`
        @keyframes float-a {
          0%,100% { transform: rotateY(-22deg) rotateX(8deg) rotateZ(-6deg) translateY(0px); }
          50%      { transform: rotateY(-22deg) rotateX(8deg) rotateZ(-6deg) translateY(-14px); }
        }
        @keyframes float-b {
          0%,100% { transform: rotateY(18deg) rotateX(-6deg) rotateZ(8deg) translateY(0px); }
          50%      { transform: rotateY(18deg) rotateX(-6deg) rotateZ(8deg) translateY(-10px); }
        }
        @keyframes float-c {
          0%,100% { transform: rotateY(-8deg) rotateX(3deg) rotateZ(-2deg) translateY(0px); }
          50%      { transform: rotateY(-8deg) rotateX(3deg) rotateZ(-2deg) translateY(-18px); }
        }
        @keyframes pulse-glow {
          0%,100% { opacity: 0.55; }
          50%      { opacity: 0.85; }
        }
        @keyframes bar-grow {
          from { width: 0; }
        }
        .phone-a { animation: float-a 5.2s ease-in-out infinite; }
        .phone-b { animation: float-b 6.1s ease-in-out infinite 0.8s; }
        .phone-c { animation: float-c 4.8s ease-in-out infinite 1.6s; }
        .glow-pulse { animation: pulse-glow 4s ease-in-out infinite; }
      `}</style>

      <div style={{
        position: 'relative',
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: '1100px',
        overflow: 'hidden',
      }}>

        {/* ── Atmosphere glows ── */}
        <div className="glow-pulse" style={{
          position: 'absolute', top: '10%', left: '15%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,110,255,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '8%', right: '10%',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120,60,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'pulse-glow 6s ease-in-out infinite 2s',
        }} />

        {/* ── Grid overlay ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(30,110,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,110,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 40% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 40% 50%, black 40%, transparent 100%)',
        }} />

        {/* ── Phone cluster ── */}
        <div style={{ position: 'relative', width: 420, height: 520 }}>

          {/* ── PHONE A — far left, heavy tilt ── */}
          <div className="phone-a" style={{
            position: 'absolute', left: -30, top: 60,
            width: 155, height: 330,
            borderRadius: 28,
            background: 'linear-gradient(160deg, #141428 0%, #0a0a18 100%)',
            border: '1.5px solid rgba(30,110,255,0.25)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 40px rgba(30,110,255,0.12)',
            overflow: 'hidden',
          }}>
            {/* Notch */}
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 44, height: 6, background: '#0a0a18', borderRadius: 999, zIndex: 2 }} />
            {/* Screen content — Trade log */}
            <div style={{ padding: '26px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6, height: '100%' }}>
              <p style={{ fontSize: 7, fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Trade Log</p>
              {[
                { pair: 'EUR/USD', type: 'BUY', pnl: '+$142', col: '#34d399' },
                { pair: 'GBP/JPY', type: 'SELL', pnl: '-$48', col: '#f87171' },
                { pair: 'XAU/USD', type: 'BUY', pnl: '+$210', col: '#34d399' },
                { pair: 'NAS100', type: 'SELL', pnl: '+$95', col: '#34d399' },
              ].map((t, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8, padding: '6px 8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <p style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{t.pair}</p>
                    <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{t.type}</p>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, color: t.col }}>{t.pnl}</span>
                </div>
              ))}
              {/* Mini chart */}
              <div style={{ marginTop: 4, background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: 8, flex: 1 }}>
                <svg viewBox="0 0 120 50" style={{ width: '100%' }}>
                  <polyline
                    points="0,40 15,35 30,38 45,22 60,28 75,15 90,18 105,8 120,12"
                    fill="none" stroke="#1E6EFF" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                  <polyline
                    points="0,40 15,35 30,38 45,22 60,28 75,15 90,18 105,8 120,12"
                    fill="url(#ga)" stroke="none"
                  />
                  <defs>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E6EFF" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#1E6EFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* ── PHONE B — center, main hero phone ── */}
          <div className="phone-c" style={{
            position: 'absolute', left: 100, top: 0,
            width: 185, height: 400,
            borderRadius: 34,
            background: 'linear-gradient(170deg, #12122a 0%, #080818 100%)',
            border: '1.5px solid rgba(30,110,255,0.35)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 60px rgba(30,110,255,0.18)',
            overflow: 'hidden',
          }}>
            {/* Notch */}
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 52, height: 7, background: '#080818', borderRadius: 999, zIndex: 2 }} />
            {/* Screen — Dashboard */}
            <div style={{ padding: '32px 14px 14px', height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Good morning</p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>Dashboard</p>
                </div>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: 'linear-gradient(135deg,#1E6EFF,#4D90FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', opacity: 0.9 }} />
                </div>
              </div>

              {/* PnL card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(30,110,255,0.2), rgba(10,30,80,0.4))',
                border: '1px solid rgba(30,110,255,0.25)',
                borderRadius: 14, padding: '10px 12px',
              }}>
                <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.4)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Monthly P&L</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>+$1,842</p>
                <p style={{ fontSize: 7, color: '#34d399', margin: '2px 0 0' }}>↑ 12.4% this month</p>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Win Rate', val: '68%', col: '#34d399' },
                  { label: 'Streak', val: '🔥 7', col: '#fff' },
                  { label: 'Trades', val: '24', col: '#fff' },
                  { label: 'Avg RR', val: '1:2.4', col: '#4D90FF' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10, padding: '6px 8px',
                  }}>
                    <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.3)', margin: '0 0 2px' }}>{s.label}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: s.col, margin: 0, fontFamily: 'var(--font-display)' }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Discipline score */}
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Discipline Score</p>
                  <p style={{ fontSize: 7, fontWeight: 700, color: '#4D90FF', margin: 0 }}>74/100</p>
                </div>
                {[
                  { label: 'Rule adherence', val: 82, col: '#1E6EFF' },
                  { label: 'Consistency', val: 68, col: '#FBBF24' },
                ].map((b) => (
                  <div key={b.label} style={{ marginBottom: 4 }}>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${b.val}%`, background: b.col, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Coach alert */}
              <div style={{
                background: 'rgba(251,191,36,0.07)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: 10, padding: '7px 9px',
                flex: 1,
              }}>
                <p style={{ fontSize: 6, fontWeight: 700, color: '#FBBF24', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>⚠ Coach</p>
                <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>You've hit 6 trades today. Your average before things slip is 4.</p>
              </div>
            </div>
          </div>

          {/* ── PHONE C — right, tilted other way ── */}
          <div className="phone-b" style={{
            position: 'absolute', right: -20, top: 80,
            width: 155, height: 320,
            borderRadius: 28,
            background: 'linear-gradient(160deg, #130e2a 0%, #0a0818 100%)',
            border: '1.5px solid rgba(120,60,255,0.22)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 40px rgba(120,60,255,0.1)',
            overflow: 'hidden',
          }}>
            {/* Notch */}
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 44, height: 6, background: '#0a0818', borderRadius: 999, zIndex: 2 }} />
            {/* Screen — AI Coach */}
            <div style={{ padding: '26px 12px 12px', height: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <div style={{ width: 14, height: 14, borderRadius: 5, background: 'linear-gradient(135deg,#1E6EFF,#7840FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                </div>
                <p style={{ fontSize: 8, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>Kove Coach</p>
              </div>

              {[
                { msg: "Your best trades all share one thing — you waited for confirmation.", side: 'ai' },
                { msg: "How do I reduce overtrading?", side: 'user' },
                { msg: "Set a hard limit of 4 trades/day. Your data shows P&L drops 60% after that.", side: 'ai' },
              ].map((m, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: m.side === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '85%',
                    background: m.side === 'user'
                      ? 'rgba(30,110,255,0.25)'
                      : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${m.side === 'user' ? 'rgba(30,110,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: m.side === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                    padding: '5px 7px',
                  }}>
                    <p style={{ fontSize: 7, color: m.side === 'user' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>{m.msg}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <div style={{ display: 'flex', gap: 3, padding: '4px 0', alignItems: 'center' }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: 'rgba(30,110,255,0.6)',
                    animation: `pulse-glow 1.2s ease-in-out infinite ${d}s`,
                  }} />
                ))}
              </div>

              {/* Bottom tag */}
              <div style={{ marginTop: 'auto', background: 'rgba(30,110,255,0.08)', border: '1px solid rgba(30,110,255,0.15)', borderRadius: 8, padding: '5px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: 6, color: '#4D90FF', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI-powered insights</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
