import type { Advisory, EnvironmentData, Persona, RiskAssessment, HistoricalDay, HistoryInsight, DataSource } from '@/types'
import { FALLBACK_ASK_MESSAGE } from '@/data/mockAdvisories'

/**
 * Advisory service.
 *
 * Contains both local fallback generators and async API-backed AI fetchers.
 * The AI explains — it never computes the risk level itself.
 */

const DISCLAIMER = 'Not medical advice. For guidance only.'

const HEALTH_PHRASE: Record<string, string> = {
  none: 'a baseline sensitivity to air conditions',
  asthma: 'increased airway sensitivity to poor air conditions',
  heart: 'cardiovascular sensitivity to poor air conditions',
  respiratory: 'reduced tolerance for poor air conditions',
  allergies: 'environmental allergy triggers',
  diabetes: 'metabolic sensitivity to environmental stress',
}

const EXPOSURE_PHRASE: Record<string, string> = {
  indoor: 'primarily indoor exposure',
  sedentary: 'mostly sedentary, low-exertion exposure',
  student: 'mixed indoor and outdoor exposure',
  'active-outdoors': 'active outdoor exposure',
  'outdoor-worker': 'prolonged outdoor exposure',
}

/**
 * Synchronous local fallback advisory generator.
 * Used for instant rendering before the API responds.
 */
export function generateAdvisory(
  env: EnvironmentData,
  persona: Persona,
  assessment: RiskAssessment,
): Advisory {
  const leadCondition = persona.healthConditions?.find(c => c.condition !== 'none')
  const health = HEALTH_PHRASE[leadCondition?.condition || persona.healthProfile] || HEALTH_PHRASE.none
  const exposure = EXPOSURE_PHRASE[persona.lifestyle] || EXPOSURE_PHRASE.indoor

  const outdoorCount = persona.exposureBlocks?.filter(b => b.outdoors).length ?? 0

  const airPhrase =
    env.aqi >= 150
      ? 'Current air quality is elevated'
      : env.aqi >= 100
        ? 'Current air quality is moderately degraded'
        : 'Current air quality is fair'

  const comparison =
    assessment.level === 'MODERATE' || assessment.level === 'LOW'
      ? 'lower than it would be for someone with higher outdoor exposure'
      : 'higher than it would be for a healthy adult with primarily indoor exposure'

  const body = `${airPhrase}, and your profile indicates ${health}. Combined with ${exposure}, your environmental risk is ${comparison}.`

  const reasoning = `Your risk score of ${assessment.score}/100 reflects AQI ${env.aqi} (${env.dominantPollutant}), ${health}, and ${outdoorCount} outdoor time blocks. ${
    persona.sensitivityScore >= 4 ? 'Your elevated sensitivity rating amplifies these factors.' : ''
  } ${assessment.summary}`

  const reasons = assessment.factors
    .slice(0, 3)
    .map((f) => f.label)

  return {
    headline: 'What this means for you',
    body,
    reasoning,
    reasons,
    suggestions: buildSuggestions(env, persona, assessment),
    disclaimer: DISCLAIMER,
    source: 'fallback' as DataSource,
  }
}

function buildSuggestions(
  env: EnvironmentData,
  persona: Persona,
  assessment: RiskAssessment,
): string[] {
  const s: string[] = []
  const high = assessment.level === 'HIGH' || assessment.level === 'SEVERE'
  const outdoors =
    persona.lifestyle === 'outdoor-worker' ||
    persona.lifestyle === 'active-outdoors'

  if (high && outdoors) {
    s.push('Limit strenuous outdoor activity during peak hours.')
    s.push('Consider a well-fitted mask rated for fine particulates.')
  } else if (high) {
    s.push('Keep windows closed and favor filtered indoor air.')
  } else {
    s.push('Normal outdoor activity is reasonable — stay aware of changes.')
  }

  const hasCondition = persona.healthConditions?.some(c => c.condition !== 'none')
  if (hasCondition || persona.healthProfile !== 'none') {
    s.push('Keep any prescribed relief medication accessible.')
  }
  if (env.temperatureC >= 34) {
    s.push('Stay hydrated — heat compounds air-quality strain.')
  }
  return s.slice(0, 3)
}

// ─── Async AI-powered fetchers ──────────────────────────────────────────────

/** Fetch AI-powered advisory from the API route. */
export async function fetchAdvisory(
  environment: EnvironmentData,
  persona: Persona,
  assessment: RiskAssessment,
): Promise<Advisory> {
  try {
    const res = await fetch('/api/advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ environment, persona, assessment }),
    })
    if (!res.ok) throw new Error('Failed')
    return await res.json()
  } catch {
    return generateAdvisory(environment, persona, assessment)
  }
}

/** Fetch AI-powered weekly insight from the API route. */
export async function fetchHistoryInsight(
  history: HistoricalDay[],
  persona: Persona,
): Promise<HistoryInsight> {
  try {
    const res = await fetch('/api/history-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, persona }),
    })
    if (!res.ok) throw new Error('Failed')
    return await res.json()
  } catch {
    return {
      paragraph: 'Unable to generate weekly insight at this time.',
      source: 'fallback' as DataSource,
    }
  }
}

/** Send a question to Ask AirPersona. */
export async function askAirPersona(
  question: string,
  environment: EnvironmentData,
  persona: Persona,
): Promise<{ message: string; source: string }> {
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, environment, persona }),
    })
    if (!res.ok) throw new Error('Failed')
    return await res.json()
  } catch {
    return { message: FALLBACK_ASK_MESSAGE, source: 'mock' }
  }
}
