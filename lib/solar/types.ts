import type { PlanId } from '../powerbill/types'

export interface SolarConfig {
  systemKW: number
  costPerWatt: number
}

export interface BatteryConfig {
  count: number       // 1 or 2
  capacityKWh: number // 13.5 per Powerwall 3
  roundTripEff: number
  costEach: number
}

export type SolarScenario = 'solar_only' | 'battery_only' | 'solar_battery'

export interface ScenarioROI {
  scenario: SolarScenario
  bestPlanId: PlanId
  bestPlanName: string
  baselineAnnualCost: number
  newAnnualCost: number
  annualSavings: number
  installCostGross: number
  federalITC: number
  installCostNet: number
  simplePaybackYears: number
  npv20yr: number
  annualNetMeteringCredit: number
  savingsByPlan: Record<PlanId, number>
  newCostByPlan: Record<PlanId, number>
}

export interface SolarAnalysisResult {
  scenarios: ScenarioROI[]
  recommendation: SolarScenario | 'none'
}
