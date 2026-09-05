import { NextRequest, NextResponse } from 'next/server'
import { MOCK_ENVIRONMENT } from '@/data/mockEnvironment'
import type { EnvironmentData, WeatherCondition, AqiSource } from '@/types'

const TIMEOUT_MS = 8000

function withTimeout(ms: number): AbortController {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller
}

// ─── Weather condition mapping from WMO codes ───────────────────────────────
function wmoToCondition(code: number): WeatherCondition {
  if (code <= 1) return 'clear'
  if (code <= 3) return 'cloudy'
  if (code >= 51 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'cloudy'
  if (code >= 80) return 'rain'
  return 'haze'
}

// ─── Tier 1: WAQI (requires WAQI_TOKEN) ─────────────────────────────────────
async function fetchWAQI(
  location: string,
  token: string,
): Promise<{ aqi: number; dominantPollutant: string } | null> {
  try {
    const controller = withTimeout(TIMEOUT_MS)
    const res = await fetch(
      `https://api.waqi.info/feed/${encodeURIComponent(location)}/?token=${token}`,
      { signal: controller.signal },
    )
    if (!res.ok) return null
    const json = await res.json()
    if (json.status !== 'ok' || !json.data) return null
    return {
      aqi: typeof json.data.aqi === 'number' ? json.data.aqi : 100,
      dominantPollutant: json.data.dominentpol || json.data.dominantPol || 'PM2.5',
    }
  } catch {
    return null
  }
}

// ─── Tier 2: Open-Meteo Air Quality (free, no key) ─────────────────────────
async function fetchOpenMeteoAQ(
  lat: number,
  lon: number,
): Promise<{ aqi: number; dominantPollutant: string } | null> {
  try {
    const controller = withTimeout(TIMEOUT_MS)
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone`,
      { signal: controller.signal },
    )
    if (!res.ok) return null
    const json = await res.json()
    const current = json.current
    if (!current) return null

    const aqi = current.us_aqi ?? 0
    // Determine dominant pollutant from concentrations
    const pollutants = [
      { name: 'PM2.5', val: current.pm2_5 ?? 0 },
      { name: 'PM10', val: current.pm10 ?? 0 },
      { name: 'NO₂', val: current.nitrogen_dioxide ?? 0 },
      { name: 'O₃', val: current.ozone ?? 0 },
    ]
    pollutants.sort((a, b) => b.val - a.val)
    return { aqi, dominantPollutant: pollutants[0]?.name || 'PM2.5' }
  } catch {
    return null
  }
}

// ─── Weather from Open-Meteo (free, no key) ─────────────────────────────────
async function fetchOpenMeteoWeather(
  lat: number,
  lon: number,
): Promise<Omit<EnvironmentData, 'aqi' | 'dominantPollutant' | 'location' | 'country'> | null> {
  try {
    const controller = withTimeout(TIMEOUT_MS)
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code`,
      { signal: controller.signal },
    )
    if (!res.ok) return null
    const json = await res.json()
    const c = json.current
    if (!c) return null
    return {
      temperatureC: Math.round(c.temperature_2m ?? 25),
      humidityPct: Math.round(c.relative_humidity_2m ?? 50),
      windKph: Math.round(c.wind_speed_10m ?? 10),
      precipitationMm: Math.round((c.precipitation ?? 0) * 10) / 10,
      condition: wmoToCondition(c.weather_code ?? 0),
      updatedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

// ─── Geocoding (Open-Meteo, free) ───────────────────────────────────────────
async function geocode(
  query: string,
): Promise<{ lat: number; lon: number; name: string; country: string } | null> {
  try {
    const controller = withTimeout(TIMEOUT_MS)
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en`,
      { signal: controller.signal },
    )
    if (!res.ok) return null
    const json = await res.json()
    const r = json.results?.[0]
    if (!r) return null
    return { lat: r.latitude, lon: r.longitude, name: r.name, country: r.country ?? '' }
  } catch {
    return null
  }
}

// ─── Route handler ──────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || 'Delhi'

  // Geocode the location
  const geo = await geocode(location)
  if (!geo) {
    // Can't even geocode — full fallback
    return NextResponse.json({
      data: { ...MOCK_ENVIRONMENT, location },
      source: 'mock' as AqiSource,
    })
  }

  // Fetch weather (always Open-Meteo)
  const weather = await fetchOpenMeteoWeather(geo.lat, geo.lon)

  // AQI cascade: WAQI → Open-Meteo AQ → mock
  let aqiData: { aqi: number; dominantPollutant: string } | null = null
  let aqiSource: AqiSource = 'mock'

  const waqiToken = process.env.WAQI_TOKEN
  if (waqiToken) {
    aqiData = await fetchWAQI(location, waqiToken)
    if (aqiData) aqiSource = 'waqi'
  }

  if (!aqiData) {
    aqiData = await fetchOpenMeteoAQ(geo.lat, geo.lon)
    if (aqiData) aqiSource = 'open-meteo-aq'
  }

  if (!aqiData) {
    aqiData = { aqi: MOCK_ENVIRONMENT.aqi, dominantPollutant: MOCK_ENVIRONMENT.dominantPollutant }
    aqiSource = 'mock'
  }

  const data: EnvironmentData = {
    location: geo.name,
    country: geo.country,
    aqi: aqiData.aqi,
    dominantPollutant: aqiData.dominantPollutant,
    temperatureC: weather?.temperatureC ?? MOCK_ENVIRONMENT.temperatureC,
    humidityPct: weather?.humidityPct ?? MOCK_ENVIRONMENT.humidityPct,
    windKph: weather?.windKph ?? MOCK_ENVIRONMENT.windKph,
    precipitationMm: weather?.precipitationMm ?? MOCK_ENVIRONMENT.precipitationMm,
    condition: weather?.condition ?? MOCK_ENVIRONMENT.condition,
    updatedAt: weather?.updatedAt ?? new Date().toISOString(),
  }

  return NextResponse.json({ data, source: aqiSource })
}
