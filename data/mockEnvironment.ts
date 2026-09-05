import type { EnvironmentData } from '@/types'

/**
 * MOCK DATA — development only.
 *
 * Represents a single live environmental reading. In production this will be
 * replaced by a live feed (e.g. WAQI for AQI + Open-Meteo for weather),
 * returning the same `EnvironmentData` shape.
 */
export const MOCK_ENVIRONMENT: EnvironmentData = {
  location: 'Delhi',
  country: 'India',
  aqi: 186,
  dominantPollutant: 'PM2.5',
  temperatureC: 34,
  humidityPct: 68,
  windKph: 12,
  precipitationMm: 0,
  condition: 'haze',
  updatedAt: '2026-09-05T09:20:00+05:30',
}
