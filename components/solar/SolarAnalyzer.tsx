'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { BillingPeriod, AnalysisResult, PlanId } from '@/lib/powerbill/types'
import { analyzeAllScenarios } from '@/lib/solar/analyzer'
import { DEFAULT_COST_PER_WATT, POWERWALL, PLAN_IDS } from '@/lib/solar/constants'
import type { SolarConfig, BatteryConfig, SolarScenario, ScenarioROI } from '@/lib/solar/types'
import ScenarioCard from './ScenarioCard'

const PaybackChart = dynamic(() => import('./PaybackChart'), { ssr: false })

const SYSTEM_SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20]
const BATTERY_COUNTS = [1, 2]
const AVG_ATLANTA_PSH = 4.6 // annual average peak sun hours

function calcRecommendedKW(annualKWh: number): number {
  // Size for ~80% annual offset (aligns with Tesla's typical system sizing)
  const raw = (annualKWh * 0.80) / (AVG_ATLANTA_PSH * 365 * 0.80)
  // Round up to nearest 2 kW, clamp to available sizes
  const rounded = Math.ceil(raw / 2) * 2
  return Math.min(Math.max(4, rounded), 20)
}

function calcAnnualGenKWh(systemKW: number): number {
  return systemKW * AVG_ATLANTA_PSH * 365 * 0.80
}

const PLAN_LABELS: Record<PlanId, string> = {
  r30: 'Standard (R-30)',
  prepay: 'PrePay',
  nights_weekends: 'Nights & Weekends',
  smart_usage: 'Smart Usage',
  overnight_advantage: 'Overnight Advantage',
  cobb_standard: 'Standard',
  cobb_fixed: 'Fixed Rate',
  cobb_niteflex: 'NiteFlex',
  cobb_smart_choice: 'Smart Choice',
}

const SCENARIO_LABELS: Record<SolarScenario, string> = {
  solar_only: 'Solar Only',
  battery_only: 'Battery Only',
  solar_battery: 'Solar + Battery',
}

interface Props {
  periods: BillingPeriod[]
  baselineResult: AnalysisResult
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function SolarAnalyzer({ periods, baselineResult }: Props) {
  const recommendedKW = useMemo(
    () => calcRecommendedKW(baselineResult.annualKWh),
    [baselineResult.annualKWh]
  )
  const [systemKW, setSystemKW] = useState(() => calcRecommendedKW(baselineResult.annualKWh))
  const [batteryCount, setBatteryCount] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [costPerWatt, setCostPerWatt] = useState(DEFAULT_COST_PER_WATT)
  const [batteryCost, setBatteryCost] = useState(POWERWALL.costInstalled)

  const solarConfig: SolarConfig = useMemo(() => ({ systemKW, costPerWatt }), [systemKW, costPerWatt])
  const batteryConfig: BatteryConfig = useMemo(() => ({
    count: batteryCount,
    capacityKWh: POWERWALL.capacityKWh,
    roundTripEff: POWERWALL.roundTripEff,
    costEach: batteryCost,
  }), [batteryCount, batteryCost])

  const analysis = useMemo(() =>
    analyzeAllScenarios(periods, baselineResult, solarConfig, batteryConfig),
    [periods, baselineResult, solarConfig, batteryConfig]
  )

  return (
    <div className="sr-shell">
      <div className="sr-header">
        <p className="pb-section__title">Solar & Battery ROI</p>
        <p className="sr-header__sub">
          Simulated on your actual hourly usage. Federal 30% ITC applied. Atlanta solar data.
        </p>
      </div>

      {/* Configuration */}
      <div className="sr-config">
        <div className="sr-config__row">
          <span className="sr-config__label">
            Solar system size
            <span className="sr-config__value">
              {systemKW} kW &mdash; covers ~{Math.min(100, Math.round(calcAnnualGenKWh(systemKW) / baselineResult.annualKWh * 100))}% of usage
            </span>
          </span>
          <div className="sr-config__btns">
            {SYSTEM_SIZES.map(s => (
              <button
                key={s}
                className={`sr-btn${systemKW === s ? ' sr-btn--active' : ''}`}
                onClick={() => setSystemKW(s)}
              >
                {s} kW{s === recommendedKW ? ' ★' : ''}
              </button>
            ))}
          </div>
          <span className="sr-config__hint">★ recommended for your usage</span>
        </div>
        <div className="sr-config__row">
          <span className="sr-config__label">
            Powerwall 3 batteries
            <span className="sr-config__value">{batteryCount} × 13.5 kWh</span>
          </span>
          <div className="sr-config__btns">
            {BATTERY_COUNTS.map(n => (
              <button
                key={n}
                className={`sr-btn${batteryCount === n ? ' sr-btn--active' : ''}`}
                onClick={() => setBatteryCount(n)}
              >
                {n === 1 ? '1 battery' : '2 batteries'}
              </button>
            ))}
          </div>
        </div>
        <button className="sr-advanced-toggle" onClick={() => setShowAdvanced(v => !v)}>
          {showAdvanced ? '▲' : '▼'} Advanced pricing
        </button>
        {showAdvanced && (
          <div className="sr-advanced">
            <label className="sr-advanced__field">
              <span>Cost per watt (installed, before ITC)</span>
              <span className="sr-advanced__hint">Tesla default ~$2.80/W</span>
              <input
                type="number" value={costPerWatt} step={0.1} min={1} max={6}
                onChange={e => setCostPerWatt(parseFloat(e.target.value))}
                className="sr-advanced__input"
              />
            </label>
            <label className="sr-advanced__field">
              <span>Powerwall 3 installed cost (each)</span>
              <span className="sr-advanced__hint">Tesla default ~$11,500</span>
              <input
                type="number" value={batteryCost} step={100} min={5000} max={25000}
                onChange={e => setBatteryCost(parseInt(e.target.value))}
                className="sr-advanced__input"
              />
            </label>
          </div>
        )}
      </div>

      {/* Scenario cards */}
      <div className="sr-scenarios">
        {analysis.scenarios.map(roi => (
          <ScenarioCard
            key={roi.scenario}
            roi={roi}
            isRecommended={roi.scenario === analysis.recommendation}
          />
        ))}
      </div>

      {/* Payback chart */}
      <PaybackChart scenarios={analysis.scenarios} recommendedScenario={analysis.recommendation} />

      {/* Savings by plan table */}
      <div className="sr-table-wrap">
        <p className="sr-table__title">Annual savings by rate plan</p>
        <p className="sr-table__sub">
          Shows how much each scenario saves vs. your current usage on each plan.
          Battery charges from grid at super off-peak ($0.022) and discharges during on-peak (2–7 PM).
        </p>
        <div className="sr-table-scroll">
          <table className="sr-table">
            <thead>
              <tr>
                <th>Rate plan</th>
                {analysis.scenarios.map(s => (
                  <th key={s.scenario}>{SCENARIO_LABELS[s.scenario]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(PLAN_IDS as readonly PlanId[]).map(planId => (
                <tr key={planId}>
                  <td>{PLAN_LABELS[planId]}</td>
                  {analysis.scenarios.map(s => {
                    const savings = s.savingsByPlan[planId]
                    return (
                      <td
                        key={s.scenario}
                        className={savings > 50 ? 'sr-table__positive' : savings < -50 ? 'sr-table__negative' : ''}
                      >
                        {savings >= 0 ? '+' : ''}{fmt(savings)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Net metering note */}
      <p className="sr-disclaimer">
        Net metering via Georgia Power Renewable Energy Buyback (~$0.029/kWh for exported solar). Battery storage
        typically yields more value than exporting excess at this rate. Estimates based on Jan 2025 Georgia Power tariffs.
        Verify current incentives and pricing before purchase.
      </p>
    </div>
  )
}
