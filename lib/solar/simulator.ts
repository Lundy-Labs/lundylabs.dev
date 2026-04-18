import type { BillingPeriod } from '../powerbill/types'
import type { SolarConfig, BatteryConfig } from './types'
import { POWERWALL } from './constants'
import { solarOutputKWh } from './generator'

export interface SimulationOutput {
  modifiedPeriods: BillingPeriod[]
  totalExportKWh: number
}

export function runSimulation(
  periods: BillingPeriod[],
  solar: SolarConfig | null,
  battery: BatteryConfig | null,
): SimulationOutput {
  if (!solar && !battery) {
    return { modifiedPeriods: periods, totalExportKWh: 0 }
  }

  const maxSoC = battery ? battery.count * POWERWALL.capacityKWh : 0
  const rtEff = battery ? battery.roundTripEff : 1
  const maxChargePerHour = battery ? battery.count * POWERWALL.maxChargeKW : 0
  let soc = maxSoC * 0.5

  let totalExportKWh = 0
  // key: "YYYY-MM-DD_H" → net grid kWh for that hour
  const netGridMap = new Map<string, number>()

  // Process all days chronologically
  const allDays = periods
    .flatMap(p => p.days)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  for (const day of allDays) {
    const month = day.date.getMonth() + 1
    const dateStr = day.date.toISOString().slice(0, 10)

    for (const hr of day.hours) {
      const h = hr.hour
      const homeLoad = Math.max(0, hr.kWh)
      const solarGen = solar ? solarOutputKWh(solar.systemKW, month, h) : 0

      // Charge window: 11 PM–7 AM (super off-peak for Overnight Advantage)
      const isChargeWindow = h === 23 || h <= 6
      // Discharge window: 2 PM–9 PM (covers on-peak 2–7 PM + early evening)
      const isDischargeWindow = h >= 14 && h <= 21

      let gridDraw = homeLoad
      let exported = 0

      // 1. Solar covers home load first
      const solarToHome = Math.min(solarGen, homeLoad)
      gridDraw -= solarToHome
      const solarSurplus = solarGen - solarToHome

      // 2. Solar surplus charges battery
      if (battery && solarSurplus > 0) {
        const spaceInBattery = maxSoC - soc
        // How much solar can we absorb? (input × rtEff = stored)
        const solarInput = Math.min(solarSurplus, spaceInBattery / rtEff, maxChargePerHour)
        soc = Math.min(maxSoC, soc + solarInput * rtEff)
        exported = solarSurplus - solarInput
      } else if (solarSurplus > 0) {
        exported = solarSurplus
      }

      // 3. Discharge battery during discharge window
      if (battery && gridDraw > 0 && isDischargeWindow) {
        const discharge = Math.min(gridDraw, soc)
        soc -= discharge
        gridDraw -= discharge
      }

      // 4. Grid-charge battery during cheap overnight window
      if (battery && isChargeWindow && soc < maxSoC * 0.95) {
        const spaceInBattery = maxSoC - soc
        const gridInput = Math.min(spaceInBattery / rtEff, maxChargePerHour)
        soc = Math.min(maxSoC, soc + gridInput * rtEff)
        gridDraw += gridInput
      }

      netGridMap.set(`${dateStr}_${h}`, Math.max(0, gridDraw))
      totalExportKWh += exported
    }
  }

  // Rebuild periods with modified hourly kWh
  const modifiedPeriods = periods.map(period => {
    const modifiedDays = period.days.map(day => {
      const dateStr = day.date.toISOString().slice(0, 10)
      const modifiedHours = day.hours.map(hr => {
        const net = netGridMap.get(`${dateStr}_${hr.hour}`) ?? hr.kWh
        return { ...hr, kWh: net }
      })
      return { ...day, hours: modifiedHours, kWh: modifiedHours.reduce((s, h) => s + h.kWh, 0) }
    })
    return { ...period, days: modifiedDays, totalKWh: modifiedDays.reduce((s, d) => s + d.kWh, 0) }
  })

  return { modifiedPeriods, totalExportKWh }
}
