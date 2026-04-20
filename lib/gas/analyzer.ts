import type {
  GasMonthlyRecord,
  GasBillingPeriod,
  GasPlanResult,
  GasAnalysisResult,
  GasMonthlyPlanCost,
} from './types'
import { GAS_STATES, HEATING_MONTHS } from './rates'

function periodLabel(p: GasBillingPeriod): string {
  return p.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function buildBillingPeriods(records: GasMonthlyRecord[]): GasBillingPeriod[] {
  const periods: GasBillingPeriod[] = []
  for (const r of records) {
    const [yearStr, monthStr] = r.period.split('-')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr) - 1 // 0-indexed
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    const isHeatingMonth = HEATING_MONTHS.has(month + 1) // 1-indexed
    periods.push({ key: r.period, startDate, endDate, therms: r.therms, isHeatingMonth })
  }
  return periods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}

function calcPlan(
  stateId: string,
  planId: string,
  periods: GasBillingPeriod[]
): GasPlanResult {
  const state = GAS_STATES[stateId]
  const plan = state.plans.find((p) => p.id === planId)!

  const monthlyCosts: GasMonthlyPlanCost[] = []
  let commodityCharge = 0
  let distributionCharge = 0
  let customerCharge = 0

  for (const p of periods) {
    const commodity = p.therms * plan.ratePerTherm
    const distribution = p.therms * state.distributionRatePerTherm
    const fixed = plan.monthlyFee + state.distributionMonthlyFee
    const total = commodity + distribution + fixed

    monthlyCosts.push({ period: p.key, cost: total, therms: p.therms })
    commodityCharge += commodity
    distributionCharge += distribution
    customerCharge += fixed
  }

  const annual = commodityCharge + distributionCharge + customerCharge

  return {
    planId: plan.id,
    planName: plan.name,
    shortName: plan.shortName,
    provider: plan.provider,
    annualCost: annual,
    monthlyCosts,
    annualTherms: periods.reduce((s, p) => s + p.therms, 0),
    notes: plan.notes,
    breakdown: { commodityCharge, distributionCharge, customerCharge, total: annual },
    isVariable: plan.isVariable,
    contractMonths: plan.contractMonths,
    promoNote: plan.promoNote,
  }
}

export function analyze(
  stateId: string,
  records: GasMonthlyRecord[],
  periods: GasBillingPeriod[]
): GasAnalysisResult {
  const state = GAS_STATES[stateId]
  const plans: GasPlanResult[] = state.plans.map((plan) =>
    calcPlan(stateId, plan.id, periods)
  )

  const sorted = [...plans].sort((a, b) => a.annualCost - b.annualCost)

  const allTherms = records.map((r) => r.therms)
  const annualTherms = allTherms.reduce((s, t) => s + t, 0)

  return {
    plans,
    bestPlan: sorted[0].planId,
    worstPlan: sorted[sorted.length - 1].planId,
    annualTherms,
    avgMonthlyTherms: annualTherms / records.length,
    peakMonthTherms: Math.max(...allTherms),
    monthlyBreakdown: periods.map((p) => ({
      period: periodLabel(p),
      therms: p.therms,
      isHeatingMonth: p.isHeatingMonth,
    })),
  }
}
