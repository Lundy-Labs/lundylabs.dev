'use client'

import { useState, useCallback, type ChangeEvent } from 'react'
import dynamic from 'next/dynamic'
import GasUploadZone from './GasUploadZone'
import GasPlanCard from './GasPlanCard'
import GasMonthlyTable from './GasMonthlyTable'
import GasBreakdown from './GasBreakdown'
import { Button } from '@/components/ui/button'
import { parseGasFile } from '@/lib/gas/parser'
import { buildBillingPeriods, analyze } from '@/lib/gas/analyzer'
import { GAS_STATES, GAS_STATE_LIST } from '@/lib/gas/rates'
import type { GasMonthlyRecord, GasAnalysisResult, GasPlanId } from '@/lib/gas/types'

const GasUsageChart = dynamic(() => import('./GasUsageChart'), { ssr: false })
const GasCostChart = dynamic(() => import('./GasCostChart'), { ssr: false })

function PrivacyBar({ inline, onNewFile }: { inline?: boolean; onNewFile?: () => void }) {
  return (
    <div className={`pb-privacy${inline ? ' pb-privacy--inline' : ''}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      Your data never leaves your device — all calculations run in your browser
      {onNewFile && (
        <Button variant="outline" size="sm" onClick={onNewFile} style={{ marginLeft: 'auto' }}>
          New analysis
        </Button>
      )}
    </div>
  )
}

export default function GasAnalyzer() {
  const [selectedState, setSelectedState] = useState('ga')
  const [records, setRecords] = useState<GasMonthlyRecord[] | null>(null)
  const [result, setResult] = useState<GasAnalysisResult | null>(null)
  const [currentPlan, setCurrentPlan] = useState<GasPlanId>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const state = GAS_STATES[selectedState]

  const runAnalysis = useCallback((recs: GasMonthlyRecord[]) => {
    const periods = buildBillingPeriods(recs)
    const analysisResult = analyze(selectedState, recs, periods)
    setRecords(recs)
    setResult(analysisResult)
    // Default current plan to first plan in state
    setCurrentPlan((prev: GasPlanId) => {
      const planIds = state.plans.map((p) => p.id)
      return planIds.includes(prev) ? prev : planIds[0]
    })
  }, [selectedState, state])

  const handleFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const parsed = await parseGasFile(file)
      if (parsed.length === 0) throw new Error('No usage data found in file.')
      runAnalysis(parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file.')
    } finally {
      setLoading(false)
    }
  }, [runAnalysis])

  const handleManualRecords = useCallback((recs: GasMonthlyRecord[]) => {
    setError(null)
    runAnalysis(recs)
  }, [runAnalysis])

  const reset = () => {
    setResult(null)
    setRecords(null)
    setError(null)
  }

  if (!result) {
    return (
      <div className="pb-shell">
        <div className="pb-header pb-header--landing">
          <h1 className="pb-title">Natural Gas Plan Analyzer</h1>
          <p className="pb-subtitle">
            Upload your monthly usage or enter therms manually. We&rsquo;ll show you which plan saves you the most — fixed fees and all.
          </p>
        </div>
        <PrivacyBar inline />

        <div className="gb-state-picker">
          <label className="gb-state-picker__label" htmlFor="state-select">Your state</label>
          <select
            id="state-select"
            className="gb-state-picker__select"
            value={selectedState}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedState(e.target.value)}
          >
            {GAS_STATE_LIST.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {state.isDeregulated ? (
            <p className="gb-state-picker__note">
              <strong>{state.name}</strong> has a deregulated gas market — you choose your marketer. We compare {state.plans.length} plans across {new Set(state.plans.map((p) => p.provider)).size} providers.
            </p>
          ) : (
            <p className="gb-state-picker__note">
              <strong>{state.name}</strong> has a regulated gas market — your rate is set by your utility. We show your options for comparison.
            </p>
          )}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <GasUploadZone
            onRecords={handleManualRecords}
            loading={loading}
            onFileUpload={handleFile}
            instructions={state.uploadInstructions}
          />
        </div>
        {error && <p className="pb-error" style={{ marginTop: '0.75rem' }}>{error}</p>}

        <div className="gb-rate-note" style={{ marginTop: '2rem' }}>
          <p>
            Rates shown are approximate as of <strong>{state.rateDate}</strong>. Source: {state.rateSource}.
            Always verify current rates before switching plans.
          </p>
        </div>
      </div>
    )
  }

  const currentPlanResult = result.plans.find((p) => p.planId === currentPlan) ?? result.plans[0]
  const sortedPlans = [...result.plans].sort((a, b) => a.annualCost - b.annualCost)
  const bestPlan = sortedPlans[0]
  const savingsVsCurrent = currentPlanResult.annualCost - bestPlan.annualCost

  return (
    <div className="pb-shell">
      <PrivacyBar onNewFile={reset} />

      <div className="pb-header">
        <div>
          <p className="pb-your-usage-label">Your usage · {state.name}</p>
          <div className="pb-stats">
            <div className="pb-stat">
              <span className="pb-stat__value">{Math.round(result.annualTherms).toLocaleString()}</span>
              <span className="pb-stat__label">total therms</span>
            </div>
            <div className="pb-stat">
              <span className="pb-stat__value">{result.avgMonthlyTherms.toFixed(1)}</span>
              <span className="pb-stat__label">avg therms/mo</span>
            </div>
            <div className="pb-stat">
              <span className="pb-stat__value">{result.peakMonthTherms.toFixed(1)}</span>
              <span className="pb-stat__label">peak month</span>
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

      {/* Current plan picker */}
      <div className="pb-section">
        <p className="pb-section__title">Your current plan</p>
        <div className="pb-plan-picker">
          {state.plans.map((p) => (
            <label
              key={p.id}
              className={`pb-plan-option ${currentPlan === p.id ? 'pb-plan-option--active' : ''}`}
            >
              <input
                type="radio"
                name="currentGasPlan"
                value={p.id}
                checked={currentPlan === p.id}
                onChange={() => setCurrentPlan(p.id)}
                className="sr-only"
              />
              <span className="pb-plan-option__name">{p.shortName}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Savings callout */}
      <div className="pb-section">
        <p className="pb-section__title">Plan details</p>
        {savingsVsCurrent > 0 && bestPlan.planId !== currentPlan && (
          <div className="pb-savings-callout">
            <p className="pb-savings-callout__main">
              Switching from <strong>{currentPlanResult.planName}</strong> to <strong>{bestPlan.planName}</strong> could save you{' '}
              <strong className="pb-savings-callout__amount">
                ${savingsVsCurrent.toLocaleString('en-US', { maximumFractionDigits: 0 })} per year
              </strong>{' '}
              based on your usage.
            </p>
            {state.isDeregulated && (
              <p className="pb-savings-callout__how">
                To switch: contact <strong>{bestPlan.provider}</strong> directly. Switches take effect on your next billing cycle. Verify current rates before enrolling.
              </p>
            )}
            {!state.isDeregulated && (
              <p className="pb-savings-callout__how">
                In regulated markets, your provider is determined by your address. Contact your utility about available rate programs or assistance plans.
              </p>
            )}
          </div>
        )}
        {savingsVsCurrent <= 0 && (
          <p className="pb-savings-callout__neutral">
            <strong>{currentPlanResult.planName}</strong> is already the most cost-effective plan for your usage.
          </p>
        )}

        {result.avgMonthlyTherms < 20 && (
          <div className="gb-low-usage-tip">
            <strong>Low-usage household:</strong> With your average of {result.avgMonthlyTherms.toFixed(1)} therms/month, plans with lower monthly fees tend to win even if the per-therm rate is slightly higher.
          </div>
        )}

        <div className="pb-plan-grid">
          {sortedPlans.map((plan) => (
            <GasPlanCard
              key={plan.planId}
              plan={plan}
              isWinner={plan.planId === result.bestPlan}
              isCurrent={plan.planId === currentPlan}
              baselineCost={plan.planId !== currentPlan ? currentPlanResult.annualCost : undefined}
            />
          ))}
        </div>
      </div>

      <GasUsageChart data={result.monthlyBreakdown} />
      <GasCostChart plans={result.plans} bestPlanId={result.bestPlan} currentPlanId={currentPlan} />
      <GasMonthlyTable plans={result.plans} bestPlanId={result.bestPlan} currentPlanId={currentPlan} />
      <GasBreakdown plans={result.plans} currentPlanId={currentPlan} bestPlanId={result.bestPlan} stateId={selectedState} />

      <div className="pb-disclaimer">
        Costs are estimates based on the rates above ({state.rateDate}) and your reported usage.
        {state.isDeregulated && ` ${state.distributionLabel} charges (~$${state.distributionRatePerTherm.toFixed(3)}/therm + $${state.distributionMonthlyFee.toFixed(2)}/mo) are included in every plan.`}
        {' '}Variable plan rates shown are 12-month average estimates. Always verify current rates at the provider&rsquo;s website before switching.
        Source: {state.rateSource}.
      </div>
    </div>
  )
}
