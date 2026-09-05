'use client'

import { AnimatePresence, motion } from 'motion/react'
import { TrendingUp, Loader2 } from 'lucide-react'
import { Section, SectionLabel } from '@/components/section-kit'
import { Reveal } from '@/components/motion-primitives'
import { HistoricalChart } from '@/components/historical-chart'
import { useAirPersona } from '@/components/air-persona-provider'

export function HistorySection() {
  const { history, historyInsight, isInsightLoading } = useAirPersona()

  const elevatedDays = history.filter(
    (d) => d.level === 'ELEVATED' || d.level === 'HIGH' || d.level === 'SEVERE',
  ).length

  return (
    <Section id="insights">
      <Reveal>
        <SectionLabel index="08">The last 7 days</SectionLabel>
      </Reveal>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Reveal delay={0.05}>
          <h2 className="max-w-2xl text-balance font-display display-tight text-[clamp(2.25rem,6vw,4.5rem)] font-semibold">
            A week of air, told as a story.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
            Elevated environmental risk was observed on{' '}
            <span className="text-foreground">{elevatedDays} of the last 7 days</span>. Hover any
            point to read that day.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-14">
        <HistoricalChart data={history} />
      </Reveal>

      {/* ── AI weekly insight narrative ───────────────────────────────────────── */}
      <Reveal delay={0.14} className="mt-10">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/25 p-6 sm:p-8">
          {/* background accent blob */}
          <div
            className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-30"
            style={{ background: 'oklch(0.79 0.14 68 / 0.4)' }}
            aria-hidden="true"
          />

          <div className="relative flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
              Weekly trend synthesis
            </span>
            {isInsightLoading && (
              <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="relative mt-4 min-h-[3.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={historyInsight.paragraph}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45 }}
                className="text-pretty text-base leading-relaxed text-foreground/85"
              >
                {historyInsight.paragraph}
              </motion.p>
            </AnimatePresence>
          </div>

          {historyInsight.source !== 'fallback' && (
            <div className="relative mt-4 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                Synthesised by Gemini
              </span>
            </div>
          )}
        </div>
      </Reveal>
    </Section>
  )
}
