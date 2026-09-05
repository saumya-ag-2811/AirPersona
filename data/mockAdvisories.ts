import type { Advisory, HistoryInsight } from '@/types'

/**
 * FALLBACK DATA — used when Gemini API is unavailable.
 * These are deterministic template strings, not AI-generated.
 */

export const FALLBACK_ADVISORY: Advisory = {
  headline: 'What this means for you',
  body: 'Based on current conditions and your profile, we have generated a preliminary assessment. Connect the Gemini API key for a fully personalized, AI-powered advisory.',
  reasoning:
    'This is a template-based assessment derived from the deterministic risk engine. When the AI layer is connected, this section will contain a detailed, plain-English explanation of how your specific health conditions, exposure patterns, and sensitivity level interact with today\'s environmental data to determine your personal risk.',
  reasons: ['Risk engine analysis', 'Profile-weighted factors', 'Environmental conditions'],
  suggestions: [
    'Monitor local air quality updates throughout the day.',
    'Adjust outdoor activity based on your comfort level.',
    'Keep any prescribed relief medication accessible.',
  ],
  disclaimer: 'Not medical advice. For guidance only.',
  source: 'mock',
}

export const FALLBACK_HISTORY_INSIGHT: HistoryInsight = {
  paragraph:
    'Over the past 7 days, air quality has fluctuated with several days exceeding the unhealthy threshold. Connect the Gemini API key for an AI-generated trend analysis personalized to your profile.',
  source: 'mock',
}

export const FALLBACK_ASK_MESSAGE =
  'Live Q&A is currently unavailable — add your Gemini API key to .env to enable personalized follow-up questions with AirPersona.'
