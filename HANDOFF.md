# AIRPERSONA — DEVELOPMENT HANDOFF

> **ATTENTION NEXT AGENT:** Read this document completely BEFORE making any code edits or running commands. It outlines the precise architecture, completed implementation status, zero-error fallback pipelines, and design constraints.

---

## 1. Project Overview
**AirPersona** is a personalized environmental intelligence platform designed to solve the problem of generic weather/AQI alerts. Generic alerts apply the exact same threshold to everyone regardless of individual health conditions or exposure. AirPersona combines live weather + AQI conditions with a user's health profile (age group, multi-select health conditions with severity, daily exposure time-blocks, activity level, sensitivity rating) using a **hybrid architecture**:
1. A **deterministic risk engine** (`riskService.ts`) calculates a grounded 0–100 composite risk score and qualitative level (`LOW`, `MODERATE`, `ELEVATED`, `HIGH`, `SEVERE`). The AI never guesses or invents numerical risk scores.
2. A **multisurface AI layer** (Gemini) generates plain-English personalized advisories, risk reasoning narratives ("why this level for this person today"), 7-day trend insights, and handles streaming follow-up Q&A ("Ask AirPersona").
3. A **3-tier zero-error fallback pipeline** ensures the app runs 100% crash-free even without `.env` keys present, seamlessly switching to live WAQI, Open-Meteo, and Gemini APIs when keys are added.

---

## 2. Current Status (100% Complete — All Bugs & Hydration Issues Fixed)
- **Phase 1 Data Foundation**: Fully extended domain types (`types/index.ts`), mock data catalogs (`mockPersonas.ts`, `mockEnvironment.ts`, `mockHistory.ts`), and fallback advisories (`mockAdvisories.ts`).
- **Backend Next.js API Routes (`app/api/*`)**: Fully operational with 3-tier cascade and zero-error fallback:
  - `/api/environment`: WAQI → Open-Meteo Air Quality → Mock fallback
  - `/api/history`: Open-Meteo 7-day historical feed → Mock fallback
  - `/api/advisory`: Gemini 2.0 Flash personalized advisory + risk reasoning → Local deterministic fallback
  - `/api/history-insight`: Gemini 2.0 Flash 7-day trend synthesis → Local computed summary fallback
  - `/api/ask`: Gemini 2.0 Flash grounded Q&A endpoint → Smart data-grounded fallback (answers exercise, mask, timing, weather, pollutant & general queries using current AQI & persona context)
- **Core Logic Services (`services/*`)**: Fully implemented and debugged.
- **Provider Context & State Integration**: Fully wired with live API calls.
- **Frontend UI Sections**: All 11 sections implemented, styled with OKLCH theme tokens, and visually verified bug-free.

### Bug & Hydration Fixes Applied (Session: 2026-09-05)
The following visual, data, hydration, and API fallback issues were identified and resolved:

| Bug / Issue | File(s) | Fix Applied |
|-------------|---------|-------------|
| Hero section: "O₃ DOMINANT" text overlapped "SCROLL TO DISCOVER" scroll indicator | `sections/hero-section.tsx` | Added `pb-24` padding to the snapshot stats bar, creating clear visual separation |
| Transformation section: Equation card text truncated ("Outdo..." instead of "Outdoor worker") | `sections/transformation-section.tsx` | Changed `Term` component from `absolute + whitespace-nowrap + overflow-hidden` to block-level with `min-h` — text now wraps/fits correctly |
| History chart: Duplicate day labels on x-axis (two "Wed" or two "Thu") | `data/mockHistory.ts` | Corrected ALL 7 labels to match calendar reality: **Sun, Mon, Tue, Wed, Thu, Fri, Sat** (week of Aug 30 – Sep 5, 2026) |
| Section nav scroll: Sections hidden under fixed navbar when navigated to | `components/section-kit.tsx` | Added `scroll-mt-20` Tailwind utility to `Section` component |
| Favicon 404 console error | `app/layout.tsx` | Added icon metadata referencing existing `/icon.svg`, `/icon-dark-32x32.png`, and `/apple-icon.png` in `/public` |
| React Hydration Mismatch (`09:20 am` vs `09:20 AM`) | `sections/environment-section.tsx` | Formatted timestamp inside client-side `useEffect` hook to prevent server/client SSR mismatch |
| Ask AirPersona "Unable to process" error when Gemini key was missing/invalid | `app/api/ask/route.ts` | Implemented a smart, data-grounded local fallback (`buildFallbackAnswer`) that answers questions about exercise, masks, timing, weather, and pollutants using the active environment and persona snapshot |

**Build & Runtime Status**: Verified — `npm run build` produces 0 errors, 0 warnings, and 0 hydration runtime issues.

---

## 3. Tech Stack
- **Framework**: Next.js 16.3.3 (App Router, Server-side API Routes, Turbopack)
- **Library**: React 19, React DOM 19
- **TypeScript**: TypeScript 5.7.3
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), Vanilla CSS custom properties with OKLCH color spaces, Glassmorphism, Dark Atmospheric theme
- **Animations**: Motion (`motion/react` v13.2.0), Lucide React icons (`lucide-react`)
- **Data Visualization**: Recharts (`recharts` v3.10.1)
- **APIs**:
  - Open-Meteo Weather & Geocoding API (Free, no key required)
  - Open-Meteo Air Quality API (Free, no key required)
  - World Air Quality Index API (WAQI — key optional via `WAQI_TOKEN`)
  - Google Gemini API (`gemini-2.0-flash` REST endpoint — key optional via `GEMINI_API_KEY`)

---

## 4. Project Structure
```
AIRPersona_Frontend/
├── app/
│   ├── api/
│   │   ├── advisory/
│   │   │   └── route.ts          # POST: Gemini advisory & risk reasoning (with fallback)
│   │   ├── ask/
│   │   │   └── route.ts          # POST: Gemini grounded Q&A endpoint (with smart data fallback)
│   │   ├── environment/
│   │   │   └── route.ts          # GET: 3-tier environment feed (WAQI -> Open-Meteo AQ -> Mock)
│   │   ├── history/
│   │   │   └── route.ts          # GET: 7-day historical weather & AQI feed
│   │   └── history-insight/
│   │       └── route.ts          # POST: Gemini 7-day trend insight synthesis
│   ├── globals.css               # Atmospheric ink theme, custom OKLCH tokens, utilities
│   ├── layout.tsx                # Next.js root layout with Space Grotesk + Inter fonts + icon metadata
│   └── page.tsx                  # Main single-page scroll experience mounting all sections
├── components/
│   ├── air-persona-provider.tsx  # Global React Context & async state pipeline
│   ├── aqi-gauge.tsx             # Radial gauge component for AQI score
│   ├── ask-airpersona.tsx        # Interactive AI chat component with prompt chips & streaming state
│   ├── atmosphere-background.tsx # Canvas/CSS animated background reflecting AQI
│   ├── historical-chart.tsx      # Recharts area chart for 7-day AQI trend
│   ├── motion-primitives.tsx     # Reveal, StaggerLines, AnimatedNumber helpers
│   ├── navigation.tsx            # Floating sticky navigation bar with section anchors
│   ├── persona-comparison.tsx    # Card grid comparing risk scores across saved profiles / presets
│   ├── persona-selector.tsx      # Chip-based configurator UI (Age, Multi-condition, Exposure, Activity, Sensitivity, Save/Load)
│   ├── process-visualization.tsx # Stepper component showing system data pipeline
│   ├── risk-display.tsx          # RiskLevelTag, RiskLevelWord, RiskMeter, FactorBars
│   ├── section-kit.tsx           # Section (with scroll-mt-20) and SectionLabel wrappers
│   └── ui/                       # UI primitive components
├── data/
│   ├── mockAdvisories.ts         # Fallback template advisories and insights
│   ├── mockEnvironment.ts        # Sample environment snapshot
│   ├── mockHistory.ts            # 7-day historical readings (labels corrected: Sun–Sat)
│   └── mockPersonas.ts           # Persona presets, default persona, and option catalogs
├── lib/
│   ├── airTheme.ts               # OKLCH color mappings for risk levels and AQI categories
│   └── utils.ts                  # Tailwind merge helper
├── services/
│   ├── advisoryService.ts        # AI fetchers + local template advisory generators
│   ├── environmentService.ts     # Async API fetchers + sync mock getters
│   └── riskService.ts            # Deterministic composite risk calculator (0-100)
├── sections/
│   ├── hero-section.tsx          # Section 01: Hero with parallax title & live snapshot (overlap fixed)
│   ├── same-air-section.tsx      # Section 02: "Same air, different people" interactive
│   ├── environment-section.tsx   # Section 03: Live AQI gauge, location search, "Locate Me" button (hydration fixed)
│   ├── persona-section.tsx       # Section 04: AirPersona configurator section
│   ├── transformation-section.tsx# Section 05: Live equation breakdown (card truncation fixed)
│   ├── risk-section.tsx          # Section 06: Risk level display, factor breakdown & AI reasoning card
│   ├── advisory-section.tsx      # Section 07: Personalized AI advisory & Ask AirPersona chat
│   ├── history-section.tsx       # Section 08: 7-day trend chart & AI weekly trend synthesis (labels fixed)
│   ├── comparison-section.tsx    # Section 09: Saved profiles comparison grid
│   ├── transparency-section.tsx  # Section 10: How AirPersona works step breakdown
│   └── final-section.tsx         # Section 11: Call-to-action & scroll-to-top
├── types/
│   └── index.ts                  # Domain TypeScript interfaces
├── .env                          # Local environment variables (GEMINI_API_KEY, WAQI_TOKEN)
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies & scripts
└── tsconfig.json                 # TypeScript configuration
```

---

## 5. Frontend Architecture
- **Pages**: Single-page cinematic scroll experience in `app/page.tsx`.
- **Styling**: `globals.css` defines an atmospheric ink aesthetic (`--background: oklch(0.17 0.012 250)`), haze sodium accent (`--accent: oklch(0.79 0.14 68)`), and risk spectrum colors (`LOW`, `MODERATE`, `ELEVATED`, `HIGH`, `SEVERE`).
- **Animations**: Framer Motion primitives (`Reveal`, `StaggerLines`, `AnimatedNumber`, `AnimatePresence` layout transitions).
- **State Management**: `AirPersonaProvider` in `components/air-persona-provider.tsx` exposes global environment, persona, assessment, advisory, history, historyInsight, and savedProfiles state to all sections via `useAirPersona()`.
- **Mock Data & Resilience**: Located in `data/` directory, automatically used as fallback when live APIs are disabled or missing keys.

---

## 6. Backend Architecture
- **Server Structure**: Next.js App Router API handlers (`app/api/*/route.ts`).
- **Routes & Data Flow**:
  - `GET /api/environment?location=...`: Geocodes → WAQI (token optional) → Open-Meteo AQ → Mock fallback. Returns `{ data: EnvironmentData, source: 'waqi' | 'open-meteo-aq' | 'mock' }`.
  - `GET /api/history?lat=...&lon=...`: Open-Meteo 7-day feed → Mock fallback. Returns `{ data: HistoricalDay[], source: 'live' | 'mock' }`.
  - `POST /api/advisory`: Gemini explanatory advisory → local deterministic fallback.
  - `POST /api/history-insight`: Gemini 7-day synthesis → local statistical fallback.
  - `POST /api/ask`: Gemini grounded Q&A → smart data-grounded local fallback.
- **Risk Engine**: `services/riskService.ts` contains `assessRisk(env, persona)` — composite 0–100 score. NEVER let the AI change or override these values.

---

## 7. Environment Variables (`.env`)
Configured in `.env`:

1. **`WAQI_TOKEN`**: Optional. Replace `ABC` with your WAQI token from https://aqicn.org/data-platform/token/. If missing or placeholder, falls back to Open-Meteo AQ (free).
2. **`GEMINI_API_KEY`**: Optional. Replace `XYZ` with your Gemini key from https://aistudio.google.com/app/apikey. If missing or placeholder, all AI routes use deterministic local fallbacks with zero console or network errors.

---

## 8. Running & Building Locally
```powershell
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Production build validation
npm run build
```

- **Localhost URL**: `http://localhost:3000`
- **Build Status**: Verified — 0 errors, 0 TypeScript errors, all 7 routes (static + dynamic) compile successfully.

---

## 9. Features Checklist (100% Complete & Bug-Free)

- [x] Location-based live weather + AQI dashboard
- [x] Browser Geolocation "Locate Me" button
- [x] 7-day historical weather & AQI feed with chart
- [x] Hybrid Risk Engine with extended persona fields
- [x] Zero-error fallback backend API routes
- [x] Extended TypeScript domain types
- [x] Option catalogs & mock fallback advisories
- [x] Provider Context API Integration with live location search
- [x] Persona Configurator: Age chips, multi-condition + severity, 4 exposure blocks, activity, sensitivity slider, save/load
- [x] Location Selector with source badges (Live WAQI / Live Open-Meteo AQ / Sample Data)
- [x] AI Risk Reasoning card (driven by Gemini/fallback)
- [x] AI Advisory & Ask AirPersona chat box (with smart data-grounded fallback)
- [x] Weekly Insight Synthesis card
- [x] Comparison section wired to saved profiles
- [x] **[FIXED]** Hero section: no overlap between stats bar and scroll indicator
- [x] **[FIXED]** Transformation section: equation cards show full text (no truncation)
- [x] **[FIXED]** History chart: 7 unique day labels (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
- [x] **[FIXED]** Section scroll offset: navbar no longer obscures section headings
- [x] **[FIXED]** Favicon: icon metadata added, no 404 console error
- [x] **[FIXED]** React Hydration Mismatch: timestamp formatted in client `useEffect`
- [x] **[FIXED]** Ask AirPersona fallback: Smart local Q&A engine returns data-grounded responses when API key is missing or invalid

---

## 10. Important Architectural Decisions
- **DO NOT let LLM compute or override risk numbers**: The deterministic risk engine in `riskService.ts` MUST remain the source of truth for all numeric risk scores (0–100) and risk levels. The LLM only explains and personalizes.
- **Keep 3-tier fallback cascade**: Never remove the fallback logic from API routes. Every route must return valid data within 8 seconds even if network calls fail or keys are absent.
- **Preserve Dark Atmospheric Design**: The visual styling relies on OKLCH color spaces, glassmorphism, and custom motion primitives. Do not add generic Tailwind colors or disrupt the scroll-section rhythm.
- **Section components use `scroll-mt-20`**: This is set via the `Section` wrapper in `components/section-kit.tsx`. Do not remove it — it ensures nav scroll offsets are correct for all anchor links.

---

## 11. Current Status Summary & Future Scope

### What is Left to Fix?
**Nothing — 0 active bugs remain.**
- Build check (`npm run build`) passes with 0 errors.
- Hydration check: 0 hydration warnings or error badges.
- Browser test: All 11 sections render, animate, and function cleanly.
- API Fallbacks: Handled gracefully across all routes.

### Potential Future Enhancements (Optional)
- Add a PDF export feature for personal air risk reports.
- Implement push notifications / browser alerts when AQI crosses safety thresholds.
- Shareable URL links encoding custom persona parameters (`?age=senior&condition=asthma`).
- Live WAQI 7-day historical API integration (currently historical uses Open-Meteo 7-day archive feed).
