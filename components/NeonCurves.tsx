'use client'

import { useEffect, useRef } from 'react'

/**
 * Neon blue light-trail ribbon — a single continuous curve on the right side.
 * Enters upper-right → arcs leftward → curls at the bottom → sweeps out lower-right.
 * Painted as a long-exposure neon photograph: many stacked blurred strokes
 * from a huge faint outer bloom down to a bright white-blue core.
 */
export default function NeonCurves({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let t   = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width  = Math.max(1, Math.round(width  * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    /**
     * Build the ribbon path. Five chained bezier segments shaped to match
     * the reference: a sweeping top arc → a downward plunge → a tight curl
     * → a soft S back out to the lower-right.  Start/end points are
     * slightly off-canvas so the ribbon tapers out of frame, not into a dot.
     *
     * Warp offsets (w1–w8) make each control point breathe at its own
     * sinusoidal phase so the whole shape flexes organically.
     */
    function buildPath(W: number, H: number) {
      const w1 = Math.sin(t * 1.10)          * 0.018
      const w2 = Math.cos(t * 0.85)          * 0.020
      const w3 = Math.sin(t * 0.70 + 1.00)   * 0.022
      const w4 = Math.cos(t * 0.95 + 0.60)   * 0.020
      const w5 = Math.sin(t * 1.05 + 0.40)   * 0.018
      const w6 = Math.cos(t * 0.80 + 1.20)   * 0.022
      const w7 = Math.sin(t * 0.92 + 0.25)   * 0.016
      const w8 = Math.cos(t * 0.78 + 1.55)   * 0.018

      ctx.beginPath()

      // Entry — off-canvas upper-right
      ctx.moveTo(W * (1.06 + w1), H * (0.10 + w2))

      // Seg 1 — top arc sweeping leftward & down
      ctx.bezierCurveTo(
        W * (0.92 + w3), H * (0.14 + w4),
        W * (0.74 + w5), H * (0.12 + w6),
        W * (0.60 + w7), H * (0.30 + w8),
      )

      // Seg 2 — plunge down toward the curl
      ctx.bezierCurveTo(
        W * (0.48 + w1), H * (0.44 + w2),
        W * (0.38 + w3), H * (0.52 + w4),
        W * (0.40 + w5), H * (0.64 + w6),
      )

      // Seg 3 — the tight curl (doubles back upward briefly)
      ctx.bezierCurveTo(
        W * (0.42 + w7), H * (0.76 + w8),
        W * (0.54 + w1), H * (0.76 + w2),
        W * (0.56 + w3), H * (0.66 + w4),
      )

      // Seg 4 — rise slightly out of the curl
      ctx.bezierCurveTo(
        W * (0.58 + w5), H * (0.58 + w6),
        W * (0.54 + w7), H * (0.52 + w8),
        W * (0.64 + w1), H * (0.56 + w2),
      )

      // Seg 5 — long sweep out to lower-right, tapering off-canvas
      ctx.bezierCurveTo(
        W * (0.78 + w3), H * (0.60 + w4),
        W * (0.94 + w5), H * (0.70 + w6),
        W * (1.08 + w7), H * (0.82 + w8),
      )
    }

    /**
     * Eight stacked strokes from a huge faint outer bloom down to a bright
     * white-blue spine.  Each layer re-draws the same path with a different
     * width / alpha / shadow — this is what produces the long-exposure
     * neon-photograph look (rather than a single flat stroke).
     */
    function paintTube(W: number, H: number) {
      // L1 — deep outer halo (very wide, very faint)
      buildPath(W, H)
      ctx.lineWidth   = 160
      ctx.strokeStyle = 'rgba(12,60,220,0.022)'
      ctx.shadowBlur  = 0
      ctx.stroke()

      // L2 — outer bloom
      buildPath(W, H)
      ctx.lineWidth   = 95
      ctx.strokeStyle = 'rgba(20,80,240,0.045)'
      ctx.shadowColor = '#1E6EFF'
      ctx.shadowBlur  = 60
      ctx.stroke()

      // L3 — wide halo
      buildPath(W, H)
      ctx.lineWidth   = 55
      ctx.strokeStyle = 'rgba(30,110,255,0.085)'
      ctx.shadowBlur  = 40
      ctx.stroke()

      // L4 — mid halo
      buildPath(W, H)
      ctx.lineWidth   = 28
      ctx.strokeStyle = 'rgba(50,140,255,0.18)'
      ctx.shadowBlur  = 26
      ctx.stroke()

      // L5 — inner glow
      buildPath(W, H)
      ctx.lineWidth   = 14
      ctx.strokeStyle = 'rgba(90,175,255,0.42)'
      ctx.shadowColor = '#6DB4FF'
      ctx.shadowBlur  = 18
      ctx.stroke()

      // L6 — bright tube
      buildPath(W, H)
      ctx.lineWidth   = 6
      ctx.strokeStyle = 'rgba(160,210,255,0.85)'
      ctx.shadowColor = '#A6D2FF'
      ctx.shadowBlur  = 12
      ctx.stroke()

      // L7 — white-blue core
      buildPath(W, H)
      ctx.lineWidth   = 2.6
      ctx.strokeStyle = 'rgba(225,240,255,0.95)'
      ctx.shadowColor = '#DFF0FF'
      ctx.shadowBlur  = 6
      ctx.stroke()

      // L8 — ultra-bright spine (a thin white thread inside)
      buildPath(W, H)
      ctx.lineWidth   = 1.1
      ctx.strokeStyle = 'rgba(255,255,255,0.98)'
      ctx.shadowBlur  = 3
      ctx.stroke()
    }

    function frame() {
      if (!canvas) return
      const W = canvas.getBoundingClientRect().width
      const H = canvas.getBoundingClientRect().height
      ctx.clearRect(0, 0, W, H)
      ctx.lineCap  = 'round'
      ctx.lineJoin = 'round'

      t += 0.0028

      paintTube(W, H)

      ctx.shadowBlur = 0
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
