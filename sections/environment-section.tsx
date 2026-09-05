'use client'

import { useState, useEffect } from 'react'
import { Droplets, Wind, CloudRain, Thermometer, Sun, MapPin, Loader2, Navigation } from 'lucide-react'
import { Section, SectionLabel } from '@/components/section-kit'
import { Reveal, AnimatedNumber } from '@/components/motion-primitives'
import { AQIGauge } from '@/components/aqi-gauge'
import { AtmosphereBackground } from '@/components/atmosphere-background'
import { useAirPersona } from '@/components/air-persona-provider'
import { aqiColor } from '@/lib/airTheme'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const PRESET_CITIES = ['Delhi', 'London', 'New York', 'Tokyo', 'Sydney'] as const

// ─── Data source badge ────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: string }) {
  const config: Record<string, { label: string; dot: string }> = {
    waqi: { label: 'Live WAQI', dot: 'bg-emerald-400' },
    'open-meteo-aq': { label: 'Live Open-Meteo AQ', dot: 'bg-sky-400' },
    mock: { label: 'Sample Data', dot: 'bg-amber-400' },
  }
  const c = config[source] ?? { label: 'Sample Data', dot: 'bg-amber-400' }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm">
      <span className={cn('h-1.5 w-1.5 animate-pulse rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}

// ─── Environment section ──────────────────────────────────────────────────────
export function EnvironmentSection() {
  const { environment, environmentSource, isEnvironmentLoading, location, setLocation } =
    useAirPersona()
  const intensity = Math.min(environment.aqi / 260, 0.9)
  const color = aqiColor(environment.aqi)

  const [inputValue, setInputValue] = useState(location)
  const [isLocating, setIsLocating] = useState(false)
  // Client-only timestamp — avoids SSR/client locale mismatch (hydration error)
  const [timestamp, setTimestamp] = useState('')
  useEffect(() => {
    const fmt = (iso: string) =>
      new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setTimestamp(fmt(environment.updatedAt))
  }, [environment.updatedAt])

  const handleSearch = () => {
    const trimmed = inputValue.trim()
    if (trimmed && trimmed !== location) setLocation(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleGeolocation = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          // Reverse geocode via BigDataCloud or Open-Meteo reverse geocoding endpoint
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          )
          if (res.ok) {
            const data = await res.json()
            const cityName = data.city || data.locality || data.principalSubdivision || 'Delhi'
            setInputValue(cityName)
            setLocation(cityName)
          }
        } catch {
          // fallback to lat,lon string if reverse lookup fails
          const locStr = `${latitude.toFixed(2)},${longitude.toFixed(2)}`
          setInputValue(locStr)
          setLocation(locStr)
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
      },
      { timeout: 8000 },
    )
  }

  const stats: {
    icon: LucideIcon
    value: number
    decimals?: number
    unit: string
    label: string
  }[] = [
    { icon: Thermometer, value: environment.temperatureC, unit: '°', label: 'Temperature' },
    { icon: Droplets, value: environment.humidityPct, unit: '%', label: 'Humidity' },
    { icon: Wind, value: environment.windKph, unit: ' km/h', label: 'Wind' },
    { icon: CloudRain, value: environment.precipitationMm, unit: ' mm', label: 'Precipitation' },
  ]

  return (
    <Section id="environment" className="relative overflow-hidden">
      <AtmosphereBackground intensity={intensity} color={color} className="-z-10 opacity-60" />

      <Reveal>
        <SectionLabel index="03">Your environment</SectionLabel>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-6 max-w-3xl text-balance font-display display-tight text-[clamp(2.25rem,6vw,4.5rem)] font-semibold">
          The atmosphere you&apos;re standing in — right now.
        </h2>
      </Reveal>

      {/* ── Location controls ─────────────────────────────────────────────── */}
      <Reveal delay={0.08}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {/* Text input */}
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              id="location-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search city…"
              className="rounded-xl border border-border bg-surface/30 py-2.5 pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isEnvironmentLoading || isLocating}
            className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
          >
            {isEnvironmentLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Update'
            )}
          </button>

          {/* Browser Geolocation button */}
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={isLocating || isEnvironmentLoading}
            title="Use current location"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface/20 px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-hairline hover:text-foreground disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            ) : (
              <Navigation className="h-4 w-4 text-accent" />
            )}
            <span className="hidden sm:inline">Locate Me</span>
          </button>

          {/* Preset city chips */}
          <div className="flex flex-wrap gap-2">
            {PRESET_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setInputValue(city)
                  setLocation(city)
                }}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  location === city
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-border bg-surface/20 text-muted-foreground hover:border-hairline hover:text-foreground/70',
                )}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── AQI gauge + stats ─────────────────────────────────────────────── */}
      <div className="mt-12 grid items-center gap-14 lg:grid-cols-[auto_1fr]">
        <Reveal className="mx-auto lg:mx-0">
          <AQIGauge aqi={environment.aqi} />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-accent" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {environment.condition}
              </span>
            </div>
            <SourceBadge source={environmentSource} />
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-hairline">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="bg-background">
              <div className="flex h-full flex-col justify-between gap-8 p-8">
                <s.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-display text-5xl font-semibold leading-none sm:text-6xl">
                    <AnimatedNumber value={s.value} decimals={s.decimals ?? 0} />
                    <span className="text-2xl text-muted-foreground">{s.unit}</span>
                  </span>
                  <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Location & loading indicator ──────────────────────────────────── */}
      <Reveal delay={0.1}>
        <div className="mt-8 flex items-center gap-3">
          {isEnvironmentLoading || isLocating ? (
            <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {isLocating ? 'Determining your location…' : `Fetching live data for ${location}…`}
            </span>
          ) : (
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
              ● {environment.location}, {environment.country} ·{' '}
              {timestamp}
            </p>
          )}
        </div>
      </Reveal>
    </Section>
  )
}
