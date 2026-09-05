'use client'

import { useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { AnimatePresence, motion } from 'motion/react'
import type { HistoricalDay } from '@/types'
import { aqiColor } from '@/lib/airTheme'
import { riskVisual } from '@/lib/airTheme'
import { RiskLevelTag } from '@/components/risk-display'

export function HistoricalChart({ data }: { data: HistoricalDay[] }) {
  const [active, setActive] = useState<HistoricalDay>(data[data.length - 1])

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="min-w-0">
        <div className="h-[300px] w-full sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 8, left: -20, bottom: 0 }}
              onMouseMove={(state) => {
                const idx = state?.activeTooltipIndex
                if (typeof idx === 'number' && data[idx]) setActive(data[idx])
              }}
            >
              <defs>
                <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fontFamily: 'var(--font-mono, monospace)' }}
              />
              <YAxis
                domain={[0, 240]}
                stroke="var(--muted-foreground)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fontFamily: 'var(--font-mono, monospace)' }}
                width={48}
              />
              <ReferenceLine
                y={150}
                stroke="var(--risk-elevated)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
              <Tooltip
                cursor={{ stroke: 'var(--hairline)', strokeWidth: 1 }}
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fill="url(#aqiFill)"
                dot={{ r: 3, fill: 'var(--background)', stroke: 'var(--accent)' }}
                activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--background)' }}
                animationDuration={1400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 pl-8 font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
          Dashed line = unhealthy threshold (AQI 150)
        </p>
      </div>

      {/* Detail panel for hovered/selected day */}
      <div className="rounded-2xl border border-border bg-surface/40 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {new Date(active.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <RiskLevelTag level={active.level} />
            </div>
            <div className="mt-6 flex items-end gap-8">
              <div>
                <span
                  className="font-display text-5xl font-semibold leading-none"
                  style={{ color: aqiColor(active.aqi) }}
                >
                  {active.aqi}
                </span>
                <span className="ml-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  AQI
                </span>
              </div>
              <div>
                <span className="font-display text-3xl font-semibold leading-none">
                  {active.temperatureC}°
                </span>
                <span className="ml-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  temp
                </span>
              </div>
            </div>
            <p className="mt-6 text-pretty text-sm leading-relaxed text-muted-foreground">
              {active.note}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as HistoricalDay
  const v = riskVisual(d.level)
  return (
    <div className="rounded-lg border border-hairline bg-background/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {d.label}
      </p>
      <p className="font-display text-lg font-semibold" style={{ color: v.color }}>
        AQI {d.aqi}
      </p>
      <p className="text-xs text-muted-foreground">
        {d.temperatureC}° · {v.label} risk
      </p>
    </div>
  )
}
