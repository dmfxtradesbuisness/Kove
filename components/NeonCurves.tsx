'use client'

import { useEffect, useRef } from 'react'

/**
 * Animated blue neon light-ribbon effect.
 * Two flowing bezier curves rendered on canvas with a tube/glow look.
 * Control points oscillate sinusoidally — curves warp and breathe continuously.
 */
export default function NeonCurves({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let raf = 0
    let t   = 0

    /* ── Size the canvas to its CSS dimensions at device pixel ratio ── */
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width  = width  * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    /* ── Draw one bezier curve with layered glow (tube effect) ── */
    function drawTube(
      p0x: number, p0y: number,
      cp1x: number, cp1y: number,
      cp2x: number, cp2y: number,
      p3x: number, p3y: number,
      hue: number,
    ) {
      const layers = [
        { w: 44, a: 0.022, blur: 55 },
        { w: 28, a: 0.055, blur: 35 },
        { w: 14, a: 0.13,  blur: 20 },
        { w:  6, a: 0.38,  blur: 10 },
        { w:  2, a: 0.85,  blur:  4 },
        { w:  1, a: 1.0,   blur:  2 },
      ]
      layers.forEach(({ w, a, blur }) => {
        ctx.beginPath()
        ctx.moveTo(p0x, p0y)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p3x, p3y)
        ctx.lineWidth   = w
        ctx.lineCap     = 'round'
        ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${a})`
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`
        ctx.shadowBlur  = blur
        ctx.stroke()
      })
    }

    function frame() {
      if (!canvas) return
      const W = canvas.getBoundingClientRect().width
      const H = canvas.getBoundingClientRect().height
      ctx.clearRect(0, 0, W, H)

      t += 0.005

      // ── Curve A (primary — vivid blue, upper sweep) ──────────────────
      const a_p0x  = W * 0.0
      const a_p0y  = H * (0.38 + Math.sin(t * 0.7)  * 0.08)
      const a_cp1x = W * (0.28 + Math.sin(t * 0.5)  * 0.12)
      const a_cp1y = H * (0.05 + Math.cos(t * 0.65) * 0.14)
      const a_cp2x = W * (0.62 + Math.cos(t * 0.45) * 0.10)
      const a_cp2y = H * (0.78 + Math.sin(t * 0.55) * 0.12)
      const a_p3x  = W * 1.0
      const a_p3y  = H * (0.50 + Math.cos(t * 0.6)  * 0.10)

      // ── Curve B (secondary — cyan-blue, lower sweep) ──────────────────
      const b_p0x  = W * 0.0
      const b_p0y  = H * (0.62 + Math.cos(t * 0.6)  * 0.07)
      const b_cp1x = W * (0.32 + Math.cos(t * 0.4)  * 0.14)
      const b_cp1y = H * (0.90 + Math.sin(t * 0.5)  * 0.07)
      const b_cp2x = W * (0.58 + Math.sin(t * 0.55) * 0.09)
      const b_cp2y = H * (0.10 + Math.cos(t * 0.45) * 0.14)
      const b_p3x  = W * 1.0
      const b_p3y  = H * (0.45 + Math.sin(t * 0.68) * 0.09)

      drawTube(a_p0x, a_p0y, a_cp1x, a_cp1y, a_cp2x, a_cp2y, a_p3x, a_p3y, 218)
      drawTube(b_p0x, b_p0y, b_cp1x, b_cp1y, b_cp2x, b_cp2y, b_p3x, b_p3y, 200)

      ctx.shadowBlur  = 0
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
