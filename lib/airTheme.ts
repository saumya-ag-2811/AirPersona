import type { RiskLevel } from '@/types'

/**
 * Central mapping from semantic states -> visual tokens.
 * Colors are OKLCH strings so they can be dropped straight into inline styles
 * and CSS custom properties.
 */

export interface RiskVisual {
  /** Human label */
  label: string
  /** Primary color for the level */
  color: string
  /** Softer variant for fills/glows */
  soft: string
  /** 0–1 intensity used to drive atmosphere density */
  intensity: number
}

export const RISK_VISUALS: Record<RiskLevel, RiskVisual> = {
  LOW: {
    label: 'Low',
    color: 'oklch(0.8 0.12 178)',
    soft: 'oklch(0.8 0.12 178 / 0.16)',
    intensity: 0.15,
  },
  MODERATE: {
    label: 'Moderate',
    color: 'oklch(0.82 0.14 82)',
    soft: 'oklch(0.82 0.14 82 / 0.16)',
    intensity: 0.38,
  },
  ELEVATED: {
    label: 'Elevated',
    color: 'oklch(0.73 0.17 48)',
    soft: 'oklch(0.73 0.17 48 / 0.18)',
    intensity: 0.62,
  },
  HIGH: {
    label: 'High',
    color: 'oklch(0.64 0.2 26)',
    soft: 'oklch(0.64 0.2 26 / 0.2)',
    intensity: 0.82,
  },
  SEVERE: {
    label: 'Severe',
    color: 'oklch(0.58 0.21 18)',
    soft: 'oklch(0.58 0.21 18 / 0.22)',
    intensity: 1,
  },
}

export function riskVisual(level: RiskLevel): RiskVisual {
  return RISK_VISUALS[level]
}

/** AQI category color (independent of persona) for the gauge scale. */
export function aqiColor(aqi: number): string {
  if (aqi <= 50) return 'oklch(0.8 0.12 178)'
  if (aqi <= 100) return 'oklch(0.84 0.13 110)'
  if (aqi <= 150) return 'oklch(0.82 0.14 82)'
  if (aqi <= 200) return 'oklch(0.73 0.17 48)'
  if (aqi <= 300) return 'oklch(0.64 0.2 26)'
  return 'oklch(0.58 0.21 18)'
}

export function aqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for sensitive groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very unhealthy'
  return 'Hazardous'
}
