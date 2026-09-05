'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Brain, Loader2 } from 'lucide-react'
import { Section, SectionLabel } from '@/components/section-kit'
import { Reveal } from '@/components/motion-primitives'
import { RiskLevelWord, RiskMeter, FactorBars } from '@/components/risk-display'
import { useAirPersona } from '@/components/air-persona-provider'
import { riskVisual } from '@/lib/airTheme'

export function RiskSection() {
  const { environment, persona, assessment, advisory, isAdvisoryLoading } = useAirPersona()
  const v = riskVisual(assessment.level)

  const outdoorCount = persona.exposureBlocks?.filter((b) => b.outdoors).length ?? 0

  const keyFacts = [
    { label: 'AQI', value: String(environment.aqi) },
    { label: 'Temperature', value: `${environment.temperatureC}°C` },
    { label: 'Outdoor blocks', value: `${outdoorCount} / 4` },
    { label: 'Sensitivity', value: `${persona.sensitivityScore ?? 3} / 5` },
  ]

  return (
    <Section id="risk" className="relative">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: `radial-gradient(80% 50% at 20% 30%, ${v.soft}, transparent 70%)` }}
        aria-hidden="true"
      />
      <Reveal>
        <SectionLabel index="06">Your risk</SectionLabel>
      </Reveal>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Your current risk
          </p>
          <div className="mt-3 h-[clamp(4rem,14vw,9rem)]">
            <AnimatePresence mode="wait">
              <RiskLevelWord
                key={assessment.level}
                level={assessment.level}
                className="text-[clamp(4rem,14vw,9rem)]"
              />
            </AnimatePresence>
          </div>
          <p className="mt-4 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            {assessment.summary} These conditions may pose a{' '}
            {v.label.toLowerCase()} level of concern given your profile and exposure.
          </p>
          <div className="mt-10 max-w-md">
            <RiskMeter assessment={assessment} />
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-hairline">
            {keyFacts.map((f) => (
              <div key={f.label} className="bg-background p-6">
                <p className="font-display text-2xl font-semibold leading-none">{f.value}</p>
                <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                  {f.label}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Why it changed
            </p>
            <FactorBars factors={assessment.factors} color={v.color} />
          </div>
        </div>
      </div>

      {/* ── AI Risk Reasoning Narrative ──────────────────────────────────────── */}
      <Reveal delay={0.12} className="mt-14">
        <div
          className="relative overflow-hidden rounded-2xl border p-6 sm:p-8"
          style={{ borderColor: `${v.color}33`, background: v.soft }}
        >
          {/* glow blob */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
            style={{ background: v.soft }}
            aria-hidden="true"
          />

          <div className="relative flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
              AirPersona reasoning
            </span>
            {isAdvisoryLoading && (
              <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="relative mt-4 min-h-[3.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={advisory.reasoning}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45 }}
                className="text-pretty text-base leading-relaxed text-foreground/85"
              >
                {advisory.reasoning}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
