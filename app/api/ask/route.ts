import { NextRequest } from 'next/server'
import type { Persona, EnvironmentData } from '@/types'

const TIMEOUT_MS = 15000

// ─── Smart deterministic fallback ───────────────────────────────────────────
// Called when API key is absent OR Gemini returns an error.
// Answers using the real environment + persona data so it's always useful.
function buildFallbackAnswer(question: string, env: EnvironmentData, persona: Persona): string {
  const q = question.toLowerCase()
  const aqi = env?.aqi ?? 100
  const temp = env?.temperatureC ?? 25
  const location = env?.location ?? 'your location'
  const pollutant = env?.dominantPollutant ?? 'PM2.5'
  const hasCondition = persona?.healthConditions?.some(c => c.condition !== 'none')
  const outdoorCount = persona?.exposureBlocks?.filter(b => b.outdoors).length ?? 0

  const aqiLevel =
    aqi >= 200 ? 'very unhealthy' :
    aqi >= 150 ? 'unhealthy' :
    aqi >= 100 ? 'unhealthy for sensitive groups' :
    aqi >= 50  ? 'moderate' : 'good'

  // Exercise / outdoors questions
  if (q.includes('exercise') || q.includes('outdoor') || q.includes('run') || q.includes('jog') || q.includes('walk')) {
    if (aqi >= 150) {
      return `With AQI at ${aqi} (${aqiLevel}) in ${location}, strenuous outdoor exercise is not recommended${hasCondition ? ' especially given your health conditions' : ''}. Consider indoor alternatives or limit activity to early morning when pollution tends to be lower.`
    } else if (aqi >= 100) {
      return `AQI is ${aqi} (${aqiLevel}) in ${location}. Light outdoor activity is generally okay but avoid prolonged vigorous exercise${hasCondition ? ' due to your health conditions' : ''}. Keep sessions short and stay hydrated.`
    } else {
      return `AQI is ${aqi} (good to moderate) in ${location} — outdoor exercise is fine today. ${hasCondition ? 'Keep your medication handy as a precaution.' : 'Enjoy your workout!'}`
    }
  }

  // Mask questions
  if (q.includes('mask')) {
    if (aqi >= 150) {
      return `At AQI ${aqi} in ${location}, a well-fitted N95 or KN95 mask is strongly recommended for any outdoor exposure. Surgical masks offer limited protection against fine particulates like ${pollutant}.`
    } else if (aqi >= 100) {
      return `AQI is ${aqi} in ${location}. A mask is recommended if you are sensitive${hasCondition ? ' — which you are given your health conditions' : ''}. An N95 offers the best protection against ${pollutant}.`
    } else {
      return `At current AQI of ${aqi} in ${location}, a mask is not strictly necessary for most people. You may still choose to wear one if you are sensitive or outdoors for extended periods.`
    }
  }

  // Air quality timing / when better
  if (q.includes('when') || q.includes('better') || q.includes('improve')) {
    return `Current AQI in ${location} is ${aqi} (${aqiLevel}), dominated by ${pollutant}. Air quality typically improves with wind or rain — check back later in the day. Early morning (5–8 AM) is usually the cleanest window before traffic and heat build up. ${aqi >= 150 ? 'Today looks like a high-exposure day — plan accordingly.' : ''}`
  }

  // Weather & temperature questions
  if (q.includes('weather') || q.includes('temperature') || q.includes('hot') || q.includes('heat') || q.includes('humid')) {
    return `In ${location} right now: ${temp}°C, ${env?.humidityPct ?? 60}% humidity, wind at ${env?.windKph ?? 10} km/h. ${temp >= 34 ? 'Heat above 34°C compounds air-quality stress — stay hydrated and limit midday outdoor exposure.' : 'Temperature is manageable today.'} AQI is ${aqi} (${aqiLevel}).`
  }

  // PM2.5 / PM10 / pollutant questions
  if (q.includes('pm2') || q.includes('pm10') || q.includes('pollutant') || q.includes('particulate')) {
    return `The dominant pollutant in ${location} right now is ${pollutant} with an overall AQI of ${aqi}. ${pollutant === 'PM2.5' ? 'PM2.5 particles are fine enough to penetrate deep into the lungs and enter the bloodstream, making them particularly concerning for respiratory and heart conditions.' : `${pollutant} can irritate airways and worsen existing respiratory conditions.`} ${hasCondition ? 'Given your health conditions, take extra care on days above AQI 100.' : ''}`
  }

  // Children / elderly / pregnancy questions
  if (q.includes('child') || q.includes('kid') || q.includes('baby') || q.includes('elderly') || q.includes('pregnant')) {
    return `Sensitive groups like children, elderly, and pregnant individuals face higher risk from poor air quality. At AQI ${aqi} in ${location}, ${aqi >= 100 ? 'these groups should limit outdoor time and keep windows closed.' : 'conditions are manageable but monitor for any signs of discomfort.'}`
  }

  // Generic / unknown question — give useful current snapshot
  return `Right now in ${location}: AQI is ${aqi} (${aqiLevel}), temperature ${temp}°C, dominant pollutant ${pollutant}. ${outdoorCount > 0 ? `You have ${outdoorCount} outdoor time block(s) today — ` : ''}${aqi >= 150 ? 'conditions are elevated, so reduce outdoor exposure where possible.' : aqi >= 100 ? 'conditions are moderate — take precautions if sensitive.' : 'conditions are relatively good today.'} Add a real Gemini API key for fully personalized AI answers.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, environment, persona } = body as {
      question: string
      environment: EnvironmentData
      persona: Persona
    }

    if (!question) {
      return new Response(JSON.stringify({ message: 'No question provided.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiKey = process.env.GEMINI_API_KEY

    // No key — use smart local fallback immediately
    if (!apiKey) {
      return new Response(
        JSON.stringify({ message: buildFallbackAnswer(question, environment, persona), source: 'fallback' }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    const healthDesc = persona?.healthConditions
      ?.filter(c => c.condition !== 'none')
      .map(c => `${c.condition} (${c.severity})`)
      .join(', ') || 'no known conditions'

    const outdoorBlocks = persona?.exposureBlocks
      ?.filter(b => b.outdoors)
      .map(b => b.block)
      .join(', ') || 'none'

    const systemPrompt = `You are AirPersona, a specialized environmental health Q&A assistant. You answer questions about air quality, weather, and how environmental conditions affect health — grounded in the user's current real data.

STRICT RULES:
- Only answer questions related to environmental conditions, air quality, weather, and their health effects
- If asked anything unrelated, politely redirect to environmental topics
- Never provide medical diagnosis, prescription, or emergency guidance
- Ground every answer in the specific data provided below
- Be concise (2–4 sentences), calm, and helpful
- Say "I don't have enough information" rather than guessing

CURRENT CONDITIONS:
- Location: ${environment?.location || 'Unknown'}, ${environment?.country || ''}
- AQI: ${environment?.aqi || 'N/A'} (${environment?.dominantPollutant || 'unknown'})
- Temperature: ${environment?.temperatureC || 'N/A'}°C
- Humidity: ${environment?.humidityPct || 'N/A'}%
- Wind: ${environment?.windKph || 'N/A'} km/h

USER PROFILE:
- Age: ${persona?.ageGroup || 'unknown'}
- Health: ${healthDesc}
- Activity level: ${persona?.activityLevel || 'unknown'}
- Outdoor exposure: ${outdoorBlocks}
- Sensitivity: ${persona?.sensitivityScore || 3}/5`

    try {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), TIMEOUT_MS)

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt + '\n\nUser question: ' + question }] },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 400,
            },
          }),
        },
      )

      if (!res.ok) {
        // API key invalid or quota exceeded — fall back gracefully with real data
        return new Response(
          JSON.stringify({ message: buildFallbackAnswer(question, environment, persona), source: 'fallback' }),
          { headers: { 'Content-Type': 'application/json' } },
        )
      }

      const json = await res.json()
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        return new Response(
          JSON.stringify({ message: buildFallbackAnswer(question, environment, persona), source: 'fallback' }),
          { headers: { 'Content-Type': 'application/json' } },
        )
      }

      return new Response(
        JSON.stringify({ message: text, source: 'live' }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    } catch {
      // Timeout or network error — still give a useful answer
      return new Response(
        JSON.stringify({ message: buildFallbackAnswer(question, environment, persona), source: 'fallback' }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }
  } catch {
    return new Response(
      JSON.stringify({ message: 'Unable to read your question. Please try again.', source: 'fallback' }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }
}
