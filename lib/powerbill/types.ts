export interface DailyRecord {
  billPeriod: string
  date: Date
  kWh: number
  highTemp: number
  lowTemp: number
}

export interface BillingPeriod {
  key: string
  startDate: Date
  endDate: Date
  days: DailyRecord[]
  totalKWh: number
  isSummer: boolean
}

export type PlanId = 'r30' | 'prepay' | 'nights_weekends' | 'smart_usage' | 'overnight_advantage'

export interface PlanResult {
  planId: PlanId
  planName: string
  annualCost: number
  monthlyCosts: MonthlyPlanCost[]
  annualKWh: number
  requiresTOUAssumption: boolean
  notes: string[]
  breakdown: PlanCostBreakdown
}

export interface MonthlyPlanCost {
  billPeriod: string
  cost: number
  kWh: number
}

export interface PlanCostBreakdown {
  energyCharge: number
  riderCharge: number
  customerCharge: number
  demandCharge: number
  total: number
}

export interface AnalysisResult {
  plans: PlanResult[]
  bestPlan: PlanId
  worstPlan: PlanId
  annualKWh: number
  avgDailyKWh: number
  peakDailyKWh: number
  monthlyBreakdown: BillingPeriodSummary[]
}

export interface BillingPeriodSummary {
  period: string
  kWh: number
  isSummer: boolean
  avgHighTemp: number
}

export interface TOUAssumptions {
  summerWeekdayPeakPct: number
  superOffPeakPct: number
}
