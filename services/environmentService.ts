import type { EnvironmentData, EnvironmentResponse, HistoricalDay } from '@/types'
import { MOCK_ENVIRONMENT } from '@/data/mockEnvironment'
import { MOCK_HISTORY } from '@/data/mockHistory'

/**
 * Environment data access.
 *
 * Provides both synchronous (mock) and async (API-backed) access patterns.
 * Synchronous getters are used for initial hydration; async fetchers hit the
 * API routes which handle the WAQI → Open-Meteo AQ → mock cascade.
 */
export function getCurrentEnvironment(): EnvironmentData {
  return MOCK_ENVIRONMENT
}

export function getHistory(): HistoricalDay[] {
  return MOCK_HISTORY
}

/** Fetch live environment data via API route. */
export async function fetchCurrentEnvironment(
  location: string = 'Delhi',
): Promise<EnvironmentResponse> {
  try {
    const res = await fetch(`/api/environment?location=${encodeURIComponent(location)}`)
    if (!res.ok) throw new Error('Failed to fetch')
    return await res.json()
  } catch {
    return { data: MOCK_ENVIRONMENT, source: 'mock' }
  }
}

/** Fetch 7-day historical data via API route. */
export async function fetchHistory(
  lat?: number,
  lon?: number,
): Promise<{ data: HistoricalDay[]; source: string }> {
  try {
    const params = lat && lon ? `?lat=${lat}&lon=${lon}` : ''
    const res = await fetch(`/api/history${params}`)
    if (!res.ok) throw new Error('Failed to fetch')
    return await res.json()
  } catch {
    return { data: MOCK_HISTORY, source: 'mock' }
  }
}
