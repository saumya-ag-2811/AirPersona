'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { RiskAssessment, RiskLevel, RiskFactor } from '@/types'
import { riskVisual } from '@/lib/airTheme'
import { AnimatedNumber } from '@/components/motion-primitives'
import { cn } from '@/lib/utils'

export function RiskLevelTag({
  level,
  className,
}: {
  level: RiskLevel
  className?: string
}) {
  const v = riskVisual(level)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.2em]',
        className,
      )}
      style={{ borderColor: v.color, color: v.color, background: v.soft }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: v.color, boxShadow: `0 0 8px ${v.color}` }}
      />
      {v.label} risk
    </span>
  )
}

/** Big animated level word that morphs when the persona changes. */
export function RiskLevelWord({
  level,
  className,
}: {
  level: RiskLevel
  className?: string
}) {
  const v = riskVisual(level)
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.span
        key={level}
        initial={{ y: '110%', opacity: 0, filter: 'blur(8px)' }}
        animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
        exit={{ y: '-110%', opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="block font-display font-semibold leading-none tracking-tight"
        style={{ color: v.color }}
      >
        {v.label.toUpperCase()}
      </motion.span>
    </div>
  )
}

/** Horizontal 0–100 score meter with animated fill in the level color. */
export function RiskMeter({
  assessment,
  className,
}: {
  assessment: RiskAssessment
  className?: string
}) {
  const v = riskVisual(assessment.level)
  const reduce = useReducedMotion()
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex items-end justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Risk score
        </span>
        <span className="font-display text-2xl font-semibold" style={{ color: v.color }}>
          <AnimatedNumber value={assessment.score} />
          <span className="text-sm text-muted-foreground">/100</span>
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${v.color.replace(/\)$/, ' / 0.6)')}, ${v.color})`,
          }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${assessment.score}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

/** Weighted contribution bars for each risk factor. */
export function FactorBars({
  factors,
  color,
  className,
}: {
  factors: RiskFactor[]
  color: string
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <ul className={cn('space-y-4', className)}>
      {factors.map((f, i) => (
        <li key={f.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium">{f.label}</span>
            {f.detail && (
              <span className="font-mono text-xs text-muted-foreground">{f.detail}</span>
            )}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color, transformOrigin: 'left', width: '100%' }}
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: f.weight }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
