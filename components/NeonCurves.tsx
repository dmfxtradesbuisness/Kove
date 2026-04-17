'use client'

import { useEffect, useRef } from 'react'

export default function NeonCurves({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let t = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width  = width  * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function tube(
      x0: number, y0: number,
      cx1: number, cy1: number,
      cx2: number, cy2: number,
      x1: number, y1: number,
    ) {
      // Outer bloom
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.bezierCurveTo(cx1,cy1,cx2,cy2,x1,y1)
      ctx.lineWidth = 80; ctx.strokeStyle = 'rgba(20,80,255,0.025)'; ctx.shadowBlur = 0; ctx.stroke()

      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.bezierCurveTo(cx1,cy1,cx2,cy2,x1,y1)
      ctx.lineWidth = 45; ctx.strokeStyle = 'rgba(30,110,255,0.055)'; ctx.shadowColor = '#1E6EFF'; ctx.shadowBlur = 40; ctx.stroke()

      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.bezierCurveTo(cx1,cy1,cx2,cy2,x1,y1)
      ctx.lineWidth = 22; ctx.strokeStyle = 'rgba(40,130,255,0.13)'; ctx.shadowBlur = 22; ctx.stroke()

      // Mid glow
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.bezierCurveTo(cx1,cy1,cx2,cy2,x1,y1)
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(70,150,255,0.32)'; ctx.shadowBlur = 14; ctx.stroke()

      // Core
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.bezierCurveTo(cx1,cy1,cx2,cy2,x1,y1)
      ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(160,210,255,0.85)'; ctx.shadowColor = '#90C8FF'; ctx.shadowBlur = 8; ctx.stroke()

      // Bright spine
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.bezierCurveTo(cx1,cy1,cx2,cy2,x1,y1)
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(230,245,255,0.95)'; ctx.shadowBlur = 4; ctx.stroke()
    }

    function frame() {
      if (!canvas) return
      const W = canvas.getBoundingClientRect().width
      const H = canvas.getBoundingClientRect().height
      ctx.clearRect(0, 0, W, H)
      ctx.lineCap = 'round'

      t += 0.0035

      // Two flowing S-curves that sweep from lower area up-right
      // Curve A (outer)
      const a_x0  = W * (0.90 + Math.sin(t * 0.4) * 0.03)
      const a_y0  = H * (0.92 + Math.cos(t * 0.5) * 0.03)
      const a_cx1 = W * (0.05 + Math.sin(t * 0.35) * 0.06)
      const a_cy1 = H * (0.72 + Math.cos(t * 0.45) * 0.05)
      const a_cx2 = W * (0.88 + Math.cos(t * 0.3) * 0.05)
      const a_cy2 = H * (0.06 + Math.sin(t * 0.4) * 0.05)
      const a_x1  = W * (1.02 + Math.sin(t * 0.38) * 0.02)
      const a_y1  = H * (0.18 + Math.cos(t * 0.42) * 0.04)

      // Curve B (inner, runs parallel to A, slightly offset)
      const b_x0  = W * (0.84 + Math.sin(t * 0.4  + 0.4) * 0.03)
      const b_y0  = H * (0.99 + Math.cos(t * 0.5  + 0.4) * 0.01)
      const b_cx1 = W * (0.0  + Math.sin(t * 0.35 + 0.4) * 0.05)
      const b_cy1 = H * (0.78 + Math.cos(t * 0.45 + 0.4) * 0.05)
      const b_cx2 = W * (0.80 + Math.cos(t * 0.3  + 0.4) * 0.05)
      const b_cy2 = H * (0.12 + Math.sin(t * 0.4  + 0.4) * 0.05)
      const b_x1  = W * (0.97 + Math.sin(t * 0.38 + 0.4) * 0.02)
      const b_y1  = H * (0.26 + Math.cos(t * 0.42 + 0.4) * 0.04)

      tube(a_x0, a_y0, a_cx1, a_cy1, a_cx2, a_cy2, a_x1, a_y1)
      tube(b_x0, b_y0, b_cx1, b_cy1, b_cx2, b_cy2, b_x1, b_y1)

      ctx.shadowBlur = 0
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />
}
