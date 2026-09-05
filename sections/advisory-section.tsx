'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Sparkles, Check, ShieldAlert, Loader2 } from 'lucide-react'
import { Section, SectionLabel } from '@/components/section-kit'
import { Reveal } from '@/components/motion-primitives'
import { AskAirPersona } from '@/components/ask-airpersona'
import { useAirPersona } from '@/components/air-persona-provider'
import { riskVisual } from '@/lib/airTheme'

export function AdvisorySection() {
  const { advisory, assessment, isAdvisoryLoading } = useAirPersona()
  const v = riskVisual(assessment.level)
  const advisoryKey = advisory.body

  return (
    <Section id="advisory">
      <Reveal>
        <SectionLabel index="07">AI advisory</SectionLabel>
      </Reveal>

      <Reveal delay={0.05} className="mt-10">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/40 p-8 sm:p-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
            style={{ background: v.soft }}
            aria-hidden="true"
          />

          {/* Header */}
          <div className="relative flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
              AI-generated environmental guidance
            </span>
            {isAdvisoryLoading && (
              <Loader2 className="ml-2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          <h2 className="relative mt-6 max-w-3xl text-balance font-display display-tight text-[clamp(1.75rem,4.5vw,3.25rem)] font-semibold">
            What this means for you
          </h2>

          {/* Body */}
          <div className="relative mt-6 min-h-[5rem] max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.p
                key={advisoryKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
                className="text-pretty text-lg leading-relaxed text-foreground/90"
              >
                {advisory.body}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Reasons + Suggestions */}
          <div className="relative mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Why this advisory?
              </p>
              <ul className="space-y-2.5">
                {advisory.reasons.map((r) => (
                  <li key={r} className="flex items-center gap-3 text-sm">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: v.color }}
                    />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Suggested actions
              </p>
              <ul className="space-y-2.5">
                {advisory.suggestions.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-pretty">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="relative mt-10 flex items-center gap-2 border-t border-hairline pt-6">
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {advisory.disclaimer}
            </span>
          </div>
        </div>
      </Reveal>

      {/* ── Ask AirPersona chat ─────────────────────────────────────────────── */}
      <Reveal delay={0.12}>
        <AskAirPersona />
      </Reveal>
    </Section>
  )
}
