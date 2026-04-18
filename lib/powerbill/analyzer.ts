import type { DailyRecord, BillingPeriod, PlanResult, AnalysisResult, MonthlyPlanCost } from './types'
import { PLANS, SUMMER_MONTHS, RIDER_PER_KWH } from './rates'

function withRider(kWh: number): number { return kWh * RIDER_PER_KWH }

function isSummerMonth(month: number) { return SUMMER_MONTHS.has(month) }
function isWeekday(date: Date) { const d = date.getDay(); return d >= 1 && d <= 5 }

// On-peak window: 2 PM to 7 PM (hours 14–18 inclusive)
function isOnPeakHour(hour: number): boolean { return hour >= 14 && hour <= 18 }

// Super off-peak window: 11 PM to 7 AM (hours 23, 0–6)
function isSuperOffPeakHour(hour: number): boolean { return hour >= 23 || hour <= 6 }

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
  let annual = 0, energyCharge = 0, riderCharge = 0, customerCharge = 0
  for (const p of periods) {
    const energy = p.isSummer
      ? applyTieredRate(p.totalKWh, plan.summer.tiers)
      : p.totalKWh * plan.winter.rate
    const riders = withRider(p.totalKWh)
    const monthlyCustomerCharge = plan.customerChargePerMonth
    const total = energy + riders + monthlyCustomerCharge
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy; riderCharge += riders; customerCharge += monthlyCustomerCharge; annual += total
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
  let annual = 0, energyCharge = 0, riderCharge = 0
  for (const p of periods) {
    const energy = p.totalKWh * (p.isSummer ? plan.summer.rate : plan.winter.rate)
    const riders = withRider(p.totalKWh)
    const total = energy + riders
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy; riderCharge += riders; annual += total
  }
  return {
    planId: 'prepay', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: ['No monthly service charge. Flat $0.120 summer, $0.084 winter.'],
    breakdown: { energyCharge, riderCharge, customerCharge: 0, demandCharge: 0, total: annual },
  }
}

function calcNightsWeekends(periods: BillingPeriod[]): PlanResult {
  const plan = PLANS.nights_weekends
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0, energyCharge = 0, riderCharge = 0, customerCharge = 0
  for (const p of periods) {
    let energy = 0
    for (const day of p.days) {
      const summer = isSummerMonth(day.date.getMonth() + 1)
      const weekday = isWeekday(day.date)
      for (const hr of day.hours) {
        const onPeak = summer && weekday && isOnPeakHour(hr.hour)
        energy += hr.kWh * (onPeak ? plan.onPeak.rate : plan.offPeak.rate)
      }
    }
    const riders = withRider(p.totalKWh)
    const monthlyCustomerCharge = plan.customerChargePerMonth
    const total = energy + riders + monthlyCustomerCharge
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy; riderCharge += riders; customerCharge += monthlyCustomerCharge; annual += total
  }
  return {
    planId: 'nights_weekends', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: [
      'Calculated from actual hourly usage. On-peak (2–7 PM) applies Jun–Sep, Mon–Fri only.',
    ],
    breakdown: { energyCharge, riderCharge, customerCharge, demandCharge: 0, total: annual },
  }
}

function calcSmartUsage(periods: BillingPeriod[]): PlanResult {
  const plan = PLANS.smart_usage
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0, energyCharge = 0, riderCharge = 0, customerCharge = 0, demandCharge = 0
  for (const p of periods) {
    let energy = 0, peakKW = 0
    for (const day of p.days) {
      const summer = isSummerMonth(day.date.getMonth() + 1)
      const weekday = isWeekday(day.date)
      for (const hr of day.hours) {
        const onPeak = summer && weekday && isOnPeakHour(hr.hour)
        energy += hr.kWh * (onPeak ? plan.onPeak.rate : plan.offPeak.rate)
        if (hr.kWh > peakKW) peakKW = hr.kWh
      }
    }
    // Each hourly reading is kWh over 1 hour → kWh = kW for that interval
    const demandCost = peakKW * plan.demandChargePerKW
    const riders = withRider(p.totalKWh)
    const monthlyCustomerCharge = plan.customerChargePerMonth
    const total = energy + riders + demandCost + monthlyCustomerCharge
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy; riderCharge += riders; customerCharge += monthlyCustomerCharge; demandCharge += demandCost; annual += total
  }
  return {
    planId: 'smart_usage', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: [
      'Calculated from actual hourly usage. On-peak (2–7 PM) applies Jun–Sep, Mon–Fri only.',
      'Demand charge ($12.21/kW) based on your actual peak single-hour draw each month.',
    ],
    breakdown: { energyCharge, riderCharge, customerCharge, demandCharge, total: annual },
  }
}

function calcOvernightAdvantage(periods: BillingPeriod[]): PlanResult {
  const plan = PLANS.overnight_advantage
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0, energyCharge = 0, riderCharge = 0, customerCharge = 0
  for (const p of periods) {
    let energy = 0
    for (const day of p.days) {
      const summer = isSummerMonth(day.date.getMonth() + 1)
      const weekday = isWeekday(day.date)
      for (const hr of day.hours) {
        const superOff = isSuperOffPeakHour(hr.hour)
        const onPeak = !superOff && summer && weekday && isOnPeakHour(hr.hour)
        energy += hr.kWh * (superOff ? plan.superOffPeak.rate : onPeak ? plan.onPeak.rate : plan.offPeak.rate)
      }
    }
    const riders = withRider(p.totalKWh)
    const monthlyCustomerCharge = plan.customerChargePerMonth
    const total = energy + riders + monthlyCustomerCharge
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy; riderCharge += riders; customerCharge += monthlyCustomerCharge; annual += total
  }
  return {
    planId: 'overnight_advantage', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: [
      'Calculated from actual hourly usage. Super off-peak ($0.022) is 11 PM–7 AM every day.',
      'On-peak ($0.298) is 2–7 PM Jun–Sep weekdays. Everything else is off-peak ($0.102).',
    ],
    breakdown: { energyCharge, riderCharge, customerCharge, demandCharge: 0, total: annual },
  }
}

export function analyze(records: DailyRecord[], periods: BillingPeriod[]): AnalysisResult {
  const plans: PlanResult[] = [
    calcR30(periods),
    calcPrePay(periods),
    calcNightsWeekends(periods),
    calcSmartUsage(periods),
    calcOvernightAdvantage(periods),
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
