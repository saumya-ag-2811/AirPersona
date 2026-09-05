import type {
  EnvironmentData,
  Persona,
  RiskAssessment,
  RiskFactor,
  RiskLevel,
} from '@/types'

/**
 * DETERMINISTIC RISK ENGINE.
 *
 * This is intentionally isolated so it can be swapped for the production
 * risk engine later. The AI layer never makes the risk decision — it only
 * explains the output of this function.
 *
 * The score is a 0–100 composite of independent contributions:
 *   environment (AQI + heat) + health sensitivity + exposure + age + activity + sensitivity
 *
 * Extended persona fields (healthConditions, exposureBlocks, activityLevel,
 * sensitivityScore) are used when present; falls back to legacy single-field
 * logic for backward compatibility with presets.
 */

const AGE_WEIGHT: Record<Persona['ageGroup'], number> = {
  'young-adult': 2,
  adult: 6,
  senior: 16,
}

const HEALTH_WEIGHT: Record<string, number> = {
  none: 0,
  asthma: 20,
  heart: 18,
  respiratory: 15,
  allergies: 8,
  diabetes: 10,
}

const SEVERITY_MULTIPLIER: Record<string, number> = {
  mild: 0.5,
  moderate: 1.0,
  severe: 1.5,
}

const EXPOSURE_WEIGHT: Record<Persona['lifestyle'], number> = {
  indoor: 2,
  sedentary: 4,
  student: 8,
  'active-outdoors': 16,
  'outdoor-worker': 20,
}

const ACTIVITY_WEIGHT: Record<string, number> = {
  sedentary: 0,
  light: 2,
  moderate: 5,
  vigorous: 10,
}

/** AQI → 0–44 base environmental load (non-linear, steeper past 150). */
function aqiLoad(aqi: number): number {
  if (aqi <= 50) return (aqi / 50) * 8
  if (aqi <= 100) return 8 + ((aqi - 50) / 50) * 10
  if (aqi <= 150) return 18 + ((aqi - 100) / 50) * 10
  if (aqi <= 200) return 28 + ((aqi - 150) / 50) * 10
  if (aqi <= 300) return 38 + ((aqi - 200) / 100) * 6
  return 44
}

/** Heat adds a small additional load above 32°C. */
function heatLoad(tempC: number): number {
  if (tempC <= 32) return 0
  return Math.min((tempC - 32) * 1.5, 10)
}

function scoreToLevel(score: number): RiskLevel {
  if (score >= 82) return 'SEVERE'
  if (score >= 66) return 'HIGH'
  if (score >= 48) return 'ELEVATED'
  if (score >= 28) return 'MODERATE'
  return 'LOW'
}

const HEALTH_LABEL: Record<string, string> = {
  none: 'No known condition',
  asthma: 'Asthma',
  heart: 'Heart condition',
  respiratory: 'Respiratory sensitivity',
  allergies: 'Allergies',
  diabetes: 'Diabetes',
}

const EXPOSURE_LABEL: Record<Persona['lifestyle'], string> = {
  indoor: 'Indoor lifestyle',
  sedentary: 'Mostly sedentary',
  student: 'Student routine',
  'active-outdoors': 'Active outdoors',
  'outdoor-worker': 'Outdoor exposure',
}

export function assessRisk(
  env: EnvironmentData,
  persona: Persona,
): RiskAssessment {
  const envLoad = aqiLoad(env.aqi) + heatLoad(env.temperatureC)
  const age = AGE_WEIGHT[persona.ageGroup]

  // ── Health weight: use extended healthConditions if available ────────
  let health = 0
  if (persona.healthConditions && persona.healthConditions.length > 0) {
    health = persona.healthConditions.reduce((sum, entry) => {
      const base = HEALTH_WEIGHT[entry.condition] ?? 0
      const mult = SEVERITY_MULTIPLIER[entry.severity] ?? 1
      return sum + base * mult
    }, 0)
    // Cap at 30 to prevent extreme stacking
    health = Math.min(health, 30)
  } else {
    // Legacy fallback
    health = HEALTH_WEIGHT[persona.healthProfile] ?? 0
  }

  // ── Exposure weight: use extended exposureBlocks if available ────────
  let exposure = EXPOSURE_WEIGHT[persona.lifestyle]
  if (persona.exposureBlocks && persona.exposureBlocks.length > 0) {
    const outdoorCount = persona.exposureBlocks.filter(b => b.outdoors).length
    // Scale: 0 outdoor blocks = 2, 1 = 6, 2 = 12, 3 = 16, 4 = 20
    exposure = Math.min(2 + outdoorCount * 5, 20)
  }

  // ── Activity level contribution ─────────────────────────────────────
  const activity = ACTIVITY_WEIGHT[persona.activityLevel ?? 'moderate'] ?? 5

  // ── Sensitivity slider contribution (1-5 → 0-8) ────────────────────
  const sensitivity = ((persona.sensitivityScore ?? 3) - 1) * 2

  const raw = envLoad + health + exposure + age + activity + sensitivity
  const score = Math.max(0, Math.min(100, Math.round(raw)))
  const level = scoreToLevel(score)

  const factors: RiskFactor[] = []

  factors.push({
    label: env.aqi >= 150 ? 'Elevated AQI' : env.aqi >= 100 ? 'Moderate AQI' : 'AQI',
    weight: clamp01(envLoad / 54),
    detail: `${env.aqi} · ${env.dominantPollutant}`,
  })

  if (health > 0) {
    const conditionLabels = persona.healthConditions
      ?.filter(c => c.condition !== 'none')
      .map(c => HEALTH_LABEL[c.condition] || c.condition)
    const label = conditionLabels && conditionLabels.length > 0
      ? conditionLabels.join(', ')
      : `${HEALTH_LABEL[persona.healthProfile] || 'Health'} profile`
    factors.push({
      label,
      weight: clamp01(health / 30),
      detail: 'Health sensitivity',
    })
  }

  if (exposure >= 8) {
    factors.push({
      label: EXPOSURE_LABEL[persona.lifestyle],
      weight: clamp01(exposure / 20),
      detail: exposure >= 16 ? 'High exposure' : 'Moderate exposure',
    })
  }

  if (activity >= 5) {
    factors.push({
      label: 'Activity level',
      weight: clamp01(activity / 10),
      detail: persona.activityLevel ?? 'moderate',
    })
  }

  if (age >= 16) {
    factors.push({
      label: 'Age sensitivity',
      weight: clamp01(age / 20),
      detail: 'Older adult',
    })
  }

  if (sensitivity >= 4) {
    factors.push({
      label: 'Personal sensitivity',
      weight: clamp01(sensitivity / 8),
      detail: `${persona.sensitivityScore ?? 3}/5`,
    })
  }

  if (heatLoad(env.temperatureC) > 0) {
    factors.push({
      label: 'Heat stress',
      weight: clamp01(heatLoad(env.temperatureC) / 10),
      detail: `${env.temperatureC}°C`,
    })
  }

  factors.sort((a, b) => b.weight - a.weight)

  return {
    level,
    score,
    factors,
    summary: buildSummary(level, persona),
  }
}

function buildSummary(level: RiskLevel, persona: Persona): string {
  const hasCondition = persona.healthConditions?.some(c => c.condition !== 'none')
  const base =
    hasCondition || persona.healthProfile !== 'none'
      ? 'your health sensitivity'
      : persona.lifestyle === 'outdoor-worker' ||
          persona.lifestyle === 'active-outdoors'
        ? 'your outdoor exposure'
        : 'your profile'
  switch (level) {
    case 'SEVERE':
      return `Conditions are severe relative to ${base}.`
    case 'HIGH':
      return `Conditions pose a higher concern given ${base}.`
    case 'ELEVATED':
      return `Conditions are elevated for ${base}.`
    case 'MODERATE':
      return `Conditions are manageable for ${base}.`
    default:
      return `Conditions are low-concern for ${base}.`
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}
