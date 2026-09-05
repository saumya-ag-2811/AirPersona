'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ArrowUp, Wind } from 'lucide-react'
import { AtmosphereBackground } from '@/components/atmosphere-background'
import { StaggerLines } from '@/components/motion-primitives'
import { useAirPersona } from '@/components/air-persona-provider'
import { aqiColor } from '@/lib/airTheme'

export function FinalSection() {
  const { environment } = useAirPersona()
  const reduce = useReducedMotion()
  const color = aqiColor(environment.aqi)

  const scrollTo = (href: string) => () => {
    document
      .querySelector(href)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <section className="grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center">
      <AtmosphereBackground intensity={Math.min(environment.aqi / 260, 0.9)} color={color} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(100% 70% at 50% 50%, transparent 30%, var(--background) 90%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <StaggerLines
          as="h2"
          lines={['THE AIR IS THE SAME.', "YOUR RISK ISN'T."]}
          className="font-display display-tight text-[clamp(2.5rem,10vw,8rem)] font-semibold"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-2.5">
            <Wind className="h-5 w-5 text-accent" />
            <span className="font-display text-lg font-semibold uppercase tracking-[0.35em]">
              AirPersona
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Environmental intelligence, personalized to you.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollTo('#persona')}
              className="rounded-full bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-background transition-transform hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Check your AirPersona
            </button>
            <button
              type="button"
              onClick={scrollTo('#top')}
              className="group inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
              Explore again
            </button>
          </div>
        </motion.div>
      </div>

      <footer className="absolute bottom-6 z-10 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
        Prototype · mock data · not medical advice
      </footer>
    </section>
  )
}
