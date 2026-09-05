'use client'

import { Section, SectionLabel } from '@/components/section-kit'
import { Reveal } from '@/components/motion-primitives'
import { PersonaSelector } from '@/components/persona-selector'

export function PersonaSection() {
  return (
    <Section id="persona">
      <Reveal>
        <SectionLabel index="04">Build your AirPersona</SectionLabel>
      </Reveal>
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Reveal delay={0.05}>
          <h2 className="max-w-3xl text-balance font-display display-tight text-[clamp(2.25rem,6vw,4.5rem)] font-semibold">
            Who are you?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            This isn&apos;t a form — it&apos;s an environmental profile. Your
            selections flow through the rest of the experience and reshape every
            risk reading below.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mt-14">
        <PersonaSelector />
      </Reveal>
    </Section>
  )
}
