import { NextRequest, NextResponse } from 'next/server'
import type { HistoricalDay, Persona, HistoryInsight, DataSource } from '@/types'
import { FALLBACK_HISTORY_INSIGHT } from '@/data/mockAdvisories'

const TIMEOUT_MS = 8000

function computeFallbackInsight(history: HistoricalDay[], persona: Persona): HistoryInsight {
  const elevatedDays = history.filter(
    d => d.level === 'ELEVATED' || d.level === 'HIGH' || d.level === 'SEVERE',
  ).length
  const avgAqi = Math.round(history.reduce((s, d) => s + d.aqi, 0) / (history.length || 1))
  const maxAqi = Math.max(...history.map(d => d.aqi))
  const maxDay = history.find(d => d.aqi === maxAqi)
  const trend = history.length >= 2
    ? history[history.length - 1].aqi > history[0].aqi ? 'worsening' : 'improving'
    : 'stable'

  const healthNote = persona.healthConditions.some(c => c.condition !== 'none')
    ? ` Given your health profile, prolonged outdoor exposure on elevated days warranted extra caution.`
    : ''

  return {
    paragraph: `Over the past ${history.length} days, air quality averaged AQI ${avgAqi} with a peak of ${maxAqi}${maxDay ? ` on ${maxDay.label}` : ''}. Elevated risk was observed on ${elevatedDays} of ${history.length} days, and the overall trend appears ${trend}.${healthNote}`,
    source: 'fallback' as DataSource,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { history, persona } = body as {
      history: HistoricalDay[]
      persona: Persona
    }

    if (!history || !persona) {
      return NextResponse.json(FALLBACK_HISTORY_INSIGHT)
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(computeFallbackInsight(history, persona))
    }

    try {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), TIMEOUT_MS)

      const healthDesc = persona.healthConditions
        .filter(c => c.condition !== 'none')
        .map(c => `${c.condition} (${c.severity})`)
        .join(', ') || 'no known conditions'

      const historyData = history.map(d =>
        `${d.label} (${d.date}): AQI ${d.aqi}, ${d.temperatureC}°C, ${d.level} — ${d.note}`
      ).join('\n')

      const prompt = `You are AirPersona. Analyze this 7-day environmental history for a user with ${healthDesc}, activity level ${persona.activityLevel}, sensitivity ${persona.sensitivityScore}/5.

RULES:
- Write exactly ONE paragraph (3-5 sentences)
- Notice patterns, trends, and which days were worst
- Reference how the user's specific health profile interacts with the week's conditions
- Be concise, grounded in the numbers, calm, and non-medical
- Never invent data not in the input

7-DAY DATA:
${historyData}

Respond with valid JSON only (no markdown):
{ "paragraph": "your one-paragraph insight here" }`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 300,
              responseMimeType: 'application/json',
            },
          }),
        },
      )

      if (!res.ok) {
        return NextResponse.json(computeFallbackInsight(history, persona))
      }

      const json = await res.json()
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        return NextResponse.json(computeFallbackInsight(history, persona))
      }

      const parsed = JSON.parse(text)
      return NextResponse.json({
        paragraph: parsed.paragraph || computeFallbackInsight(history, persona).paragraph,
        source: 'live' as DataSource,
      })
    } catch {
      return NextResponse.json(computeFallbackInsight(history, persona))
    }
  } catch {
    return NextResponse.json(FALLBACK_HISTORY_INSIGHT)
  }
}
