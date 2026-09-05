'use client'

import { Section, SectionLabel } from '@/components/section-kit'
import { Reveal, AnimatedNumber } from '@/components/motion-primitives'
import { PersonaComparison } from '@/components/persona-comparison'
import { useAirPersona } from '@/components/air-persona-provider'

export function ComparisonSection() {
  const { environment } = useAirPersona()

  return (
    <Section id="compare" className="relative">
      <Reveal>
        <SectionLabel index="09">Compare</SectionLabel>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-6 max-w-4xl text-balance font-display display-tight text-[clamp(2.25rem,6vw,4.5rem)] font-semibold">
          One environment. Four experiences.
        </h2>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-hairline py-5">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Same environment
          </span>
          <span className="font-display text-xl font-semibold">
            <AnimatedNumber value={environment.aqi} /> AQI
          </span>
          <span className="font-display text-xl font-semibold">
            {environment.temperatureC}°C
          </span>
          <span className="font-display text-xl font-semibold">
            {environment.humidityPct}% humidity
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-10">
        <PersonaComparison />
      </Reveal>

      <Reveal delay={0.2}>
        <p className="mt-8 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Tap a card to focus it. The air is identical for all four — only the
          person changes, and with them, the risk.
        </p>
      </Reveal>
    </Section>
  )
}
