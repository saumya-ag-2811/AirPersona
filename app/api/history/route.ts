import { NextRequest, NextResponse } from 'next/server'
import { MOCK_HISTORY } from '@/data/mockHistory'
import type { HistoricalDay, RiskLevel } from '@/types'

const TIMEOUT_MS = 8000

function scoreToLevel(aqi: number, tempC: number): RiskLevel {
  const combined = aqi + (tempC > 32 ? (tempC - 32) * 3 : 0)
  if (combined >= 250) return 'SEVERE'
  if (combined >= 190) return 'HIGH'
  if (combined >= 130) return 'ELEVATED'
  if (combined >= 70) return 'MODERATE'
  return 'LOW'
}

function aqiNote(aqi: number): string {
  if (aqi <= 50) return 'Air quality was good.'
  if (aqi <= 100) return 'Air quality was moderate.'
  if (aqi <= 150) return 'Air quality was unhealthy for sensitive groups.'
  if (aqi <= 200) return 'Air quality was unhealthy.'
  if (aqi <= 300) return 'Air quality was very unhealthy.'
  return 'Air quality was hazardous.'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ data: MOCK_HISTORY, source: 'mock' })
  }

  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), TIMEOUT_MS)

    // Fetch 7-day historical weather
    const end = new Date()
    const start = new Date(end)
    start.setDate(start.getDate() - 6)

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    const [weatherRes, aqRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weather_code&start_date=${startStr}&end_date=${endStr}&timezone=auto`,
        { signal: controller.signal },
      ),
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&daily=us_aqi&start_date=${startStr}&end_date=${endStr}&timezone=auto`,
        { signal: controller.signal },
      ),
    ])

    if (!weatherRes.ok || !aqRes.ok) {
      return NextResponse.json({ data: MOCK_HISTORY, source: 'mock' })
    }

    const weatherJson = await weatherRes.json()
    const aqJson = await aqRes.json()

    const dates = weatherJson.daily?.time as string[] | undefined
    const temps = weatherJson.daily?.temperature_2m_max as number[] | undefined
    const aqis = aqJson.daily?.us_aqi as number[] | undefined

    if (!dates || !temps || !aqis || dates.length === 0) {
      return NextResponse.json({ data: MOCK_HISTORY, source: 'mock' })
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const data: HistoricalDay[] = dates.map((date, i) => {
      const aqi = aqis[i] ?? 0
      const tempC = Math.round(temps[i] ?? 25)
      const d = new Date(date)
      return {
        date,
        label: days[d.getDay()],
        aqi,
        temperatureC: tempC,
        level: scoreToLevel(aqi, tempC),
        note: aqiNote(aqi),
      }
    })

    return NextResponse.json({ data, source: 'live' })
  } catch {
    return NextResponse.json({ data: MOCK_HISTORY, source: 'mock' })
  }
}
