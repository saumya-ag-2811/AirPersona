'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Canvas particle field + gradient haze that reacts to environmental severity.
 * `intensity` (0–1) increases particle count, opacity and drift — so a clean
 * environment feels calm and a polluted one feels dense.
 */
export function AtmosphereBackground({
  intensity = 0.5,
  color = 'oklch(0.79 0.14 68)',
  className,
}: {
  intensity?: number
  color?: string
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intensityRef = useRef(intensity)
  intensityRef.current = intensity

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cv = canvas
    const c2d = ctx

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    type P = { x: number; y: number; r: number; vy: number; vx: number; a: number }
    let particles: P[] = []

    const parent = cv.parentElement ?? cv

    function build() {
      const rect = parent.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = width * dpr
      cv.height = height * dpr
      cv.style.width = `${width}px`
      cv.style.height = `${height}px`
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0)

      const base = reduce ? 26 : 90
      const count = Math.round(base * (0.4 + intensityRef.current))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.4,
        vy: -(Math.random() * 0.25 + 0.05),
        vx: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.5 + 0.2,
      }))
    }

    let raf = 0
    function frame() {
      c2d.clearRect(0, 0, width, height)
      const it = intensityRef.current
      for (const p of particles) {
        p.y += p.vy * (0.5 + it)
        p.x += p.vx
        if (p.y < -5) {
          p.y = height + 5
          p.x = Math.random() * width
        }
        if (p.x < -5) p.x = width + 5
        if (p.x > width + 5) p.x = -5
        c2d.beginPath()
        c2d.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        c2d.fillStyle = color.replace(
          /\)$/,
          ` / ${(p.a * (0.35 + it * 0.65)).toFixed(3)})`,
        )
        c2d.fill()
      }
      if (!reduce) raf = requestAnimationFrame(frame)
    }

    build()
    frame()

    const ro = new ResizeObserver(() => build())
    ro.observe(parent)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [color])

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Radial haze that thickens with intensity */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: 0.35 + intensity * 0.5,
          background: `radial-gradient(120% 90% at 50% 100%, ${color.replace(
            /\)$/,
            ` / ${(0.1 + intensity * 0.22).toFixed(3)})`,
          )} 0%, transparent 60%)`,
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
