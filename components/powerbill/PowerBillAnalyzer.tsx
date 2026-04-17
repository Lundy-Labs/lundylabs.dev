'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import UploadZone from './UploadZone'
import PlanCard from './PlanCard'
import PlanPicker from './PlanPicker'
import TOUSliders from './TOUSliders'
import MonthlyTable from './MonthlyTable'
import { parseGPCFile, groupByBillingPeriod } from '@/lib/powerbill/parser'
import { analyze } from '@/lib/powerbill/analyzer'
import type { DailyRecord, AnalysisResult, TOUAssumptions, PlanId } from '@/lib/powerbill/types'

const UsageChart = dynamic(() => import('./UsageChart'), { ssr: false })
const CostChart = dynamic(() => import('./CostChart'), { ssr: false })

const DEFAULT_ASSUMPTIONS: TOUAssumptions = { summerWeekdayPeakPct: 25, superOffPeakPct: 25 }

export default function PowerBillAnalyzer() {
  const [records, setRecords] = useState<DailyRecord[] | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assumptions, setAssumptions] = useState<TOUAssumptions>(DEFAULT_ASSUMPTIONS)
  const [currentPlan, setCurrentPlan] = useState<PlanId>('r30')
  const periodsRef = useRef<ReturnType<typeof groupByBillingPeriod> | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const parsed = await parseGPCFile(file)
      if (parsed.length === 0) throw new Error('No usage data found in file.')
      const periods = groupByBillingPeriod(parsed)
      periodsRef.current = periods
      setRecords(parsed)
      setResult(analyze(parsed, periods, DEFAULT_ASSUMPTIONS))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAssumptionsChange = useCallback((next: TOUAssumptions) => {
    setAssumptions(next)
    if (records && periodsRef.current) {
      setResult(analyze(records, periodsRef.current, next))
    }
  }, [records])

  const privacyBanner = (
    <div className="analyzer-privacy analyzer-privacy--top">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <strong>Your data never leaves your device.</strong>&nbsp;The file is read and analyzed entirely in your browser — nothing is uploaded, stored, or transmitted.
    </div>
  )

  if (!result) {
    return (
      <div className="analyzer-shell">
        {privacyBanner}
        <div className="analyzer-hero">
          <p className="analyzer-eyebrow">Lundy Labs · Power Bill</p>
          <h1 className="analyzer-title">Find your cheapest Georgia Power plan</h1>
          <p className="analyzer-subtitle">
            Upload your usage export and we&apos;ll compare all residential rate plans side-by-side —
            Standard, PrePay, Nights &amp; Weekends, Smart Usage, and Overnight Advantage.
          </p>
        </div>
        <UploadZone onFile={handleFile} loading={loading} />
        {error && <p className="analyzer-error">{error}</p>}
        <div className="analyzer-how">
          <h2 className="analyzer-how__title">How to get your file</h2>
          <ol className="analyzer-how__steps">
            <li>Log in to <strong>georgiapower.com</strong></li>
            <li>Go to <strong>My Account → My Usage → Usage Details</strong></li>
            <li>Select full date range and click <strong>Download Usage</strong> (.xlsx)</li>
            <li>Drop that file here — everything runs in your browser, nothing is uploaded.</li>
          </ol>
        </div>
      </div>
    )
  }

  const currentPlanResult = result.plans.find((p) => p.planId === currentPlan)!
  const sortedPlans = [...result.plans].sort((a, b) => a.annualCost - b.annualCost)

  return (
    <div className="analyzer-shell">
      {privacyBanner}
      <div className="analyzer-results-header">
        <p className="analyzer-eyebrow">Lundy Labs · Power Bill</p>
        <h1 className="analyzer-title">Your rate plan analysis</h1>
        <div className="analyzer-stats">
          <div className="stat-chip">
            <span className="stat-chip__value">{Math.round(result.annualKWh).toLocaleString()}</span>
            <span className="stat-chip__label">kWh analyzed</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__value">{result.avgDailyKWh.toFixed(1)}</span>
            <span className="stat-chip__label">avg kWh/day</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__value">{result.peakDailyKWh}</span>
            <span className="stat-chip__label">peak kWh day</span>
          </div>
        </div>
        <button className="analyzer-reset" onClick={() => { setResult(null); setRecords(null); setError(null) }}>
          Upload a different file
        </button>
      </div>

      <PlanPicker value={currentPlan} onChange={setCurrentPlan} />

      <UsageChart data={result.monthlyBreakdown} />
      <TOUSliders assumptions={assumptions} onChange={handleAssumptionsChange} />
      <CostChart plans={result.plans} bestPlanId={result.bestPlan} />
      <div className="chart-card">
        <MonthlyTable plans={result.plans} bestPlanId={result.bestPlan} currentPlanId={currentPlan} />
      </div>

      <div className="plan-grid">
        {sortedPlans.map((plan) => (
          <PlanCard
            key={plan.planId}
            plan={plan}
            isWinner={plan.planId === result.bestPlan}
            isCurrent={plan.planId === currentPlan}
            baselineCost={plan.planId !== currentPlan ? currentPlanResult.annualCost : undefined}
          />
        ))}
      </div>

      <div className="analyzer-disclaimer">
        <strong>Disclaimer:</strong> Costs include tariff energy charges (Jan 2025 rates), an estimated <strong>$0.05/kWh rider adder</strong> (FCR-26 ~$0.046 + ECCR ~$0.002 + DSM ~$0.002), and monthly customer charges where applicable.
        Municipal franchise fees and local taxes are excluded (location-dependent) and apply equally to all plans.
        TOU plan costs depend on actual hourly usage — use sliders above to model your habits.
        Rider rates fluctuate monthly; verify current rates at{' '}
        <a href="https://www.georgiapower.com/residential/rate-plans.html" target="_blank" rel="noopener noreferrer">georgiapower.com</a>.
      </div>
    </div>
  )
}
