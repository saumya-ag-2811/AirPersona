'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { ArrowDown, MapPin } from 'lucide-react'
import { AtmosphereBackground } from '@/components/atmosphere-background'
import { StaggerLines } from '@/components/motion-primitives'
import { useAirPersona } from '@/components/air-persona-provider'
import { aqiColor, aqiCategory } from '@/lib/airTheme'

export function HeroSection() {
  const { environment } = useAirPersona()
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  const intensity = Math.min(environment.aqi / 260, 0.9)
  const color = aqiColor(environment.aqi)

  return (
    <section
      ref={ref}
      id="top"
      className="grain relative flex min-h-screen flex-col justify-center overflow-hidden"
    >
      <motion.div style={reduce ? undefined : { scale: bgScale }} className="absolute inset-0">
        <AtmosphereBackground intensity={intensity} color={color} />
      </motion.div>

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 20%, transparent 40%, var(--background) 100%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          <span className="flex h-2 w-2">
            <span
              className="h-2 w-2 animate-ping rounded-full"
              style={{ background: color }}
            />
          </span>
          Environmental intelligence, personalized to you
        </motion.div>

        <StaggerLines
          as="h1"
          lines={['THE AIR', 'AROUND YOU', 'IS ALIVE.']}
          className="font-display display-tight text-[clamp(3rem,13vw,11rem)] font-semibold"
        />

        {/* Environmental snapshot — padded bottom so scroll indicator doesn't overlap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-12 flex flex-wrap items-end gap-x-10 gap-y-6 border-t border-hairline pt-8 pb-24"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="font-display text-xl font-semibold uppercase tracking-wide">
              {environment.location}
            </span>
          </div>
          <Snapshot value={`${environment.temperatureC}°`} label="Temperature" />
          <Snapshot
            value={String(environment.aqi)}
            label={`AQI · ${aqiCategory(environment.aqi)}`}
            color={color}
          />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {environment.dominantPollutant} dominant
          </span>
        </motion.div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
          Scroll to discover
        </span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ArrowDown className="h-4 w-4 text-accent" />
        </motion.span>
      </motion.div>
    </section>
  )
}

function Snapshot({
  value,
  label,
  color,
}: {
  value: string
  label: string
  color?: string
}) {
  return (
    <div className="flex flex-col">
      <span
        className="font-display text-3xl font-semibold leading-none sm:text-4xl"
        style={color ? { color } : undefined}
      >
        {value}
      </span>
      <span className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
