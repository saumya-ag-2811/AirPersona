# AirPersona

**The air is the same. Your risk isn't.**

AirPersona is a personalized environmental intelligence platform built for Origin '26 Hackathon under the **AI & Machine Learning** track (Problem Statement 4: *AI-Powered Personalized Weather & AQI Health Advisory*).

Generic weather and AQI alerts treat everyone the same. AirPersona combines live environmental conditions with a person's actual health profile, exposure pattern, age, and activity level to answer the question generic alerts never do: **"What does today's air actually mean for me?"**

🔗 **Live Demo:** `<add your deployed URL here>`
📦 **Repository:** `<add your GitHub repo URL here>`

---

## The Problem

Weather and AQI apps issue the same alert to everyone, regardless of who's reading it. But the real health impact of identical air conditions varies enormously based on health conditions, age, outdoor exposure, activity level, and personal sensitivity. A generic "AQI 186" warning means something very different to a healthy adult who works indoors than it does to a senior with a heart condition who spends afternoons outside — yet today, they get the exact same message.

## Core Insight: Same Air, Different Risk

Hold the environment constant — AQI 186, PM2.5 dominant, 34°C, 68% humidity — and the risk still diverges sharply by person:

| Persona | Risk Level |
|---|---|
| Healthy adult, mostly indoors | Elevated |
| Moderate asthma + outdoor activity | Severe |
| Outdoor worker, prolonged exposure | High |
| Older adult, respiratory + heart sensitivity | Severe |

**The environment didn't change. The person did.** That divergence — not the raw AQI number — is what AirPersona is built to surface.

---

## The Solution

AirPersona turns live environmental data into personalized, actionable guidance by combining:

- **Live air quality and weather data** for any location
- **A configurable personal health and exposure profile**
- **A deterministic risk engine** that computes a grounded, explainable score
- **An AI reasoning layer** that translates that score into plain-English, personalized advisory

**Outputs:** risk score, risk level, factor breakdown, personalized advisory, "why this risk today" explanation, 7-day trend insight, and live follow-up Q&A.

---

## Building an AirPersona (Profile Inputs)

- **Age group** — Young Adult, Adult, Senior
- **Health conditions** — Asthma, heart condition, respiratory sensitivity, allergies, diabetes (multi-select)
- **Condition severity** — Mild, Moderate, Severe
- **Exposure blocks** — Morning, Midday, Afternoon, Evening
- **Lifestyle** — Indoor, Outdoor worker, Active outdoors, Student, Sedentary
- **Activity level** — Sedentary, Light, Moderate, Vigorous
- **Personal sensitivity score** — Self-reported, 1–5

Multiple profiles can be saved and compared side by side against the same live conditions.

---

## How the Risk Engine Works

Risk is computed by a **deterministic, composite 0–100 scoring function** — not by the AI. Inputs include:

- AQI + heat index
- Health condition sensitivity
- Exposure duration/timing
- Age group
- Activity level
- Personal sensitivity score

**Risk levels:** `Low` → `Moderate` → `Elevated` → `High` → `Severe`

**Core design principle:** the AI never calculates or overrides the numerical risk score. The deterministic engine is the single source of truth for "what is the risk." The AI's job is entirely to explain and personalize that already-verified number — this avoids AI hallucination on a health-relevant figure while keeping the AI layer central to the actual user experience.

---

## Live Environmental Intelligence

- Location search or browser "Locate Me" geolocation
- Live AQI, dominant pollutant, temperature, humidity, wind, precipitation, and condition summary
- **Data pipeline (three-tier fallback):**
  1. **WAQI** — primary AQI source
  2. **Open-Meteo Air Quality + Weather** — free fallback if WAQI is unavailable
  3. **Mock data** — reliable last-resort fallback so the demo never breaks

---

## Personalized Guidance with AI

**Google Gemini 2.0 Flash** powers four grounded AI surfaces:

1. **Personalized Advisory** — calm, plain-English, actionable guidance
2. **Risk Reasoning** — a "why this risk today" explanation grounded in the actual computed factors
3. **7-Day Trend Insight** — a synthesized narrative from historical data, not just a chart
4. **Ask AirPersona** — live follow-up Q&A for questions about exercise, masks, timing, weather, and pollutants

In every case, the AI explains the assessment — it never makes the underlying numerical decision.

---

## Reliability by Design

AirPersona uses a **three-tier, zero-error fallback architecture** across every data-dependent feature:

| Feature | Primary | Secondary | Fallback |
|---|---|---|---|
| Environmental data | WAQI | Open-Meteo | Mock data |
| AI advisory | Gemini | — | Deterministic local template |
| Historical insight | Gemini | — | Locally computed summary |
| Follow-up Q&A | Gemini | — | Smart data-grounded fallback |

The app remains fully functional with clear "Sample Data" labeling even without API keys or during temporary network failures — and switches to live data automatically once keys are available, with no code changes required.

---

## Seven-Day History and Comparison

- Historical AQI and weather trend chart for pattern recognition over the past week
- Saved-profile comparison view — see how identical conditions affect multiple people differently, useful for households, caregivers, and individuals making daily decisions

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS, custom OKLCH atmospheric theme, glassmorphism |
| Motion & Visualization | Motion, Recharts, Lucide icons |
| Weather & AQI APIs | Open-Meteo (Weather + Air Quality), WAQI |
| AI | Google Gemini 2.0 Flash |
| Architecture | Next.js API routes, global React context, deterministic risk service, resilient multi-tier fallback pipelines |

This project uses live, real API integrations (WAQI, Open-Meteo, Gemini) and is deployed for live demo access.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone <your-repo-url>
cd airpersona
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

```env
WAQI_TOKEN=your_waqi_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

> The app runs fully on mock/fallback data even without these keys. Add them to enable live weather/AQI data and real AI-generated guidance.

### Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Build for production

```bash
npm run build
npm run start
```

---

## Impact and Future Scope

AirPersona makes environmental information personal, understandable, and actionable — turning a generic number into guidance someone can actually act on.

**Potential future enhancements:**
- Push notifications when personal risk crosses a safety threshold
- Downloadable PDF personal air-risk reports
- Shareable profile URLs
- Expanded historical air-quality integrations

**"Don't just check the air. Understand what it means for you."**

---

## Team

**Coderant Knight**
- Saumya Agarawal — 25BCE10298
- Pratul Kashyap — 25BCE10322

Built during Origin '26 — 24-Hour Overnight Hackathon.

---

## Disclaimer

AirPersona provides environmental-risk guidance and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.

## License

This project was built for hackathon purposes. License terms to be determined by the team.
