'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Section, SectionLabel } from '@/components/section-kit'
import { Reveal, AnimatedNumber } from '@/components/motion-primitives'
import { useAirPersona } from '@/components/air-persona-provider'
import { PERSONA_PRESETS } from '@/data/mockPersonas'
import { assessRisk } from '@/services/riskService'
import { riskVisual } from '@/lib/airTheme'
import { cn } from '@/lib/utils'

export function SameAirSection() {
  const { environment } = useAirPersona()
  const [idx, setIdx] = useState(1)

  const preset = PERSONA_PRESETS[idx]
  const assessment = useMemo(
    () => assessRisk(environment, preset.persona),
    [environment, preset],
  )
  const v = riskVisual(assessment.level)

  return (
    <Section id="same-air" className="relative">
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-colors duration-700"
        style={{
          background: `radial-gradient(90% 60% at 80% 40%, ${v.soft}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <Reveal>
        <SectionLabel index="02">The core idea</SectionLabel>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-6 max-w-4xl text-balance font-display display-tight text-[clamp(2.25rem,6vw,4.5rem)] font-semibold">
          Same air. Different people. Different risk.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* The environment — held constant */}
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface/40 p-8">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              The environment · unchanged
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              <Metric value={environment.aqi} label="AQI" />
              <Metric value={environment.temperatureC} label="°C" />
              <Metric value={environment.humidityPct} label="% RH" />
            </div>
            <p className="mt-8 border-t border-hairline pt-6 text-sm leading-relaxed text-muted-foreground">
              These readings never move in this demonstration. The only thing
              that changes is <span className="text-foreground">who is standing in it.</span>
            </p>
          </div>
        </Reveal>

        {/* The person — changes everything */}
        <div>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Select a person"
          >
            {PERSONA_PRESETS.map((p, i) => {
              const active = i === idx
              return (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setIdx(i)}
                  className={cn(
                    'relative rounded-full border px-4 py-2 text-sm font-medium transition-colors outline-none',
                    'focus-visible:ring-2 focus-visible:ring-accent',
                    active
                      ? 'border-transparent text-background'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="same-air-pill"
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{p.label}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-8 min-h-[22rem] rounded-2xl border border-border bg-surface/40 p-8">
            <p className="text-sm text-muted-foreground">{preset.description}</p>
            <div className="mt-6">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Perceived risk
              </p>
              <div className="relative mt-2 h-[clamp(3.5rem,10vw,7rem)] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={assessment.level}
                    initial={{ y: '100%', opacity: 0, filter: 'blur(10px)' }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: '-100%', opacity: 0, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display display-tight text-[clamp(3rem,9vw,6.5rem)] font-semibold"
                    style={{ color: v.color }}
                  >
                    {v.label.toUpperCase()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: v.color }}
                  animate={{ width: `${assessment.score}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="font-display text-2xl font-semibold" style={{ color: v.color }}>
                {assessment.score}
              </span>
            </div>

            <p className="mt-6 text-pretty text-sm leading-relaxed text-muted-foreground">
              {assessment.summary}
            </p>
          </div>

          <p className="mt-6 text-balance font-display text-lg font-medium text-muted-foreground">
            The environment did not change.{' '}
            <span className="text-foreground">The person did.</span>
          </p>
        </div>
      </div>
    </Section>
  )
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-3xl font-semibold leading-none sm:text-4xl">
        <AnimatedNumber value={value} />
      </span>
      <span className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
