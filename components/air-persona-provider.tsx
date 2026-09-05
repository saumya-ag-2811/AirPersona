'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Advisory,
  AqiSource,
  EnvironmentData,
  HistoricalDay,
  HistoryInsight,
  Persona,
  RiskAssessment,
  SavedProfile,
} from '@/types'
import { DEFAULT_PERSONA } from '@/data/mockPersonas'
import { getCurrentEnvironment, getHistory, fetchCurrentEnvironment, fetchHistory } from '@/services/environmentService'
import { assessRisk } from '@/services/riskService'
import { generateAdvisory, fetchAdvisory, fetchHistoryInsight } from '@/services/advisoryService'

// ─── Context shape ────────────────────────────────────────────────────────────
interface AirPersonaContextValue {
  // Environment
  environment: EnvironmentData
  environmentSource: AqiSource
  isEnvironmentLoading: boolean

  // Location
  location: string
  setLocation: (loc: string) => void

  // Persona
  persona: Persona
  setPersona: (p: Persona) => void
  updatePersona: (patch: Partial<Persona>) => void

  // Risk assessment (deterministic — never AI)
  assessment: RiskAssessment

  // AI advisory
  advisory: Advisory
  isAdvisoryLoading: boolean

  // Historical data
  history: HistoricalDay[]
  historySource: string

  // AI history insight
  historyInsight: HistoryInsight
  isInsightLoading: boolean

  // Saved profiles (persisted to localStorage)
  savedProfiles: SavedProfile[]
  saveProfile: (name: string) => void
  deleteProfile: (id: string) => void
}

// ─── Context instance ─────────────────────────────────────────────────────────
const AirPersonaContext = createContext<AirPersonaContextValue | null>(null)

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = 'airpersona-saved-profiles'

function loadProfiles(): SavedProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedProfile[]) : []
  } catch {
    return []
  }
}

function persistProfiles(profiles: SavedProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  } catch {
    // storage not available — fail silently
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AirPersonaProvider({ children }: { children: ReactNode }) {
  // ── Initialise from synchronous mock data so the page hydrates instantly ──
  const [environment, setEnvironment] = useState<EnvironmentData>(() => getCurrentEnvironment())
  const [environmentSource, setEnvironmentSource] = useState<AqiSource>('mock')
  const [isEnvironmentLoading, setIsEnvironmentLoading] = useState(false)

  const [location, setLocation] = useState('Delhi')

  const [persona, setPersona] = useState<Persona>(DEFAULT_PERSONA)

  const updatePersona = useCallback(
    (patch: Partial<Persona>) => setPersona((prev) => ({ ...prev, ...patch })),
    [],
  )

  const [history, setHistory] = useState<HistoricalDay[]>(() => getHistory())
  const [historySource, setHistorySource] = useState('mock')

  const [advisory, setAdvisory] = useState<Advisory>(() =>
    generateAdvisory(getCurrentEnvironment(), DEFAULT_PERSONA, assessRisk(getCurrentEnvironment(), DEFAULT_PERSONA)),
  )
  const [isAdvisoryLoading, setIsAdvisoryLoading] = useState(false)

  const [historyInsight, setHistoryInsight] = useState<HistoryInsight>({
    paragraph: 'Synthesising weekly air quality trend…',
    source: 'fallback',
  })
  const [isInsightLoading, setIsInsightLoading] = useState(false)

  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>(() => {
    // Safe to call in useState initialiser on client; provider is 'use client'
    if (typeof window !== 'undefined') return loadProfiles()
    return []
  })

  // ── Derived ───────────────────────────────────────────────────────────────
  const assessment = useMemo(() => assessRisk(environment, persona), [environment, persona])

  // ── Effect: fetch live environment whenever location changes ─────────────
  useEffect(() => {
    let cancelled = false
    setIsEnvironmentLoading(true)

    fetchCurrentEnvironment(location).then(({ data, source }) => {
      if (cancelled) return
      setEnvironment(data)
      setEnvironmentSource(source)
      setIsEnvironmentLoading(false)

      // Fetch history coordinates from the new environment data — best-effort
      // (no lat/lon in EnvironmentData — fall back to mock history endpoint)
      fetchHistory().then(({ data: histData, source: histSource }) => {
        if (cancelled) return
        setHistory(histData)
        setHistorySource(histSource)
      })
    })

    return () => {
      cancelled = true
    }
  }, [location])

  // ── Effect: fetch AI advisory whenever environment OR persona changes ─────
  useEffect(() => {
    let cancelled = false
    setIsAdvisoryLoading(true)

    fetchAdvisory(environment, persona, assessment).then((adv) => {
      if (cancelled) return
      setAdvisory(adv)
      setIsAdvisoryLoading(false)
    })

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, persona])

  // ── Effect: fetch history insight whenever history or persona changes ─────
  useEffect(() => {
    let cancelled = false
    setIsInsightLoading(true)

    fetchHistoryInsight(history, persona).then((insight) => {
      if (cancelled) return
      setHistoryInsight(insight)
      setIsInsightLoading(false)
    })

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, persona])

  // ── Profile management ────────────────────────────────────────────────────
  const saveProfile = useCallback(
    (name: string) => {
      const profile: SavedProfile = {
        id: `profile-${Date.now()}`,
        name: name.trim() || `Profile ${Date.now()}`,
        persona,
        createdAt: new Date().toISOString(),
      }
      setSavedProfiles((prev) => {
        const updated = [...prev, profile]
        persistProfiles(updated)
        return updated
      })
    },
    [persona],
  )

  const deleteProfile = useCallback((id: string) => {
    setSavedProfiles((prev) => {
      const updated = prev.filter((p) => p.id !== id)
      persistProfiles(updated)
      return updated
    })
  }, [])

  // ── Context value (stable reference via useMemo) ──────────────────────────
  const value = useMemo<AirPersonaContextValue>(
    () => ({
      environment,
      environmentSource,
      isEnvironmentLoading,
      location,
      setLocation,
      persona,
      setPersona,
      updatePersona,
      assessment,
      advisory,
      isAdvisoryLoading,
      history,
      historySource,
      historyInsight,
      isInsightLoading,
      savedProfiles,
      saveProfile,
      deleteProfile,
    }),
    [
      environment,
      environmentSource,
      isEnvironmentLoading,
      location,
      persona,
      assessment,
      advisory,
      isAdvisoryLoading,
      history,
      historySource,
      historyInsight,
      isInsightLoading,
      savedProfiles,
      saveProfile,
      deleteProfile,
    ],
  )

  return <AirPersonaContext.Provider value={value}>{children}</AirPersonaContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAirPersona() {
  const ctx = useContext(AirPersonaContext)
  if (!ctx) throw new Error('useAirPersona must be used within AirPersonaProvider')
  return ctx
}
