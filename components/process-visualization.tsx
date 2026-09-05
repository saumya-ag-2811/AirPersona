'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Vertical animated pipeline: each stage lights up and a connecting line
 * "flows" downward as the section scrolls into view. Used by the
 * transformation and transparency sections.
 */
export function ProcessVisualization({
  steps,
  className,
}: {
  steps: { title: string; detail: string }[]
  className?: string
}) {
  return (
    <ol className={cn('relative', className)}>
      {/* base line */}
      <span
        className="absolute left-[11px] top-2 bottom-2 w-px bg-hairline"
        aria-hidden="true"
      />
      {/* animated flow line */}
      <motion.span
        className="absolute left-[11px] top-2 w-px origin-top bg-gradient-to-b from-accent to-transparent"
        style={{ bottom: 8 }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: '-20% 0px' }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      {steps.map((step, i) => (
        <motion.li
          key={step.title}
          className="relative flex gap-5 pb-10 last:pb-0"
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.6, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="relative z-10 mt-0.5">
            <motion.span
              className="block h-6 w-6 rounded-full border border-accent bg-background"
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.18 + 0.2 }}
            />
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-display text-lg font-semibold leading-tight">
              {step.title}
            </p>
            <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
              {step.detail}
            </p>
          </div>
        </motion.li>
      ))}
    </ol>
  )
}
