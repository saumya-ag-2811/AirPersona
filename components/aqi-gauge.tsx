'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { aqiColor, aqiCategory } from '@/lib/airTheme'
import { AnimatedNumber } from '@/components/motion-primitives'
import { cn } from '@/lib/utils'

/**
 * Large animated AQI gauge. A 270° arc fills to represent severity on a
 * 0–300 scale; the color shifts through the AQI categories.
 */
export function AQIGauge({
  aqi,
  size = 320,
  className,
}: {
  aqi: number
  size?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const reduce = useReducedMotion()

  const stroke = 14
  const r = (size - stroke) / 2 - 6
  const cx = size / 2
  const cy = size / 2
  const sweep = 270 // degrees
  const start = 135 // start angle (bottom-left)

  const circumference = 2 * Math.PI * r
  const arcLen = (sweep / 360) * circumference
  const gap = circumference - arcLen
  const pct = Math.min(aqi / 300, 1)
  const color = aqiColor(aqi)

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Air Quality Index ${aqi}, ${aqiCategory(aqi)}`}
      >
        <g transform={`rotate(${start} ${cx} ${cy})`}>
          {/* track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${gap}`}
          />
          {/* value arc */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${gap}`}
            initial={{ strokeDashoffset: reduce ? arcLen * (1 - pct) : arcLen }}
            animate={inView ? { strokeDashoffset: arcLen * (1 - pct) } : undefined}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              filter: `drop-shadow(0 0 14px ${color.replace(/\)$/, ' / 0.5)')})`,
            }}
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <AnimatedNumber
          value={aqi}
          className="font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl"
        />
        <span className="mt-2 font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">
          AQI
        </span>
        <span
          className="mt-3 max-w-[70%] text-pretty text-xs font-medium uppercase tracking-wide"
          style={{ color }}
        >
          {aqiCategory(aqi)}
        </span>
      </div>
    </div>
  )
}
