'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import UploadZone from './UploadZone'
import PlanCard from './PlanCard'
import PlanPicker from './PlanPicker'
import MonthlyTable from './MonthlyTable'
import CalcBreakdown from './CalcBreakdown'
import { Button } from '@/components/ui/button'
import { parseGPCFile, groupByBillingPeriod } from '@/lib/powerbill/parser'
import { analyze } from '@/lib/powerbill/analyzer'
import type { DailyRecord, AnalysisResult, PlanId } from '@/lib/powerbill/types'
import SolarAnalyzer from '@/components/solar/SolarAnalyzer'

const UsageChart = dynamic(() => import('./UsageChart'), { ssr: false })
const CostChart = dynamic(() => import('./CostChart'), { ssr: false })

function PrivacyBar({ inline, onNewFile }: { inline?: boolean; onNewFile?: () => void }) {
  return (
    <div className={`pb-privacy${inline ? ' pb-privacy--inline' : ''}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      Your file never leaves your device — everything runs in your browser
      {onNewFile && (
        <Button variant="outline" size="sm" onClick={onNewFile} style={{ marginLeft: 'auto' }}>
          New file
        </Button>
      )}
    </div>
  )
}

export default function PowerBillAnalyzer() {
  const [records, setRecords] = useState<DailyRecord[] | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      setResult(analyze(parsed, periods))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file.')
    } finally {
      setLoading(false)
    }
  }, [])

  if (!result) {
    return (
      <div className="pb-shell">
        <div className="pb-header pb-header--landing">
          <h1 className="pb-title">Georgia Power Plan Analyzer</h1>
        </div>
        <PrivacyBar inline />
        <div className="pb-how">
          <p className="pb-how__title">How to export your usage data</p>
          <ol className="pb-how__steps">
            <li>Log in at <strong>georgiapower.com</strong></li>
            <li>Go to <strong>My Account → My Usage → Usage Details</strong></li>
            <li><strong style={{ color: 'red' }}>Select &ldquo;Hourly&rdquo; as the export interval</strong></li>
            <li>Set the full date range, click <strong>Download Usage</strong> (.xlsx)</li>
            <li>Drop that file above</li>
          </ol>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <UploadZone onFile={handleFile} loading={loading} />
        </div>
        {error && <p className="pb-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
      </div>
    )
  }

  const currentPlanResult = result.plans.find((p) => p.planId === currentPlan)!
  const sortedPlans = [...result.plans].sort((a, b) => a.annualCost - b.annualCost)
  const bestPlan = sortedPlans[0]
  const savingsVsCurrent = currentPlanResult.annualCost - bestPlan.annualCost

  return (
    <div className="pb-shell">
      <PrivacyBar onNewFile={() => { setResult(null); setRecords(null); setError(null) }} />
      <div className="pb-header">
        <div>
          <p className="pb-your-usage-label">Your usage</p>
          <div className="pb-stats">
            <div className="pb-stat">
              <span className="pb-stat__value">{Math.round(result.annualKWh).toLocaleString()}</span>
              <span className="pb-stat__label">total kWh</span>
            </div>
            <div className="pb-stat">
              <span className="pb-stat__value">{result.avgDailyKWh.toFixed(1)}</span>
              <span className="pb-stat__label">avg kWh / day</span>
            </div>
            <div className="pb-stat">
              <span className="pb-stat__value">{result.peakDailyKWh.toFixed(1)}</span>
              <span className="pb-stat__label">peak day kWh</span>
            </div>
            {records && records.length > 0 && (
              <div className="pb-stat">
                <span className="pb-stat__value pb-stat__value--sm">
                  {records[0].date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {' – '}
                  {records[records.length - 1].date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className="pb-stat__label">date range</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <PlanPicker value={currentPlan} onChange={setCurrentPlan} />
      <div className="pb-section">
        <p className="pb-section__title">Plan details</p>
        {savingsVsCurrent > 0 && bestPlan.planId !== currentPlan && (
          <div className="pb-savings-callout">
            <p className="pb-savings-callout__main">
              Switching from <strong>{currentPlanResult.planName}</strong> to <strong>{bestPlan.planName}</strong> could save you{' '}
              <strong className="pb-savings-callout__amount">${savingsVsCurrent.toLocaleString('en-US', { maximumFractionDigits: 0 })} per year</strong> based on your usage.
            </p>
            <p className="pb-savings-callout__how">
              To switch: <strong>georgiapower.com</strong> → My Account → My Profile → Rate Plan, or call <strong>1-888-660-5890</strong>. Takes effect next billing cycle.
            </p>
          </div>
        )}
        {savingsVsCurrent <= 0 && (
          <p className="pb-savings-callout__neutral">
            <strong>{currentPlanResult.planName}</strong> is already the most cost-effective plan for your usage.
          </p>
        )}
        <div className="pb-plan-grid">
          {sortedPlans.map((plan) => (
            <PlanCard key={plan.planId} plan={plan}
              isWinner={plan.planId === result.bestPlan}
              isCurrent={plan.planId === currentPlan}
              baselineCost={plan.planId !== currentPlan ? currentPlanResult.annualCost : undefined}
            />
          ))}
        </div>
      </div>
      <UsageChart data={result.monthlyBreakdown} />
      <MonthlyTable plans={result.plans} bestPlanId={result.bestPlan} currentPlanId={currentPlan} />
      <CalcBreakdown plans={result.plans} currentPlanId={currentPlan} bestPlanId={result.bestPlan} />

      <div className="pb-disclaimer">
        Costs include tariff energy charges (Jan 2025 rates), an estimated $0.05/kWh rider adder (FCR-26 + ECCR + DSM), and monthly customer charges where applicable. Municipal franchise fees and local taxes excluded. Time-of-use plans are calculated from your actual hourly data. Verify current rates at{' '}
        <a href="https://www.georgiapower.com/residential/rate-plans.html" target="_blank" rel="noopener noreferrer">georgiapower.com</a>.
      </div>

      {periodsRef.current && (
        <div className="pb-section" style={{ borderBottom: 'none' }}>
          <SolarAnalyzer periods={periodsRef.current} baselineResult={result} />
        </div>
      )}
    </div>
  )
}
