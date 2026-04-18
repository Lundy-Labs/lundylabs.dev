'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import UploadZone from './UploadZone'
import PlanCard from './PlanCard'
import PlanPicker from './PlanPicker'
import MonthlyTable from './MonthlyTable'
import { Button } from '@/components/ui/button'
import { parseGPCFile, groupByBillingPeriod } from '@/lib/powerbill/parser'
import { analyze } from '@/lib/powerbill/analyzer'
import type { DailyRecord, AnalysisResult, TOUAssumptions, PlanId } from '@/lib/powerbill/types'

const UsageChart = dynamic(() => import('./UsageChart'), { ssr: false })
const CostChart = dynamic(() => import('./CostChart'), { ssr: false })

const DEFAULT_ASSUMPTIONS: TOUAssumptions = { summerWeekdayPeakPct: 25, superOffPeakPct: 25 }

function PrivacyBar() {
  return (
    <div className="pb-privacy">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      Your file never leaves your device — everything runs in your browser
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
      setResult(analyze(parsed, periods, DEFAULT_ASSUMPTIONS))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file.')
    } finally {
      setLoading(false)
    }
  }, [])

  if (!result) {
    return (
      <div className="pb-shell">
        <PrivacyBar />
        <div className="pb-header">
          <p className="pb-wordmark">Lundy Labs · Power Bill</p>
          <h1 className="pb-title">Are you on the right Georgia Power plan?</h1>
          <p className="pb-subtitle">Upload your usage history. We&apos;ll run the numbers on every residential rate plan and show you exactly how much each one would cost — and which saves you the most.</p>
        </div>
        <UploadZone onFile={handleFile} loading={loading} />
        {error && <p className="pb-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
        <div className="pb-how" style={{ marginTop: '2rem' }}>
          <p className="pb-how__title">How to export your usage data</p>
          <ol className="pb-how__steps">
            <li>Log in at <strong>georgiapower.com</strong></li>
            <li>Go to <strong>My Account → My Usage → Usage Details</strong></li>
            <li>Set the full date range, click <strong>Download Usage</strong> (.xlsx)</li>
            <li>Drop that file above</li>
          </ol>
        </div>
      </div>
    )
  }

  const currentPlanResult = result.plans.find((p) => p.planId === currentPlan)!
  const sortedPlans = [...result.plans].sort((a, b) => a.annualCost - b.annualCost)
  const bestPlan = sortedPlans[0]
  const savingsVsCurrent = currentPlanResult.annualCost - bestPlan.annualCost

  return (
    <div className="pb-shell">
      <PrivacyBar />
      <div className="pb-header">
        <div className="pb-results-top">
          <div>
            <p className="pb-wordmark">Lundy Labs · Power Bill</p>
            <div className="pb-stats">
              <div className="pb-stat">
                <span className="pb-stat__value">{Math.round(result.annualKWh).toLocaleString()}</span>
                <span className="pb-stat__label">kWh analyzed</span>
              </div>
              <div className="pb-stat">
                <span className="pb-stat__value">{result.avgDailyKWh.toFixed(1)}</span>
                <span className="pb-stat__label">avg kWh / day</span>
              </div>
              <div className="pb-stat">
                <span className="pb-stat__value">{result.peakDailyKWh}</span>
                <span className="pb-stat__label">peak day kWh</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setResult(null); setRecords(null); setError(null) }}>
            New file
          </Button>
        </div>
        {savingsVsCurrent > 0 && bestPlan.planId !== currentPlan && (
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'oklch(0.35 0 0)', lineHeight: 1.5 }}>
            Switching from <strong>{currentPlanResult.planName}</strong> to <strong>{bestPlan.planName}</strong> could save you{' '}
            <strong style={{ color: 'var(--save)' }}>${savingsVsCurrent.toLocaleString('en-US', { maximumFractionDigits: 0 })} per year</strong> based on your usage.
          </p>
        )}
        {savingsVsCurrent <= 0 && (
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'oklch(0.35 0 0)' }}>
            <strong>{currentPlanResult.planName}</strong> is already the most cost-effective plan for your usage.
          </p>
        )}
      </div>
      <PlanPicker value={currentPlan} onChange={setCurrentPlan} />
      <div className="pb-section">
        <p className="pb-section__title">Show the math</p>
        <div className="pb-math">
          <div className="pb-math__header">
            <div>
              <p className="pb-math__plan">{currentPlanResult.planName}</p>
              <p className="pb-math__sub">Annual estimate built from the components below.</p>
            </div>
            <div className="pb-math__total">
              <span className="pb-math__total-label">Total estimate</span>
              <strong>${currentPlanResult.breakdown.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
            </div>
          </div>
          <div className="pb-math__rows">
            <div className="pb-math__row">
              <span>Energy charges</span>
              <strong>${currentPlanResult.breakdown.energyCharge.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
            </div>
            <div className="pb-math__row">
              <span>Riders and adjustments</span>
              <strong>${currentPlanResult.breakdown.riderCharge.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
            </div>
            <div className="pb-math__row">
              <span>Monthly customer charges</span>
              <strong>${currentPlanResult.breakdown.customerCharge.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
            </div>
            {currentPlanResult.breakdown.demandCharge > 0 && (
              <div className="pb-math__row">
                <span>Estimated demand charges</span>
                <strong>${currentPlanResult.breakdown.demandCharge.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
              </div>
            )}
          </div>
          <p className="pb-math__formula">
            Formula: energy charges + riders + customer charges{currentPlanResult.breakdown.demandCharge > 0 ? ' + demand charges' : ''} = total annual estimate
          </p>
        </div>
      </div>
      <div className="pb-section">
        <p className="pb-section__title">How the math works</p>
        <div className="pb-method-grid">
          <div className="pb-method-card">
            <p className="pb-method-card__title">1. We use your actual daily usage</p>
            <p className="pb-method-card__body">
              The calculator reads the daily kWh values from your Georgia Power export and groups them into billing
              periods. That means the totals come from your real usage history, not a generic household profile.
            </p>
          </div>
          <div className="pb-method-card">
            <p className="pb-method-card__title">2. Each plan is priced with its own rate structure</p>
            <p className="pb-method-card__body">
              Standard Residential uses summer tiers and a winter flat rate. PrePay uses flat seasonal rates. The
              time-of-use plans apply different prices depending on when usage is assumed to happen.
            </p>
          </div>
          <div className="pb-method-card">
            <p className="pb-method-card__title">3. Fixed charges and riders are added in</p>
            <p className="pb-method-card__body">
              The estimate includes the monthly customer charge where applicable plus a rider adder of about $0.05 per
              kWh for fuel and other system-wide adjustments. Local taxes and municipal fees are not included.
            </p>
          </div>
        </div>
        <div className="pb-explainer">
          <p className="pb-explainer__title">About the time-of-use plans</p>
          <p className="pb-explainer__body">
            Your file contains daily totals, not hourly data. So for plans like Nights &amp; Weekends, Smart Usage, and
            Overnight Advantage, the calculator has to estimate when within the day your electricity was used. Right
            now those estimates are fixed behind the scenes so the tool stays simple.
          </p>
          <ul className="pb-explainer__list">
            <li>Summer weekday peak assumption: 25% of daily usage falls in the 2 PM to 7 PM on-peak window.</li>
            <li>Overnight assumption for Overnight Advantage: 25% of daily usage falls in the 11 PM to 7 AM window.</li>
            <li>Smart Usage demand charge: estimated from peak daily usage, so it is directional rather than exact.</li>
          </ul>
          <p className="pb-explainer__note">
            In other words, the standard and PrePay plans are closer to exact. The time-of-use plans are best viewed as
            informed estimates based on your daily history.
          </p>
        </div>
      </div>
      <div className="pb-section">
        <p className="pb-section__title">Plan details</p>
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
      <CostChart plans={result.plans} bestPlanId={result.bestPlan} currentPlanId={currentPlan} />

      <div className="pb-disclaimer">
        Costs include tariff energy charges (Jan 2025 rates), an estimated $0.05/kWh rider adder (FCR-26 + ECCR + DSM), and monthly customer charges where applicable. Municipal franchise fees and local taxes excluded. Time-of-use plan estimates rely on fixed usage-timing assumptions because Georgia Power&apos;s export does not include hourly interval data here. Verify current rates at{' '}
        <a href="https://www.georgiapower.com/residential/rate-plans.html" target="_blank" rel="noopener noreferrer">georgiapower.com</a>.
      </div>
    </div>
  )
}
