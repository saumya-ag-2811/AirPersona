import type { HistoricalDay } from '@/types'

/**
 * MOCK DATA — development only.
 * Last 7 days of environmental readings. Production will supply the same
 * `HistoricalDay[]` shape from a historical AQI/weather feed.
 */
export const MOCK_HISTORY: HistoricalDay[] = [
  {
    date: '2026-08-30',
    label: 'Sun',
    aqi: 92,
    temperatureC: 31,
    level: 'MODERATE',
    note: 'Overnight rain briefly cleared particulates.',
  },
  {
    date: '2026-08-31',
    label: 'Mon',
    aqi: 138,
    temperatureC: 33,
    level: 'ELEVATED',
    note: 'Stagnant air let PM2.5 accumulate through the day.',
  },
  {
    date: '2026-09-01',
    label: 'Tue',
    aqi: 164,
    temperatureC: 34,
    level: 'HIGH',
    note: 'Morning haze reduced visibility across the city.',
  },
  {
    date: '2026-09-02',
    label: 'Wed',
    aqi: 201,
    temperatureC: 35,
    level: 'HIGH',
    note: 'Peak of the week — sensitive groups strongly affected.',
  },
  {
    date: '2026-09-03',
    label: 'Thu',
    aqi: 178,
    temperatureC: 34,
    level: 'HIGH',
    note: 'Elevated levels persisted with light winds.',
  },
  {
    date: '2026-09-04',
    label: 'Fri',
    aqi: 149,
    temperatureC: 33,
    level: 'ELEVATED',
    note: 'A weak breeze began dispersing the haze.',
  },
  {
    date: '2026-09-05',
    label: 'Sat',
    aqi: 186,
    temperatureC: 34,
    level: 'HIGH',
    note: 'Today — haze returned as winds died down.',
  },
]
