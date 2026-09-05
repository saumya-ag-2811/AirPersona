import { NextRequest, NextResponse } from 'next/server'
import type { Advisory, Persona, EnvironmentData, RiskAssessment, DataSource } from '@/types'

const TIMEOUT_MS = 8000
const DISCLAIMER = 'Not medical advice. For guidance only.'

// ─── Deterministic fallback advisory generator ──────────────────────────────
function generateFallbackAdvisory(
  env: EnvironmentData,
  persona: Persona,
  assessment: RiskAssessment,
): Advisory {
  const healthDesc = persona.healthConditions
    .filter(c => c.condition !== 'none')
    .map(c => `${c.condition} (${c.severity})`)
    .join(', ') || 'no known conditions'

  const outdoorCount = persona.exposureBlocks.filter(b => b.outdoors).length
  const exposureDesc = outdoorCount === 0 ? 'primarily indoor'
    : outdoorCount <= 2 ? 'moderate outdoor' : 'high outdoor'

  const airPhrase = env.aqi >= 150
    ? 'Current air quality is elevated'
    : env.aqi >= 100
      ? 'Current air quality is moderately degraded'
      : 'Current air quality is fair'

  const body = `${airPhrase} (AQI ${env.aqi}), and your profile indicates ${healthDesc} with ${exposureDesc} exposure. Your risk level is ${assessment.level} with a score of ${assessment.score}/100.`

  const reasoning = `Your risk score of ${assessment.score} is driven by an AQI of ${env.aqi}, ${healthDesc}, ${exposureDesc} exposure across ${outdoorCount} time blocks, and a sensitivity level of ${persona.sensitivityScore}/5. ${
    assessment.level === 'HIGH' || assessment.level === 'SEVERE'
      ? 'This combination significantly elevates your personal risk beyond what a generic alert would suggest.'
      : 'While conditions are present, your overall risk remains manageable with basic precautions.'
  }`

  const suggestions: string[] = []
  const high = assessment.level === 'HIGH' || assessment.level === 'SEVERE'

  if (high && outdoorCount >= 2) {
    suggestions.push('Limit strenuous outdoor activity during peak hours.')
    suggestions.push('Consider a well-fitted mask rated for fine particulates.')
  } else if (high) {
    suggestions.push('Keep windows closed and favor filtered indoor air.')
  } else {
    suggestions.push('Normal outdoor activity is reasonable — stay aware of changes.')
  }

  if (persona.healthConditions.some(c => c.condition !== 'none')) {
    suggestions.push('Keep any prescribed relief medication accessible.')
  }
  if (env.temperatureC >= 34) {
    suggestions.push('Stay hydrated — heat compounds air-quality strain.')
  }

  return {
    headline: 'What this means for you',
    body,
    reasoning,
    reasons: assessment.factors.slice(0, 3).map(f => f.label),
    suggestions: suggestions.slice(0, 3),
    disclaimer: DISCLAIMER,
    source: 'fallback' as DataSource,
  }
}

// ─── Gemini AI advisory generator ───────────────────────────────────────────
async function generateAIAdvisory(
  env: EnvironmentData,
  persona: Persona,
  assessment: RiskAssessment,
  apiKey: string,
): Promise<Advisory | null> {
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), TIMEOUT_MS)

    const healthDesc = persona.healthConditions
      .filter(c => c.condition !== 'none')
      .map(c => `${c.condition} (severity: ${c.severity})`)
      .join(', ') || 'no known conditions'

    const outdoorBlocks = persona.exposureBlocks
      .filter(b => b.outdoors)
      .map(b => b.block)
      .join(', ') || 'none'

    const systemPrompt = `You are AirPersona, an environmental health advisory AI. You explain personalized environmental risk to users in clear, calm, plain English.

RULES:
- Never phrase output as medical diagnosis, prescription, or emergency instruction
- Always ground claims in the specific numbers and persona fields provided
- No generic filler like "stay safe out there"
- Keep tone calm, not alarmist
- Explicitly say when conditions are actually fine
- Be concise — this is a UI card, not a report

The deterministic risk engine has already computed the risk. You EXPLAIN it, you do not calculate it.`

    const userPrompt = `Generate a personalized environmental advisory for this user.

ENVIRONMENT:
- Location: ${env.location}, ${env.country}
- AQI: ${env.aqi} (dominant pollutant: ${env.dominantPollutant})
- Temperature: ${env.temperatureC}°C
- Humidity: ${env.humidityPct}%
- Wind: ${env.windKph} km/h
- Condition: ${env.condition}

PERSONA:
- Age group: ${persona.ageGroup}
- Health conditions: ${healthDesc}
- Activity level: ${persona.activityLevel}
- Outdoor exposure blocks: ${outdoorBlocks}
- Sensitivity score: ${persona.sensitivityScore}/5

RISK ASSESSMENT (computed by deterministic engine — do NOT override these):
- Risk level: ${assessment.level}
- Risk score: ${assessment.score}/100
- Top factors: ${assessment.factors.map(f => `${f.label} (${f.detail})`).join(', ')}

Respond with valid JSON only (no markdown, no code fences):
{
  "headline": "short catchy headline (max 8 words)",
  "body": "2-4 sentence personalized advisory with one concrete action",
  "reasoning": "2-3 sentence plain-English explanation of WHY this risk level applies to THIS person specifically — reference specific health conditions, exposure patterns, and how they interact with today's AQI/temperature",
  "suggestions": ["action 1", "action 2", "action 3"]
}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
            responseMimeType: 'application/json',
          },
        }),
      },
    )

    if (!res.ok) return null

    const json = await res.json()
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    const parsed = JSON.parse(text)

    return {
      headline: parsed.headline || 'What this means for you',
      body: parsed.body || '',
      reasoning: parsed.reasoning || '',
      reasons: assessment.factors.slice(0, 3).map(f => f.label),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
      disclaimer: DISCLAIMER,
      source: 'live' as DataSource,
    }
  } catch {
    return null
  }
}

// ─── Route handler ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { environment, persona, assessment } = body as {
      environment: EnvironmentData
      persona: Persona
      assessment: RiskAssessment
    }

    if (!environment || !persona || !assessment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(generateFallbackAdvisory(environment, persona, assessment))
    }

    const aiAdvisory = await generateAIAdvisory(environment, persona, assessment, apiKey)
    if (!aiAdvisory) {
      return NextResponse.json(generateFallbackAdvisory(environment, persona, assessment))
    }

    return NextResponse.json(aiAdvisory)
  } catch {
    return NextResponse.json({
      headline: 'What this means for you',
      body: 'Unable to generate advisory at this time. Please try again.',
      reasoning: 'Advisory generation encountered an error.',
      reasons: [],
      suggestions: ['Check back in a few minutes.'],
      disclaimer: DISCLAIMER,
      source: 'fallback' as DataSource,
    })
  }
}
