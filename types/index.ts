/**
 * AirPersona domain types.
 *
 * These interfaces define the contract between the UI and the data layer.
 * The current implementation is backed by mock data (see /data and /services),
 * but a future backend can return these exact same shapes with no UI changes.
 */

// ─── Data source tracking ────────────────────────────────────────────────────
export type DataSource = 'live' | 'mock' | 'fallback'
export type AqiSource = 'waqi' | 'open-meteo-aq' | 'mock'

// ─── Environment ─────────────────────────────────────────────────────────────
export type WeatherCondition =
  | 'clear'
  | 'haze'
  | 'smoke'
  | 'cloudy'
  | 'rain'

export interface EnvironmentData {
  location: string
  country: string
  aqi: number
  /** Dominant pollutant, e.g. "PM2.5" */
  dominantPollutant: string
  temperatureC: number
  humidityPct: number
  windKph: number
  precipitationMm: number
  condition: WeatherCondition
  /** ISO timestamp of the reading */
  updatedAt: string
}

export interface EnvironmentResponse {
  data: EnvironmentData
  source: AqiSource
}

// ─── Persona ─────────────────────────────────────────────────────────────────
export type AgeGroup = 'young-adult' | 'adult' | 'senior'

export type HealthConditionKey =
  | 'none'
  | 'asthma'
  | 'heart'
  | 'respiratory'
  | 'allergies'
  | 'diabetes'

export type ConditionSeverity = 'mild' | 'moderate' | 'severe'

export interface HealthConditionEntry {
  condition: HealthConditionKey
  severity: ConditionSeverity
}

export type ExposureTimeBlock = 'morning' | 'midday' | 'afternoon' | 'evening'

export interface ExposureBlock {
  block: ExposureTimeBlock
  outdoors: boolean
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'vigorous'

// Legacy single-select types kept for backward compatibility with riskService
export type HealthProfile =
  | 'none'
  | 'asthma'
  | 'heart'
  | 'respiratory'

export type Lifestyle =
  | 'indoor'
  | 'outdoor-worker'
  | 'active-outdoors'
  | 'student'
  | 'sedentary'

export interface Persona {
  ageGroup: AgeGroup
  /** Legacy single-select — derived from lead condition in healthConditions */
  healthProfile: HealthProfile
  /** Legacy single-select — derived from exposure blocks */
  lifestyle: Lifestyle

  // ─── Extended fields (Amendment 1) ──────────────────────────────────
  healthConditions: HealthConditionEntry[]
  exposureBlocks: ExposureBlock[]
  activityLevel: ActivityLevel
  /** User-set 1–5 slider for subjective environmental sensitivity */
  sensitivityScore: number
}

/** A named, pre-built persona used in comparison sections. */
export interface PersonaPreset {
  id: string
  label: string
  description: string
  persona: Persona
}

/** A user-created saved persona profile (persisted in localStorage). */
export interface SavedProfile {
  id: string
  name: string
  persona: Persona
  createdAt: string
}

// ─── Risk ────────────────────────────────────────────────────────────────────
export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE'

export interface RiskFactor {
  label: string
  /** Relative contribution 0–1, used for visual weighting. */
  weight: number
  detail?: string
}

export interface RiskAssessment {
  level: RiskLevel
  /** 0–100 composite risk score. */
  score: number
  factors: RiskFactor[]
  /** One-line summary of why this level was reached. */
  summary: string
}

// ─── Advisory ────────────────────────────────────────────────────────────────
export interface Advisory {
  headline: string
  body: string
  /** AI-generated plain-English reasoning for why this risk level applies */
  reasoning: string
  reasons: string[]
  /** Practical, non-medical suggestions. */
  suggestions: string[]
  disclaimer: string
  source: DataSource
}

// ─── History ─────────────────────────────────────────────────────────────────
export interface HistoricalDay {
  /** ISO date */
  date: string
  label: string
  aqi: number
  temperatureC: number
  level: RiskLevel
  note: string
}

export interface HistoryInsight {
  paragraph: string
  source: DataSource
}

// ─── Chat (Ask AirPersona) ──────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
