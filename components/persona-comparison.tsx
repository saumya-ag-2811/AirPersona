'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { User, Users, Info } from 'lucide-react'
import { PERSONA_PRESETS } from '@/data/mockPersonas'
import { assessRisk } from '@/services/riskService'
import { riskVisual } from '@/lib/airTheme'
import { AnimatedNumber } from '@/components/motion-primitives'
import { useAirPersona } from '@/components/air-persona-provider'
import { cn } from '@/lib/utils'
import type { PersonaPreset } from '@/types'

export function PersonaComparison() {
  const { environment, savedProfiles } = useAirPersona()

  // Build the list: use saved profiles if ≥2 exist, else fall back to presets
  const displayProfiles = useMemo<PersonaPreset[]>(() => {
    if (savedProfiles.length >= 2) {
      // Show up to 4 most recent saved profiles
      return savedProfiles.slice(-4).map((sp) => ({
        id: sp.id,
        label: sp.name,
        description: `Saved on ${new Date(sp.createdAt).toLocaleDateString()}`,
        persona: sp.persona,
      }))
    }
    return PERSONA_PRESETS
  }, [savedProfiles])

  const [activeId, setActiveId] = useState<string>(() => displayProfiles[1]?.id ?? displayProfiles[0]?.id)

  // Keep activeId valid when displayProfiles changes
  const validActiveId = displayProfiles.find((p) => p.id === activeId)
    ? activeId
    : displayProfiles[0]?.id

  const rows = useMemo(
    () =>
      displayProfiles.map((p) => ({
        preset: p,
        assessment: assessRisk(environment, p.persona),
      })),
    [displayProfiles, environment],
  )

  const maxScore = Math.max(...rows.map((r) => r.assessment.score))
  const isUsingCustom = savedProfiles.length >= 2

  return (
    <div>
      {/* Source indicator */}
      <AnimatePresence>
        {isUsingCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/8 px-4 py-3">
              <User className="h-4 w-4 text-accent" />
              <p className="text-sm text-foreground/80">
                Showing your{' '}
                <span className="font-medium text-accent">{savedProfiles.length} saved profiles</span>.
                Save more in the AirPersona configurator above.
              </p>
            </div>
          </motion.div>
        )}
        {!isUsingCustom && savedProfiles.length === 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/20 px-4 py-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Save{' '}
                <span className="text-foreground">one more AirPersona profile</span> above to compare
                your custom profiles here. Showing default presets for now.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(({ preset, assessment }, i) => {
          const v = riskVisual(assessment.level)
          const active = validActiveId === preset.id
          return (
            <motion.button
              key={preset.id}
              type="button"
              onClick={() => setActiveId(preset.id)}
              aria-pressed={active}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border p-6 text-left transition-all duration-500 outline-none',
                'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active ? 'border-transparent' : 'border-border hover:border-hairline',
              )}
              style={{
                background: active ? v.soft : 'oklch(0.21 0.014 250 / 0.4)',
                boxShadow: active ? `inset 0 0 0 1px ${v.color}` : undefined,
              }}
            >
              {/* Custom profile badge */}
              {isUsingCustom && (
                <div className="mb-2 flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
                    Saved
                  </span>
                </div>
              )}

              <p className="font-display text-lg font-semibold leading-tight">{preset.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>

              <div className="mt-8 flex items-end justify-between">
                <span
                  className="font-display text-2xl font-semibold uppercase leading-none tracking-tight"
                  style={{ color: v.color }}
                >
                  {v.label}
                </span>
                <span
                  className="font-display text-3xl font-semibold"
                  style={{ color: v.color }}
                >
                  <AnimatedNumber value={assessment.score} />
                </span>
              </div>

              {/* severity bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: v.color, transformOrigin: 'left', width: '100%' }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: assessment.score / 100 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {assessment.score === maxScore && (
                <span className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Highest risk in this environment
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
