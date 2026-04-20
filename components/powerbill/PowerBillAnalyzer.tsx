'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import UploadZone from './UploadZone'
import PlanCard from './PlanCard'
import PlanPicker from './PlanPicker'
import ProviderPicker from './ProviderPicker'
import MonthlyTable from './MonthlyTable'
import CalcBreakdown from './CalcBreakdown'
import { Button } from '@/components/ui/button'
import { parseGPCFile, groupByBillingPeriod } from '@/lib/powerbill/parser'
import { analyze } from '@/lib/powerbill/analyzer'
import type { DailyRecord, AnalysisResult, PlanId, ProviderId } from '@/lib/powerbill/types'
import SolarAnalyzer from '@/components/solar/SolarAnalyzer'

const UsageChart = dynamic(() => import('./UsageChart'), { ssr: false })
const CostChart = dynamic(() => import('./CostChart'), { ssr: false })

const DEFAULT_PLAN: Record<ProviderId, PlanId> = {
  georgia_power: 'r30',
  cobb_emc: 'cobb_standard',
}

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

const PROVIDER_INSTRUCTIONS: Record<ProviderId, { site: string; steps: string[] }> = {
  georgia_power: {
    site: 'georgiapower.com',
    steps: [
      'Log in at georgiapower.com',
      'Go to My Account → My Usage → Usage Details',
      'Select "Hourly" as the export interval',
      'Set the full date range, click Download Usage (.xlsx)',
      'Drop that file above',
    ],
  },
  cobb_emc: {
    site: 'cobbemc.smarthub.coop',
    steps: [
      'Log in at cobbemc.smarthub.coop',
      'Go to My Usage → Usage Details',
      'Select "Hourly" as the export interval',
      'Set the full date range and download the usage file (.xlsx)',
      'Drop that file above',
    ],
  },
}

const PROVIDER_SWITCH_URL: Record<ProviderId, { url: string; phone: string }> = {
  georgia_power: { url: 'georgiapower.com', phone: '1-888-660-5890' },
  cobb_emc: { url: 'cobbemc.com', phone: '1-770-429-2100' },
}

export default function PowerBillAnalyzer() {
  const [records, setRecords] = useState<DailyRecord[] | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<ProviderId>('georgia_power')
  const [currentPlan, setCurrentPlan] = useState<PlanId>('r30')
  const periodsRef = useRef<ReturnType<typeof groupByBillingPeriod> | null>(null)
  const recordsRef = useRef<DailyRecord[] | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const parsed = await parseGPCFile(file)
      if (parsed.length === 0) throw new Error('No usage data found in file.')
      const periods = groupByBillingPeriod(parsed)
      periodsRef.current = periods
      recordsRef.current = parsed
      setRecords(parsed)
      setResult(analyze(parsed, periods, provider))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider])

  const handleProviderChange = useCallback((newProvider: ProviderId) => {
    setProvider(newProvider)
    setCurrentPlan(DEFAULT_PLAN[newProvider])
    if (periodsRef.current && recordsRef.current) {
      setResult(analyze(recordsRef.current, periodsRef.current, newProvider))
    }
  }, [])

  if (!result) {
    const instructions = PROVIDER_INSTRUCTIONS[provider]
    return (
      <div className="pb-shell">
        <div className="pb-header pb-header--landing">
          <h1 className="pb-title">Power Rate Plan Analyzer</h1>
          <p className="pb-tagline">
            Most households are on their utility&rsquo;s default rate plan — but depending on <em>when</em>{' '}you use electricity,
            a different plan from the same provider could cut your annual bill by hundreds of dollars.
            Upload your hourly usage data below and we&rsquo;ll run the numbers across every available plan so you can see exactly where you stand.
          </p>
        </div>
        <PrivacyBar inline />
        <div className="pb-provider-section">
          <ProviderPicker value={provider} onChange={handleProviderChange} />
        </div>
        <div className="pb-how">
          <p className="pb-how__title">How to export your usage data</p>
          <ol className="pb-how__steps">
            {instructions.steps.map((step, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: step.replace(
                instructions.site,
                `<strong>${instructions.site}</strong>`
              ).replace('"Hourly"', '<strong style="color:red">Hourly</strong>') }} />
            ))}
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
  const switchInfo = PROVIDER_SWITCH_URL[provider]

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
      <div className="pb-provider-section">
        <ProviderPicker value={provider} onChange={handleProviderChange} />
      </div>
      <PlanPicker value={currentPlan} onChange={setCurrentPlan} providerId={provider} />
      <div className="pb-section">
        <p className="pb-section__title">Plan details</p>
        {savingsVsCurrent > 0 && bestPlan.planId !== currentPlan && (
          <div className="pb-savings-callout">
            <p className="pb-savings-callout__main">
              Switching from <strong>{currentPlanResult.planName}</strong> to <strong>{bestPlan.planName}</strong> could save you{' '}
              <strong className="pb-savings-callout__amount">${savingsVsCurrent.toLocaleString('en-US', { maximumFractionDigits: 0 })} per year</strong> based on your usage.
            </p>
            <p className="pb-savings-callout__how">
              To switch: <strong>{switchInfo.url}</strong> → My Account → My Profile → Rate Plan, or call <strong>{switchInfo.phone}</strong>. Takes effect next billing cycle.
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
        {provider === 'georgia_power'
          ? <>Costs include tariff energy charges (Jan 2025 rates), an estimated $0.05/kWh rider adder (FCR-26 + ECCR + DSM), and monthly customer charges where applicable. Municipal franchise fees and local taxes excluded. Time-of-use plans are calculated from your actual hourly data. Verify current rates at{' '}<a href="https://www.georgiapower.com/residential/rate-plans.html" target="_blank" rel="noopener noreferrer">georgiapower.com</a>.</>
          : <>Costs use 2025 Cobb EMC residential tariffs (all-inclusive — no separate rider). Monthly service charges included. Time-of-use plans calculated from your actual hourly data. Smart Choice demand is estimated from your peak 2–7 PM hour (actual Energy Saving Peak Days are utility-designated). Verify current rates at{' '}<a href="https://www.cobbemc.com/rates" target="_blank" rel="noopener noreferrer">cobbemc.com/rates</a>.</>
        }
      </div>

      {provider === 'georgia_power' && periodsRef.current && (
        <div className="pb-section" style={{ borderBottom: 'none' }}>
          <SolarAnalyzer periods={periodsRef.current} baselineResult={result} />
        </div>
      )}
    </div>
  )
}
