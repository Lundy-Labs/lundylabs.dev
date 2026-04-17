import type { DailyRecord, BillingPeriod, PlanResult, AnalysisResult, MonthlyPlanCost, TOUAssumptions } from './types'
import { PLANS, SUMMER_MONTHS, RIDER_PER_KWH } from './rates'

// Rider adder: flat $/kWh applied to every unit of energy on top of tariff rates.
// Riders are the same across all plans so they don't change the winner, but do
// make absolute cost estimates realistic.
function withRider(kWh: number): number { return kWh * RIDER_PER_KWH }

function isSummerMonth(month: number) { return SUMMER_MONTHS.has(month) }
function isWeekday(date: Date) { const d = date.getDay(); return d >= 1 && d <= 5 }

function applyTieredRate(kWh: number, tiers: ReadonlyArray<{ upTo: number; rate: number }>): number {
  let cost = 0, remaining = kWh, prev = 0
  for (const tier of tiers) {
    if (remaining <= 0) break
    const band = Math.min(remaining, tier.upTo - prev)
    cost += band * tier.rate
    remaining -= band
    prev = tier.upTo
  }
  return cost
}

function periodLabel(p: BillingPeriod): string {
  return p.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function calcR30(periods: BillingPeriod[]): PlanResult {
  const plan = PLANS.r30
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0
  let energyCharge = 0
  let riderCharge = 0
  let customerCharge = 0
  for (const p of periods) {
    const energy = p.isSummer
      ? applyTieredRate(p.totalKWh, plan.summer.tiers)
      : p.totalKWh * plan.winter.rate
    const riders = withRider(p.totalKWh)
    const monthlyCustomerCharge = plan.customerChargePerMonth
    const total = energy + riders + monthlyCustomerCharge
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy
    riderCharge += riders
    customerCharge += monthlyCustomerCharge
    annual += total
  }
  return {
    planId: 'r30', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: ['Tiered summer: first 650 kWh @ $0.086, up to 1,000 @ $0.143, above @ $0.148. Flat $0.081 winter.'],
    breakdown: { energyCharge, riderCharge, customerCharge, demandCharge: 0, total: annual },
  }
}

function calcPrePay(periods: BillingPeriod[]): PlanResult {
  const plan = PLANS.prepay
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0
  let energyCharge = 0
  let riderCharge = 0
  for (const p of periods) {
    const energy = p.totalKWh * (p.isSummer ? plan.summer.rate : plan.winter.rate)
    const riders = withRider(p.totalKWh)
    const total = energy + riders
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy
    riderCharge += riders
    annual += total
  }
  return {
    planId: 'prepay', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: ['No monthly service charge. Flat $0.120 summer, $0.084 winter.'],
    breakdown: { energyCharge, riderCharge, customerCharge: 0, demandCharge: 0, total: annual },
  }
}

function calcNightsWeekends(periods: BillingPeriod[], a: TOUAssumptions): PlanResult {
  const plan = PLANS.nights_weekends
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0
  let energyCharge = 0
  let riderCharge = 0
  let customerCharge = 0
  for (const p of periods) {
    let energy = 0
    for (const day of p.days) {
      const m = day.date.getMonth() + 1
      if (isSummerMonth(m) && isWeekday(day.date)) {
        const peak = day.kWh * (a.summerWeekdayPeakPct / 100)
        energy += peak * plan.onPeak.rate + (day.kWh - peak) * plan.offPeak.rate
      } else {
        energy += day.kWh * plan.offPeak.rate
      }
    }
    const riders = withRider(p.totalKWh)
    const monthlyCustomerCharge = plan.customerChargePerMonth
    const total = energy + riders + monthlyCustomerCharge
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy
    riderCharge += riders
    customerCharge += monthlyCustomerCharge
    annual += total
  }
  return {
    planId: 'nights_weekends', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: true,
    notes: [
      `Assumes ${a.summerWeekdayPeakPct}% of weekday summer usage during on-peak (2–7 PM).`,
      'On-peak applies Jun–Sep, Mon–Fri only.',
    ],
    breakdown: { energyCharge, riderCharge, customerCharge, demandCharge: 0, total: annual },
  }
}

function calcSmartUsage(periods: BillingPeriod[], a: TOUAssumptions): PlanResult {
  const plan = PLANS.smart_usage
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0
  let energyCharge = 0
  let riderCharge = 0
  let customerCharge = 0
  let demandCharge = 0
  for (const p of periods) {
    let energy = 0, maxDay = 0
    for (const day of p.days) {
      if (day.kWh > maxDay) maxDay = day.kWh
      const m = day.date.getMonth() + 1
      if (isSummerMonth(m) && isWeekday(day.date)) {
        const peak = day.kWh * (a.summerWeekdayPeakPct / 100)
        energy += peak * plan.onPeak.rate + (day.kWh - peak) * plan.offPeak.rate
      } else {
        energy += day.kWh * plan.offPeak.rate
      }
    }
    // Demand: estimated from 12% of peak daily kWh → approx peak hourly kW
    const demandCost = maxDay * 0.12 * plan.demandChargePerKW
    const riders = withRider(p.totalKWh)
    const monthlyCustomerCharge = plan.customerChargePerMonth
    const total = energy + riders + demandCost + monthlyCustomerCharge
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy
    riderCharge += riders
    customerCharge += monthlyCustomerCharge
    demandCharge += demandCost
    annual += total
  }
  return {
    planId: 'smart_usage', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: true,
    notes: [
      `Assumes ${a.summerWeekdayPeakPct}% of weekday summer usage during on-peak (2–7 PM).`,
      'Demand charge ($12.21/kW) estimated from peak daily usage — actual depends on your peak hourly draw.',
    ],
    breakdown: { energyCharge, riderCharge, customerCharge, demandCharge, total: annual },
  }
}

function calcOvernightAdvantage(periods: BillingPeriod[], a: TOUAssumptions): PlanResult {
  const plan = PLANS.overnight_advantage
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0
  let energyCharge = 0
  let riderCharge = 0
  let customerCharge = 0
  for (const p of periods) {
    let energy = 0
    for (const day of p.days) {
      const superKWh = day.kWh * (a.superOffPeakPct / 100)
      const remaining = day.kWh - superKWh
      const m = day.date.getMonth() + 1
      if (isSummerMonth(m) && isWeekday(day.date)) {
        const peak = remaining * (a.summerWeekdayPeakPct / 100)
        energy += superKWh * plan.superOffPeak.rate + peak * plan.onPeak.rate + (remaining - peak) * plan.offPeak.rate
      } else {
        energy += superKWh * plan.superOffPeak.rate + remaining * plan.offPeak.rate
      }
    }
    const riders = withRider(p.totalKWh)
    const monthlyCustomerCharge = plan.customerChargePerMonth
    const total = energy + riders + monthlyCustomerCharge
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy
    riderCharge += riders
    customerCharge += monthlyCustomerCharge
    annual += total
  }
  return {
    planId: 'overnight_advantage', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: true,
    notes: [
      `Assumes ${a.superOffPeakPct}% overnight (11 PM–7 AM) and ${a.summerWeekdayPeakPct}% remaining as summer on-peak.`,
      'Super off-peak ($0.022) applies every day 11 PM–7 AM.',
    ],
    breakdown: { energyCharge, riderCharge, customerCharge, demandCharge: 0, total: annual },
  }
}

export function analyze(records: DailyRecord[], periods: BillingPeriod[], assumptions: TOUAssumptions): AnalysisResult {
  const plans: PlanResult[] = [
    calcR30(periods),
    calcPrePay(periods),
    calcNightsWeekends(periods, assumptions),
    calcSmartUsage(periods, assumptions),
    calcOvernightAdvantage(periods, assumptions),
  ]

  const sorted = [...plans].sort((a, b) => a.annualCost - b.annualCost)

  return {
    plans,
    bestPlan: sorted[0].planId,
    worstPlan: sorted[sorted.length - 1].planId,
    annualKWh: records.reduce((s, r) => s + r.kWh, 0),
    avgDailyKWh: records.reduce((s, r) => s + r.kWh, 0) / records.length,
    peakDailyKWh: Math.max(...records.map((r) => r.kWh)),
    monthlyBreakdown: periods.map((p) => ({
      period: periodLabel(p),
      kWh: p.totalKWh,
      isSummer: p.isSummer,
      avgHighTemp: p.days.reduce((s, d) => s + d.highTemp, 0) / p.days.length,
    })),
  }
}
