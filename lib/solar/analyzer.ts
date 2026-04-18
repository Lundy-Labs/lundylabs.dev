import type { BillingPeriod, AnalysisResult, PlanId } from '../powerbill/types'
import { calcR30, calcPrePay, calcNightsWeekends, calcSmartUsage, calcOvernightAdvantage } from '../powerbill/analyzer'
import { runSimulation } from './simulator'
import { FEDERAL_ITC, NET_METERING_RATE_PER_KWH, PLAN_IDS } from './constants'
import type { SolarConfig, BatteryConfig, SolarScenario, ScenarioROI, SolarAnalysisResult } from './types'

function installCosts(solar: SolarConfig | null, battery: BatteryConfig | null) {
  let gross = 0
  if (solar) gross += solar.systemKW * 1000 * solar.costPerWatt
  if (battery) gross += battery.costEach * battery.count
  const itc = gross * FEDERAL_ITC
  return { gross, itc, net: gross - itc }
}

function calcNPV(annualSavings: number, netCost: number, years = 20, rate = 0.06): number {
  let pv = 0
  for (let y = 1; y <= years; y++) pv += annualSavings / Math.pow(1 + rate, y)
  return pv - netCost
}

function runAllPlans(periods: BillingPeriod[]) {
  return [
    calcR30(periods),
    calcPrePay(periods),
    calcNightsWeekends(periods),
    calcSmartUsage(periods),
    calcOvernightAdvantage(periods),
  ]
}

export function analyzeAllScenarios(
  periods: BillingPeriod[],
  baseline: AnalysisResult,
  solarConfig: SolarConfig,
  batteryConfig: BatteryConfig,
): SolarAnalysisResult {
  const baselineCostByPlan = Object.fromEntries(
    baseline.plans.map(p => [p.planId, p.annualCost])
  ) as Record<PlanId, number>

  const SCENARIOS: Array<{ scenario: SolarScenario; solar: SolarConfig | null; battery: BatteryConfig | null }> = [
    { scenario: 'solar_only', solar: solarConfig, battery: null },
    { scenario: 'battery_only', solar: null, battery: batteryConfig },
    { scenario: 'solar_battery', solar: solarConfig, battery: batteryConfig },
  ]

  const results: ScenarioROI[] = SCENARIOS.map(({ scenario, solar, battery }) => {
    const { modifiedPeriods, totalExportKWh } = runSimulation(periods, solar, battery)
    const modifiedPlans = runAllPlans(modifiedPeriods)
    const annualNetMeteringCredit = totalExportKWh * NET_METERING_RATE_PER_KWH

    const savingsByPlan = {} as Record<PlanId, number>
    const newCostByPlan = {} as Record<PlanId, number>

    for (const plan of modifiedPlans) {
      const newCost = plan.annualCost - annualNetMeteringCredit
      newCostByPlan[plan.planId] = newCost
      savingsByPlan[plan.planId] = baselineCostByPlan[plan.planId] - newCost
    }

    // Best plan = lowest new annual cost
    const bestPlanId = (PLAN_IDS as readonly PlanId[]).reduce((best, id) =>
      newCostByPlan[id] < newCostByPlan[best] ? id : best
    )
    const bestPlan = modifiedPlans.find(p => p.planId === bestPlanId)!

    const costs = installCosts(solar, battery)
    const annualSavings = savingsByPlan[bestPlanId]
    const simplePaybackYears = annualSavings > 0 ? costs.net / annualSavings : Infinity

    return {
      scenario,
      bestPlanId,
      bestPlanName: bestPlan.planName,
      baselineAnnualCost: baselineCostByPlan[bestPlanId],
      newAnnualCost: newCostByPlan[bestPlanId],
      annualSavings,
      installCostGross: costs.gross,
      federalITC: costs.itc,
      installCostNet: costs.net,
      simplePaybackYears,
      npv20yr: calcNPV(annualSavings, costs.net),
      annualNetMeteringCredit,
      savingsByPlan,
      newCostByPlan,
    }
  })

  const bestByNpv = results.reduce((best, r) => r.npv20yr > best.npv20yr ? r : best)
  const recommendation = bestByNpv.npv20yr > 0 ? bestByNpv.scenario : 'none'

  return { scenarios: results, recommendation }
}
