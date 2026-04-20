import type { DailyRecord, BillingPeriod, PlanResult, AnalysisResult, MonthlyPlanCost, ProviderId } from './types'
import { PLANS, SUMMER_MONTHS, RIDER_PER_KWH, COBB_PLANS } from './rates'

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

export function calcR30(periods: BillingPeriod[]): PlanResult {
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

export function calcPrePay(periods: BillingPeriod[]): PlanResult {
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

export function calcNightsWeekends(periods: BillingPeriod[]): PlanResult {
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

export function calcSmartUsage(periods: BillingPeriod[]): PlanResult {
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

export function calcOvernightAdvantage(periods: BillingPeriod[]): PlanResult {
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

// NiteFlex TOU helpers (Cobb EMC)
function isNiteFlexOvernight(hour: number): boolean { return hour < 6 }
function isNiteFlexOnPeak(hour: number): boolean { return hour >= 13 && hour <= 20 }

export function calcCobbStandard(periods: BillingPeriod[]): PlanResult {
  const plan = COBB_PLANS.cobb_standard
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0, energyCharge = 0, customerCharge = 0
  for (const p of periods) {
    const tier1 = Math.min(p.totalKWh, plan.tierThreshold) * plan.baseRate
    const excess = Math.max(0, p.totalKWh - plan.tierThreshold)
    const energy = tier1 + excess * (p.isSummer ? plan.summerExcessRate : plan.winterExcessRate)
    const cc = plan.customerChargePerMonth
    const total = energy + cc
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy; customerCharge += cc; annual += total
  }
  return {
    planId: 'cobb_standard', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: ['First 1,000 kWh @ $0.083. Excess: $0.090 winter, $0.125 summer. Rates all-inclusive.'],
    breakdown: { energyCharge, riderCharge: 0, customerCharge, demandCharge: 0, total: annual },
  }
}

export function calcCobbFixed(periods: BillingPeriod[]): PlanResult {
  const plan = COBB_PLANS.cobb_fixed
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0, energyCharge = 0, customerCharge = 0
  for (const p of periods) {
    const energy = p.totalKWh * plan.rate
    const cc = plan.customerChargePerMonth
    const total = energy + cc
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy; customerCharge += cc; annual += total
  }
  return {
    planId: 'cobb_fixed', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: ['Flat $0.0825/kWh all year. $40/month service charge. Rate all-inclusive.'],
    breakdown: { energyCharge, riderCharge: 0, customerCharge, demandCharge: 0, total: annual },
  }
}

export function calcCobbNiteFlex(periods: BillingPeriod[]): PlanResult {
  const plan = COBB_PLANS.cobb_niteflex
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0, energyCharge = 0, customerCharge = 0
  for (const p of periods) {
    let onPeakKWh = 0, offPeakKWh = 0, overnightKWh = 0
    for (const day of p.days) {
      for (const hr of day.hours) {
        if (isNiteFlexOvernight(hr.hour)) overnightKWh += hr.kWh
        else if (isNiteFlexOnPeak(hr.hour)) onPeakKWh += hr.kWh
        else offPeakKWh += hr.kWh
      }
    }
    const chargeableOvernight = Math.max(0, overnightKWh - plan.overnightFreeKWh)
    const energy = onPeakKWh * plan.onPeakRate
      + offPeakKWh * plan.offPeakRate
      + chargeableOvernight * plan.overnightRate
    const cc = plan.customerChargePerMonth
    const total = energy + cc
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy; customerCharge += cc; annual += total
  }
  return {
    planId: 'cobb_niteflex', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: [
      'Calculated from actual hourly usage.',
      'On-peak (1–9 PM): $0.14. Off-peak (6 AM–1 PM, 9 PM–midnight): $0.075.',
      'Overnight (midnight–6 AM): first 400 kWh/month free, then $0.05.',
    ],
    breakdown: { energyCharge, riderCharge: 0, customerCharge, demandCharge: 0, total: annual },
  }
}

export function calcCobbSmartChoice(periods: BillingPeriod[]): PlanResult {
  const plan = COBB_PLANS.cobb_smart_choice
  const monthlyCosts: MonthlyPlanCost[] = []
  let annual = 0, energyCharge = 0, customerCharge = 0, demandCharge = 0
  for (const p of periods) {
    const energy = p.totalKWh * plan.rate
    let peakKW = 0
    for (const day of p.days) {
      for (const hr of day.hours) {
        if (isOnPeakHour(hr.hour) && hr.kWh > peakKW) peakKW = hr.kWh
      }
    }
    const demandCost = Math.max(0, peakKW - plan.demandFreeKW) * plan.demandChargePerKW
    const cc = plan.customerChargePerMonth
    const total = energy + demandCost + cc
    monthlyCosts.push({ billPeriod: p.key, cost: total, kWh: p.totalKWh })
    energyCharge += energy; customerCharge += cc; demandCharge += demandCost; annual += total
  }
  return {
    planId: 'cobb_smart_choice', planName: plan.name, annualCost: annual, monthlyCosts,
    annualKWh: periods.reduce((s, p) => s + p.totalKWh, 0),
    requiresTOUAssumption: false,
    notes: [
      'Flat $0.075/kWh. Demand charge ($5.95/kW) on peak draw above 3 kW during 2–7 PM on Energy Saving Peak Days.',
      'Demand estimated from your highest single-hour draw during 2–7 PM — actual peak days are utility-designated.',
    ],
    breakdown: { energyCharge, riderCharge: 0, customerCharge, demandCharge, total: annual },
  }
}

export function analyze(records: DailyRecord[], periods: BillingPeriod[], provider: ProviderId = 'georgia_power'): AnalysisResult {
  const plans: PlanResult[] = provider === 'cobb_emc'
    ? [calcCobbStandard(periods), calcCobbFixed(periods), calcCobbNiteFlex(periods), calcCobbSmartChoice(periods)]
    : [calcR30(periods), calcPrePay(periods), calcNightsWeekends(periods), calcSmartUsage(periods), calcOvernightAdvantage(periods)]

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
