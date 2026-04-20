export interface GasMonthlyRecord {
  period: string // "YYYY-MM"
  therms: number
  date: Date
}

export type GasPlanId = string

export interface GasPlanDef {
  id: GasPlanId
  name: string
  shortName: string
  provider: string
  description: string
  ratePerTherm: number      // commodity rate only (marketer's charge)
  monthlyFee: number        // marketer's monthly service/customer charge
  isVariable: boolean
  contractMonths: number    // 0 = month-to-month
  notes: string[]
  promoNote?: string        // optional promotional event text
}

export interface GasStateDef {
  id: string
  name: string
  plans: GasPlanDef[]
  distributionRatePerTherm: number  // utility delivery charge (same for all plans in state)
  distributionMonthlyFee: number    // utility base charge (same for all)
  distributionLabel: string         // e.g. "Atlanta Gas Light (AGL) distribution"
  isDeregulated: boolean            // GA = true; FL/TN/NC = false
  uploadInstructions: string[]
  csvFormat: string                 // brief description of expected CSV format
  rateDate: string                  // "January 2025"
  rateSource: string
}

export interface GasBillingPeriod {
  key: string       // "YYYY-MM"
  startDate: Date
  endDate: Date
  therms: number
  isHeatingMonth: boolean  // Nov–Mar
}

export interface GasPlanResult {
  planId: GasPlanId
  planName: string
  shortName: string
  provider: string
  annualCost: number
  monthlyCosts: GasMonthlyPlanCost[]
  annualTherms: number
  notes: string[]
  breakdown: GasPlanBreakdown
  isVariable: boolean
  contractMonths: number
  promoNote?: string
}

export interface GasMonthlyPlanCost {
  period: string
  cost: number
  therms: number
}

export interface GasPlanBreakdown {
  commodityCharge: number
  distributionCharge: number
  customerCharge: number   // marketer fee + distribution base fee combined
  total: number
}

export interface GasAnalysisResult {
  plans: GasPlanResult[]
  bestPlan: GasPlanId
  worstPlan: GasPlanId
  annualTherms: number
  avgMonthlyTherms: number
  peakMonthTherms: number
  monthlyBreakdown: GasPeriodSummary[]
}

export interface GasPeriodSummary {
  period: string
  therms: number
  isHeatingMonth: boolean
}
