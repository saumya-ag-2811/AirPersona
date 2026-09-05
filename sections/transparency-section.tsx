'use client'

import { Section, SectionLabel } from '@/components/section-kit'
import { Reveal } from '@/components/motion-primitives'
import { ProcessVisualization } from '@/components/process-visualization'

const PIPELINE = [
  { title: 'Live environment', detail: 'Location-based conditions are read from the environmental layer.' },
  { title: 'Weather + AQI', detail: 'Air quality and weather are normalized into a single snapshot.' },
  { title: 'User persona', detail: 'Age, health profile and lifestyle define individual context.' },
  { title: 'Risk engine', detail: 'Deterministic logic — not the AI — computes the risk score and level.' },
  { title: 'AI explanation', detail: 'A language model translates the result into readable, personal guidance.' },
  { title: 'Personalized guidance', detail: 'The final advisory is delivered in plain, non-medical language.' },
]

export function TransparencySection() {
  return (
    <Section id="transparency">
      <Reveal>
        <SectionLabel index="10">Transparency</SectionLabel>
      </Reveal>

      <div className="mt-6 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal delay={0.05}>
            <h2 className="max-w-md text-balance font-display display-tight text-[clamp(2.25rem,6vw,4.5rem)] font-semibold">
              How AirPersona thinks.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
              Environmental conditions are evaluated together with user context{' '}
              <span className="text-foreground">before</span> the AI generates
              the final explanation.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 rounded-xl border border-hairline bg-surface/40 p-5">
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                <span className="text-foreground">Important:</span> the AI does
                not make medical decisions. Deterministic risk logic runs first;
                the AI is used primarily for explanation and personalized
                language.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ProcessVisualization steps={PIPELINE} />
        </Reveal>
      </div>
    </Section>
  )
}
