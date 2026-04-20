// Georgia Power residential tariffs — effective January 1, 2025
// Source: georgiapower.com/residential/rate-plans

export const SUMMER_MONTHS = new Set([6, 7, 8, 9]) // June–September

export const MONTHLY_CUSTOMER_CHARGE = 10.82

// Estimated combined rider adder applied to all energy kWh across every plan:
//   FCR-26 (Fuel Cost Recovery): ~$0.04588/kWh
//   ECCR-14 (Environmental Compliance): ~$0.002/kWh
//   DSM-R-15 (Demand Side Management): ~$0.002/kWh
// Municipal franchise fee and local taxes excluded (location-dependent).
export const RIDER_PER_KWH = 0.050

export const PLANS = {
  r30: {
    id: 'r30' as const,
    name: 'Residential Service',
    shortName: 'Standard (R-30)',
    description: 'Traditional tiered plan. Low first-tier rate; higher for heavy summer usage.',
    customerChargePerMonth: MONTHLY_CUSTOMER_CHARGE,
    requiresTOU: false,
    summer: {
      tiers: [
        { upTo: 650, rate: 0.086 },
        { upTo: 1000, rate: 0.143 },
        { upTo: Infinity, rate: 0.148 },
      ],
    },
    winter: { rate: 0.081 },
  },
  prepay: {
    id: 'prepay' as const,
    name: 'PrePay',
    shortName: 'PrePay',
    description: 'No commitment, no monthly service charge. Flat seasonal rates.',
    customerChargePerMonth: 0,
    requiresTOU: false,
    summer: { rate: 0.120 },
    winter: { rate: 0.084 },
  },
  nights_weekends: {
    id: 'nights_weekends' as const,
    name: 'Nights & Weekends',
    shortName: 'Nights & Weekends',
    description: 'Cheap off-peak. Steep on-peak Jun–Sep weekdays 2–7 PM. Ideal if you shift AC usage.',
    customerChargePerMonth: MONTHLY_CUSTOMER_CHARGE,
    requiresTOU: true,
    onPeak: { rate: 0.298 },
    offPeak: { rate: 0.076 },
  },
  smart_usage: {
    id: 'smart_usage' as const,
    name: 'Smart Usage',
    shortName: 'Smart Usage',
    description: 'Extremely cheap off-peak ($0.015). Demand charge — best for smart thermostats + EVs that avoid peak entirely.',
    customerChargePerMonth: MONTHLY_CUSTOMER_CHARGE,
    requiresTOU: true,
    onPeak: { rate: 0.143 },
    offPeak: { rate: 0.015 },
    demandChargePerKW: 12.21,
  },
  overnight_advantage: {
    id: 'overnight_advantage' as const,
    name: 'Overnight Advantage',
    shortName: 'Overnight Advantage',
    description: 'Three-tier TOU. Super cheap overnight ($0.022) — great for EV charging.',
    customerChargePerMonth: MONTHLY_CUSTOMER_CHARGE,
    requiresTOU: true,
    onPeak: { rate: 0.298 },
    offPeak: { rate: 0.102 },
    superOffPeak: { rate: 0.022 },
  },
} as const

// Cobb EMC residential tariffs — effective 2025
// Source: cobbemc.com/rates
// Rates are all-inclusive (no separate fuel cost rider listed)
export const COBB_PLANS = {
  cobb_standard: {
    id: 'cobb_standard' as const,
    name: 'Standard',
    shortName: 'Standard',
    description: 'Tiered seasonal plan. First 1,000 kWh flat; higher rate above 1,000 in summer.',
    customerChargePerMonth: 33.00,
    requiresTOU: false,
    baseRate: 0.083,
    tierThreshold: 1000,
    summerExcessRate: 0.125,
    winterExcessRate: 0.09,
  },
  cobb_fixed: {
    id: 'cobb_fixed' as const,
    name: 'Fixed Rate',
    shortName: 'Fixed Rate',
    description: 'Single flat rate all year. Higher service charge but no usage or seasonal surprises.',
    customerChargePerMonth: 40.00,
    requiresTOU: false,
    rate: 0.0825,
  },
  cobb_niteflex: {
    id: 'cobb_niteflex' as const,
    name: 'NiteFlex',
    shortName: 'NiteFlex',
    description: 'TOU plan. 400 kWh free overnight (midnight–6 AM). Cheap daytime — avoid 1–9 PM.',
    customerChargePerMonth: 33.00,
    requiresTOU: true,
    offPeakRate: 0.075,    // 6 AM–1 PM and 9 PM–midnight
    onPeakRate: 0.14,      // 1 PM–9 PM
    overnightRate: 0.05,   // midnight–6 AM after free kWh
    overnightFreeKWh: 400,
  },
  cobb_smart_choice: {
    id: 'cobb_smart_choice' as const,
    name: 'Smart Choice',
    shortName: 'Smart Choice',
    description: 'Flat rate with demand charge. Peak kW above 3 kW during 2–7 PM on peak days costs $5.95/kW.',
    customerChargePerMonth: 33.00,
    requiresTOU: true,
    rate: 0.075,
    demandFreeKW: 3,
    demandChargePerKW: 5.95,
  },
} as const
