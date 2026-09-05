import type {
  PersonaPreset,
  Persona,
  HealthConditionKey,
  ConditionSeverity,
  ActivityLevel,
  ExposureBlock,
} from '@/types'

/**
 * MOCK DATA — development only.
 * Pre-built personas used across the "Same air, different people" and
 * comparison sections.
 */

/** Helper to create a full Persona with extended fields from shorthand */
function makePersona(opts: {
  ageGroup: Persona['ageGroup']
  healthProfile: Persona['healthProfile']
  lifestyle: Persona['lifestyle']
  conditions?: Array<{ condition: HealthConditionKey; severity: ConditionSeverity }>
  activityLevel?: ActivityLevel
  sensitivityScore?: number
  outdoorBlocks?: Array<'morning' | 'midday' | 'afternoon' | 'evening'>
}): Persona {
  const allBlocks: ExposureBlock[] = [
    { block: 'morning', outdoors: opts.outdoorBlocks?.includes('morning') ?? false },
    { block: 'midday', outdoors: opts.outdoorBlocks?.includes('midday') ?? false },
    { block: 'afternoon', outdoors: opts.outdoorBlocks?.includes('afternoon') ?? false },
    { block: 'evening', outdoors: opts.outdoorBlocks?.includes('evening') ?? false },
  ]

  return {
    ageGroup: opts.ageGroup,
    healthProfile: opts.healthProfile,
    lifestyle: opts.lifestyle,
    healthConditions: opts.conditions ?? (opts.healthProfile === 'none'
      ? [{ condition: 'none', severity: 'mild' as ConditionSeverity }]
      : [{ condition: opts.healthProfile as HealthConditionKey, severity: 'moderate' as ConditionSeverity }]),
    exposureBlocks: allBlocks,
    activityLevel: opts.activityLevel ?? 'moderate',
    sensitivityScore: opts.sensitivityScore ?? 3,
  }
}

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'healthy-adult',
    label: 'Healthy Adult',
    description: 'No known condition, mostly indoors',
    persona: makePersona({
      ageGroup: 'adult',
      healthProfile: 'none',
      lifestyle: 'indoor',
      activityLevel: 'light',
      sensitivityScore: 2,
    }),
  },
  {
    id: 'asthma',
    label: 'Person with Asthma',
    description: 'Respiratory sensitivity, active outdoors',
    persona: makePersona({
      ageGroup: 'adult',
      healthProfile: 'asthma',
      lifestyle: 'active-outdoors',
      conditions: [{ condition: 'asthma', severity: 'moderate' }],
      activityLevel: 'vigorous',
      sensitivityScore: 4,
      outdoorBlocks: ['morning', 'afternoon'],
    }),
  },
  {
    id: 'outdoor-worker',
    label: 'Outdoor Worker',
    description: 'Prolonged outdoor exposure',
    persona: makePersona({
      ageGroup: 'adult',
      healthProfile: 'none',
      lifestyle: 'outdoor-worker',
      activityLevel: 'vigorous',
      sensitivityScore: 3,
      outdoorBlocks: ['morning', 'midday', 'afternoon'],
    }),
  },
  {
    id: 'senior',
    label: 'Older Adult',
    description: 'Increased age-related sensitivity',
    persona: makePersona({
      ageGroup: 'senior',
      healthProfile: 'respiratory',
      lifestyle: 'sedentary',
      conditions: [
        { condition: 'respiratory', severity: 'moderate' },
        { condition: 'heart', severity: 'mild' },
      ],
      activityLevel: 'sedentary',
      sensitivityScore: 4,
    }),
  },
]

/** The default persona used before the visitor configures their own. */
export const DEFAULT_PERSONA: Persona = makePersona({
  ageGroup: 'adult',
  healthProfile: 'asthma',
  lifestyle: 'outdoor-worker',
  conditions: [{ condition: 'asthma', severity: 'moderate' }],
  activityLevel: 'moderate',
  sensitivityScore: 3,
  outdoorBlocks: ['morning', 'midday', 'afternoon'],
})

/* ---- Selectable option catalogs (drive the configurator UI) ---- */

export const AGE_OPTIONS = [
  { value: 'young-adult', label: 'Young Adult', hint: '18–34' },
  { value: 'adult', label: 'Adult', hint: '35–59' },
  { value: 'senior', label: 'Senior', hint: '60+' },
] as const

export const HEALTH_OPTIONS = [
  { value: 'none', label: 'No known condition', hint: 'Baseline sensitivity' },
  { value: 'asthma', label: 'Asthma', hint: 'Airway reactivity' },
  { value: 'heart', label: 'Heart condition', hint: 'Cardiovascular strain' },
  {
    value: 'respiratory',
    label: 'Respiratory sensitivity',
    hint: 'Reduced tolerance',
  },
] as const

export const LIFESTYLE_OPTIONS = [
  { value: 'indoor', label: 'Indoor', hint: 'Low exposure' },
  { value: 'outdoor-worker', label: 'Outdoor worker', hint: 'High exposure' },
  { value: 'active-outdoors', label: 'Active outdoors', hint: 'Elevated intake' },
  { value: 'student', label: 'Student', hint: 'Mixed exposure' },
  { value: 'sedentary', label: 'Mostly sedentary', hint: 'Low exertion' },
] as const

export const HEALTH_CONDITION_OPTIONS = [
  { value: 'none', label: 'None', hint: 'No known conditions', icon: '✓' },
  { value: 'asthma', label: 'Asthma', hint: 'Airway reactivity', icon: '🫁' },
  { value: 'heart', label: 'Heart condition', hint: 'Cardiovascular', icon: '❤️' },
  { value: 'respiratory', label: 'Respiratory', hint: 'Reduced tolerance', icon: '💨' },
  { value: 'allergies', label: 'Allergies', hint: 'Environmental triggers', icon: '🤧' },
  { value: 'diabetes', label: 'Diabetes', hint: 'Metabolic sensitivity', icon: '💉' },
] as const

export const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
] as const

export const ACTIVITY_LEVEL_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', hint: 'Desk work, minimal movement' },
  { value: 'light', label: 'Light', hint: 'Walking, light chores' },
  { value: 'moderate', label: 'Moderate', hint: 'Jogging, cycling' },
  { value: 'vigorous', label: 'Vigorous', hint: 'Running, heavy labor' },
] as const

export const EXPOSURE_BLOCK_OPTIONS = [
  { value: 'morning', label: 'Morning', hint: '6 AM – 11 AM', icon: '🌅' },
  { value: 'midday', label: 'Midday', hint: '11 AM – 2 PM', icon: '☀️' },
  { value: 'afternoon', label: 'Afternoon', hint: '2 PM – 6 PM', icon: '🌤' },
  { value: 'evening', label: 'Evening', hint: '6 PM – 10 PM', icon: '🌆' },
] as const

export const SENSITIVITY_LABELS = ['Very low', 'Low', 'Average', 'High', 'Very high'] as const
