import { AirPersonaProvider } from '@/components/air-persona-provider'
import { Navigation } from '@/components/navigation'
import { HeroSection } from '@/sections/hero-section'
import { SameAirSection } from '@/sections/same-air-section'
import { EnvironmentSection } from '@/sections/environment-section'
import { PersonaSection } from '@/sections/persona-section'
import { TransformationSection } from '@/sections/transformation-section'
import { RiskSection } from '@/sections/risk-section'
import { AdvisorySection } from '@/sections/advisory-section'
import { HistorySection } from '@/sections/history-section'
import { ComparisonSection } from '@/sections/comparison-section'
import { TransparencySection } from '@/sections/transparency-section'
import { FinalSection } from '@/sections/final-section'

export default function Page() {
  return (
    <AirPersonaProvider>
      <Navigation />
      <main className="relative">
        <HeroSection />
        <SameAirSection />
        <EnvironmentSection />
        <PersonaSection />
        <TransformationSection />
        <RiskSection />
        <AdvisorySection />
        <HistorySection />
        <ComparisonSection />
        <TransparencySection />
        <FinalSection />
      </main>
    </AirPersonaProvider>
  )
}
