// Atlanta, GA monthly peak sun hours (kWh/kW/day)
export const ATLANTA_PEAK_SUN_HOURS: Record<number, number> = {
  1: 3.5, 2: 4.0, 3: 4.8, 4: 5.3, 5: 5.5, 6: 5.3,
  7: 5.0, 8: 5.2, 9: 4.8, 10: 4.5, 11: 3.8, 12: 3.3,
}

export const SOLAR_PERFORMANCE_RATIO = 0.80

// Federal Investment Tax Credit (ITC) — 30% as of 2025 (IRA)
export const FEDERAL_ITC = 0.30

// Georgia Power Renewable Energy Buyback rate for exported solar
export const NET_METERING_RATE_PER_KWH = 0.02988

// Tesla Powerwall 3 specs
export const POWERWALL = {
  capacityKWh: 13.5,
  roundTripEff: 0.90,
  maxChargeKW: 11.5,
  costInstalled: 11_500,
}

export const DEFAULT_COST_PER_WATT = 2.80

// Approximate sunrise/sunset hours for Atlanta by month: [sunrise, sunset]
export const DAYLIGHT_HOURS: Record<number, [number, number]> = {
  1: [7, 18], 2: [7, 18], 3: [7, 19], 4: [7, 20],
  5: [6, 20], 6: [6, 21], 7: [6, 21], 8: [6, 20],
  9: [7, 20], 10: [7, 19], 11: [7, 18], 12: [7, 17],
}

export const PLAN_IDS = ['r30', 'prepay', 'nights_weekends', 'smart_usage', 'overnight_advantage'] as const
