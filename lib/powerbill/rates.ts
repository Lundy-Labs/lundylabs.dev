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
