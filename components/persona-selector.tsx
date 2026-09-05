'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronDown, Save, Trash2, User } from 'lucide-react'
import { useAirPersona } from '@/components/air-persona-provider'
import {
  AGE_OPTIONS,
  HEALTH_CONDITION_OPTIONS,
  SEVERITY_OPTIONS,
  EXPOSURE_BLOCK_OPTIONS,
  ACTIVITY_LEVEL_OPTIONS,
  SENSITIVITY_LABELS,
} from '@/data/mockPersonas'
import { riskVisual } from '@/lib/airTheme'
import { cn } from '@/lib/utils'
import type { HealthConditionKey, ConditionSeverity, ExposureTimeBlock } from '@/types'

// ─── Small chip button ────────────────────────────────────────────────────────
function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'border-accent/60 bg-accent/10 text-foreground'
          : 'border-border bg-surface/30 text-foreground/60 hover:border-hairline hover:bg-surface/60 hover:text-foreground/80',
      )}
      style={active && color ? { borderColor: `${color}55`, background: `${color}18`, color } : undefined}
    >
      {active && (
        <motion.span
          layoutId={undefined}
          className="h-1.5 w-1.5 rounded-full bg-current"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        />
      )}
      {children}
    </button>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function ConfigLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
      <span className="text-accent">{index}</span>
      {children}
    </p>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PersonaSelector() {
  const { persona, updatePersona, assessment, savedProfiles, saveProfile, deleteProfile } =
    useAirPersona()
  const v = riskVisual(assessment.level)

  const [saveInputVisible, setSaveInputVisible] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [profilesOpen, setProfilesOpen] = useState(false)

  // ── Age group ────────────────────────────────────────────────────────────
  const handleAge = (val: string) => updatePersona({ ageGroup: val as never })

  // ── Health conditions ─────────────────────────────────────────────────────
  const toggleCondition = (key: HealthConditionKey) => {
    const current = persona.healthConditions ?? []
    if (key === 'none') {
      updatePersona({
        healthConditions: [{ condition: 'none', severity: 'mild' }],
        healthProfile: 'none',
      })
      return
    }
    const exists = current.find((c) => c.condition === key)
    if (exists) {
      const next = current.filter((c) => c.condition !== key)
      updatePersona({
        healthConditions: next.length ? next : [{ condition: 'none', severity: 'mild' }],
        healthProfile: next[0]?.condition === 'none' ? 'none' : (next[0]?.condition as never) ?? 'none',
      })
    } else {
      const next = current
        .filter((c) => c.condition !== 'none')
        .concat([{ condition: key, severity: 'moderate' }])
      updatePersona({
        healthConditions: next,
        healthProfile: next[0]?.condition as never,
      })
    }
  }

  const setSeverity = (key: HealthConditionKey, sev: ConditionSeverity) => {
    const current = persona.healthConditions ?? []
    updatePersona({
      healthConditions: current.map((c) =>
        c.condition === key ? { ...c, severity: sev } : c,
      ),
    })
  }

  const activeConditions = (persona.healthConditions ?? []).filter(
    (c) => c.condition !== 'none',
  )

  // ── Exposure blocks ───────────────────────────────────────────────────────
  const toggleBlock = (block: ExposureTimeBlock) => {
    const current = persona.exposureBlocks ?? []
    updatePersona({
      exposureBlocks: current.map((b) =>
        b.block === block ? { ...b, outdoors: !b.outdoors } : b,
      ),
    })
  }

  // ── Activity level ────────────────────────────────────────────────────────
  const handleActivity = (val: string) => updatePersona({ activityLevel: val as never })

  // ── Sensitivity slider ────────────────────────────────────────────────────
  const handleSensitivity = (val: number) => updatePersona({ sensitivityScore: val })

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!saveName.trim()) return
    saveProfile(saveName)
    setSaveName('')
    setSaveInputVisible(false)
  }

  // ── Load profile ──────────────────────────────────────────────────────────
  const loadProfile = (id: string) => {
    const profile = savedProfiles.find((p) => p.id === id)
    if (profile) {
      updatePersona(profile.persona)
      setProfilesOpen(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* ── 01 Age Group ─────────────────────────────────────────────────────── */}
      <div>
        <ConfigLabel index="01">Age group</ConfigLabel>
        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={persona.ageGroup === opt.value}
              onClick={() => handleAge(opt.value)}
            >
              {opt.label}
              <span className="text-[0.65rem] text-muted-foreground">({opt.hint})</span>
            </Chip>
          ))}
        </div>
      </div>

      {/* ── 02 Health conditions ─────────────────────────────────────────────── */}
      <div>
        <ConfigLabel index="02">Health conditions</ConfigLabel>
        <div className="flex flex-wrap gap-2">
          {HEALTH_CONDITION_OPTIONS.map((opt) => {
            const isActive =
              opt.value === 'none'
                ? activeConditions.length === 0
                : activeConditions.some((c) => c.condition === opt.value)
            return (
              <Chip key={opt.value} active={isActive} onClick={() => toggleCondition(opt.value as HealthConditionKey)}>
                <span>{opt.icon}</span>
                {opt.label}
              </Chip>
            )
          })}
        </div>

        {/* Severity selectors for each active condition */}
        <AnimatePresence>
          {activeConditions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="space-y-3 rounded-xl border border-border bg-surface/20 p-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Severity
                </p>
                {activeConditions.map((c) => {
                  const opt = HEALTH_CONDITION_OPTIONS.find((o) => o.value === c.condition)
                  return (
                    <div key={c.condition} className="flex items-center gap-4">
                      <span className="w-28 text-sm text-foreground/80">
                        {opt?.icon} {opt?.label}
                      </span>
                      <div className="flex gap-1.5">
                        {SEVERITY_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setSeverity(c.condition, s.value as ConditionSeverity)}
                            className={cn(
                              'rounded-lg border px-3 py-1 text-xs font-medium transition-all',
                              c.severity === s.value
                                ? 'border-accent/60 bg-accent/15 text-accent'
                                : 'border-border bg-transparent text-muted-foreground hover:border-hairline',
                            )}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 03 Daily exposure time-blocks ────────────────────────────────────── */}
      <div>
        <ConfigLabel index="03">Outdoor exposure</ConfigLabel>
        <p className="mb-3 text-xs text-muted-foreground">
          Toggle the time-blocks when you are outdoors.
        </p>
        <div className="flex flex-wrap gap-2">
          {EXPOSURE_BLOCK_OPTIONS.map((opt) => {
            const block = persona.exposureBlocks?.find((b) => b.block === opt.value)
            const isOutdoors = block?.outdoors ?? false
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleBlock(opt.value as ExposureTimeBlock)}
                aria-pressed={isOutdoors}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-4 py-3 text-center transition-all duration-200 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isOutdoors
                    ? 'border-accent/50 bg-accent/10 text-foreground'
                    : 'border-border bg-surface/20 text-foreground/50 hover:border-hairline',
                )}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-[0.6rem] text-muted-foreground">{opt.hint}</span>
                <span
                  className={cn(
                    'mt-1 rounded-full px-2 py-0.5 text-[0.6rem] font-mono uppercase tracking-wider transition-colors',
                    isOutdoors ? 'bg-accent/20 text-accent' : 'bg-muted/40 text-muted-foreground',
                  )}
                >
                  {isOutdoors ? 'Outdoors' : 'Indoors'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 04 Activity level ─────────────────────────────────────────────────── */}
      <div>
        <ConfigLabel index="04">Activity level</ConfigLabel>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_LEVEL_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={persona.activityLevel === opt.value}
              onClick={() => handleActivity(opt.value)}
            >
              {opt.label}
              <span className="hidden text-[0.65rem] text-muted-foreground sm:inline">
                — {opt.hint}
              </span>
            </Chip>
          ))}
        </div>
      </div>

      {/* ── 05 Sensitivity slider ─────────────────────────────────────────────── */}
      <div>
        <ConfigLabel index="05">Environmental sensitivity</ConfigLabel>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <input
              id="sensitivity-slider"
              type="range"
              min={1}
              max={5}
              step={1}
              value={persona.sensitivityScore ?? 3}
              onChange={(e) => handleSensitivity(Number(e.target.value))}
              className="h-1.5 w-full max-w-xs cursor-pointer appearance-none rounded-full bg-muted accent-accent"
              aria-label="Environmental sensitivity rating"
            />
            <span className="w-20 shrink-0 font-mono text-sm font-medium text-accent">
              {SENSITIVITY_LABELS[(persona.sensitivityScore ?? 3) - 1]}
            </span>
          </div>
          <div className="flex max-w-xs justify-between">
            {SENSITIVITY_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSensitivity(i + 1)}
                className={cn(
                  'font-mono text-[0.6rem] uppercase tracking-wider transition-colors',
                  persona.sensitivityScore === i + 1
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground/60',
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Save / Load controls ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start gap-4 border-t border-hairline pt-6">
        {/* Save button */}
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="wait">
            {!saveInputVisible ? (
              <motion.button
                key="save-btn"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSaveInputVisible(true)}
                className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
              >
                <Save className="h-4 w-4" />
                Save AirPersona
              </motion.button>
            ) : (
              <motion.div
                key="save-input"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Profile name…"
                  autoFocus
                  className="rounded-xl border border-border bg-surface/30 px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-xl border border-accent/40 bg-accent/10 p-2 text-accent transition-colors hover:bg-accent/20"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSaveInputVisible(false)}
                  className="rounded-xl border border-border bg-surface/20 p-2 text-muted-foreground transition-colors hover:bg-surface/40"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Saved profiles dropdown */}
        {savedProfiles.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfilesOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface/30 px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:border-hairline hover:bg-surface/50"
            >
              <User className="h-4 w-4" />
              Saved profiles
              <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[0.65rem] font-mono text-accent">
                {savedProfiles.length}
              </span>
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', profilesOpen && 'rotate-180')}
              />
            </button>
            <AnimatePresence>
              {profilesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full z-50 mt-2 min-w-[14rem] overflow-hidden rounded-xl border border-border bg-background/95 shadow-xl backdrop-blur-md"
                >
                  {savedProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between border-b border-hairline px-4 py-3 last:border-0 hover:bg-surface/40"
                    >
                      <button
                        type="button"
                        onClick={() => loadProfile(profile.id)}
                        className="flex-1 text-left text-sm font-medium text-foreground hover:text-accent"
                      >
                        {profile.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProfile(profile.id)}
                        aria-label={`Delete ${profile.name}`}
                        className="ml-3 rounded-md p-1 text-muted-foreground transition-colors hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Live preview card ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-6 transition-all duration-500"
        style={{ borderColor: v.color + '55', background: v.soft }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Your AirPersona
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg border border-border/50 bg-background/50 px-2.5 py-1 text-xs font-medium">
            {AGE_OPTIONS.find((o) => o.value === persona.ageGroup)?.label}
          </span>
          {activeConditions.length === 0 ? (
            <span className="rounded-lg border border-border/50 bg-background/50 px-2.5 py-1 text-xs font-medium">
              No known conditions
            </span>
          ) : (
            activeConditions.map((c) => (
              <span
                key={c.condition}
                className="rounded-lg border border-border/50 bg-background/50 px-2.5 py-1 text-xs font-medium"
              >
                {HEALTH_CONDITION_OPTIONS.find((o) => o.value === c.condition)?.label} ·{' '}
                {c.severity}
              </span>
            ))
          )}
          <span className="rounded-lg border border-border/50 bg-background/50 px-2.5 py-1 text-xs font-medium">
            {ACTIVITY_LEVEL_OPTIONS.find((o) => o.value === persona.activityLevel)?.label} activity
          </span>
          <span className="rounded-lg border border-border/50 bg-background/50 px-2.5 py-1 text-xs font-medium">
            Sensitivity {persona.sensitivityScore}/5
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Projected risk
          </span>
          <span className="font-display text-lg font-semibold" style={{ color: v.color }}>
            {v.label}
          </span>
        </div>
      </div>
    </div>
  )
}
