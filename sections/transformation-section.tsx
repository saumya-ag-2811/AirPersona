'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Plus, Equal } from 'lucide-react'
import { Section, SectionLabel } from '@/components/section-kit'
import { Reveal } from '@/components/motion-primitives'
import { ProcessVisualization } from '@/components/process-visualization'
import { useAirPersona } from '@/components/air-persona-provider'
import { HEALTH_OPTIONS, LIFESTYLE_OPTIONS, AGE_OPTIONS } from '@/data/mockPersonas'
import { riskVisual } from '@/lib/airTheme'

const STEPS = [
  { title: 'Environment', detail: 'Live AQI, temperature, humidity and wind are captured as a snapshot.' },
  { title: 'Exposure', detail: 'Your lifestyle determines how much of that environment actually reaches you.' },
  { title: 'Persona', detail: 'Age and health profile set how sensitive your body is to that exposure.' },
  { title: 'Risk', detail: 'A deterministic engine combines these into a single risk score and level.' },
  { title: 'Guidance', detail: 'An AI layer turns the result into clear, personalized language.' },
]

export function TransformationSection() {
  const { environment, persona, assessment } = useAirPersona()
  const v = riskVisual(assessment.level)

  const healthLabel = HEALTH_OPTIONS.find((o) => o.value === persona.healthProfile)!.label
  const ageLabel = AGE_OPTIONS.find((o) => o.value === persona.ageGroup)!.label
  const lifeLabel = LIFESTYLE_OPTIONS.find((o) => o.value === persona.lifestyle)!.label

  const terms = [
    { k: 'aqi', top: `AQI ${environment.aqi}`, bottom: 'Environment' },
    {
      k: persona.healthProfile,
      top: persona.healthProfile === 'none' ? ageLabel : healthLabel,
      bottom: persona.healthProfile === 'none' ? 'Age profile' : 'Sensitivity',
    },
    { k: persona.lifestyle, top: lifeLabel, bottom: 'Exposure' },
  ]

  return (
    <Section id="transformation">
      <Reveal>
        <SectionLabel index="05">How the air becomes personal</SectionLabel>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-6 max-w-3xl text-balance font-display display-tight text-[clamp(2.25rem,6vw,4.5rem)] font-semibold">
          The same reading, transformed into your reality.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal>
          <ProcessVisualization steps={STEPS} />
        </Reveal>

        {/* Live equation reacting to persona */}
        <Reveal delay={0.1} className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface/40 p-8">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              The equation · live
            </p>
            <div className="mt-8 flex flex-wrap items-stretch gap-3">
              {terms.map((t, i) => (
                <div key={t.bottom} className="flex items-center gap-3">
                  <Term k={t.k} top={t.top} bottom={t.bottom} />
                  {i < terms.length - 1 && (
                    <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4 border-t border-hairline pt-8">
              <Equal className="h-5 w-5 text-muted-foreground" />
              <div className="relative h-[clamp(2.5rem,7vw,4.5rem)] flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={assessment.level}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-center font-display display-tight text-[clamp(1.75rem,5vw,3rem)] font-semibold"
                    style={{ color: v.color }}
                  >
                    {v.label.toUpperCase()} RISK
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Change your persona above and this result recomputes instantly — no
              value here is hard-coded.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

function Term({ k, top, bottom }: { k: string; top: string; bottom: string }) {
  return (
    <div className="min-w-[7rem] rounded-xl border border-hairline bg-background px-4 py-3">
      <div className="relative min-h-[1.5rem]">
        <AnimatePresence mode="wait">
          <motion.span
            key={k + top}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="block font-display text-sm font-semibold leading-snug"
          >
            {top}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 block font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">
        {bottom}
      </span>
    </div>
  )
}
