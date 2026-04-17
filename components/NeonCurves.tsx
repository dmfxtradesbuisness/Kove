'use client'

import { useEffect, useRef } from 'react'

/**
 * Animated neon blue ribbon — single flowing swoosh with a soft loop on the right.
 * Multi-layer stroke gives tube/bloom appearance; control points warp sinusoidally.
 */
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
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Draw a path once with six stacked strokes for the tube/bloom effect
    function strokeTube(buildPath: () => void) {
      // 1. Outer bloom — huge, very faint
      buildPath()
      ctx.lineWidth = 110
      ctx.strokeStyle = 'rgba(20,80,255,0.025)'
      ctx.shadowBlur = 0
      ctx.stroke()

      // 2. Wide halo
      buildPath()
      ctx.lineWidth = 55
      ctx.strokeStyle = 'rgba(30,110,255,0.06)'
      ctx.shadowColor = '#1E6EFF'
      ctx.shadowBlur  = 45
      ctx.stroke()

      // 3. Mid halo
      buildPath()
      ctx.lineWidth = 28
      ctx.strokeStyle = 'rgba(40,130,255,0.14)'
      ctx.shadowBlur  = 26
      ctx.stroke()

      // 4. Inner glow
      buildPath()
      ctx.lineWidth = 12
      ctx.strokeStyle = 'rgba(80,160,255,0.35)'
      ctx.shadowBlur  = 16
      ctx.stroke()

      // 5. Core
      buildPath()
      ctx.lineWidth = 4
      ctx.strokeStyle = 'rgba(170,215,255,0.9)'
      ctx.shadowColor = '#A6D2FF'
      ctx.shadowBlur  = 10
      ctx.stroke()

      // 6. Bright spine
      buildPath()
      ctx.lineWidth = 1.3
      ctx.strokeStyle = 'rgba(240,250,255,0.95)'
      ctx.shadowBlur  = 4
      ctx.stroke()
    }

    function frame() {
      if (!canvas) return
      const W = canvas.getBoundingClientRect().width
      const H = canvas.getBoundingClientRect().height
      ctx.clearRect(0, 0, W, H)
      ctx.lineCap  = 'round'
      ctx.lineJoin = 'round'

      t += 0.0032

      // Warp offsets — each control point breathes at a slightly different phase
      const w1 = Math.sin(t * 1.1) * 0.025
      const w2 = Math.cos(t * 0.8) * 0.025
      const w3 = Math.sin(t * 0.7 + 1.0) * 0.03
      const w4 = Math.cos(t * 0.9 + 0.6) * 0.025
      const w5 = Math.sin(t * 1.0 + 0.4) * 0.02
      const w6 = Math.cos(t * 0.75 + 1.2) * 0.025

      // Continuous flowing ribbon built from 3 chained bezier segments.
      // Sweeps from upper-right → curls back → dives down-right → sweeps out to the right.
      const buildPath = () => {
        ctx.beginPath()

        // Start — upper middle-right, curl entry
        ctx.moveTo(
          W * (0.58 + w1),
          H * (0.32 + w2),
        )

        // Seg 1 — arcs up and right into a curl at the top (the "hook")
        ctx.bezierCurveTo(
          W * (0.78 + w3), H * (0.08 + w4),
          W * (1.02 + w1), H * (0.18 + w2),
          W * (0.92 + w5), H * (0.42 + w6),
        )

        // Seg 2 — dives down and left along the body of the ribbon
        ctx.bezierCurveTo(
          W * (0.82 + w3), H * (0.68 + w4),
          W * (0.55 + w5), H * (0.98 + w6),
          W * (0.42 + w1), H * (0.88 + w2),
        )

        // Seg 3 — sweeps back out low and right, exiting frame
        ctx.bezierCurveTo(
          W * (0.30 + w3), H * (0.80 + w4),
          W * (0.28 + w5), H * (0.58 + w6),
          W * (0.18 + w1), H * (0.52 + w2),
        )
      }

      strokeTube(buildPath)
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
