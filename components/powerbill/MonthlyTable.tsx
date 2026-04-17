'use client'

import type { PlanResult, PlanId } from '@/lib/powerbill/types'

const SHORT: Record<string, string> = {
  r30: 'Standard',
  prepay: 'PrePay',
  nights_weekends: 'Nights & Wknd',
  smart_usage: 'Smart Usage',
  overnight_advantage: 'Overnight Adv.',
}

interface Props {
  plans: PlanResult[]
  bestPlanId: PlanId
  currentPlanId: PlanId
}

export default function MonthlyTable({ plans, bestPlanId, currentPlanId }: Props) {
  const periods = plans[0]?.monthlyCosts.map((m) => m.billPeriod) ?? []

  function label(billPeriod: string): string {
    const start = billPeriod.split(' - ')[0] ?? ''
    const d = new Date(start + 'T12:00:00')
    return isNaN(d.getTime()) ? billPeriod : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  function costFor(plan: PlanResult, period: string): number {
    return plan.monthlyCosts.find((m) => m.billPeriod === period)?.cost ?? 0
  }

  function kWhFor(period: string): number {
    return plans[0]?.monthlyCosts.find((m) => m.billPeriod === period)?.kWh ?? 0
  }

  // Current plan first, then remaining sorted cheapest → most expensive
  const currentPlan = plans.find((p) => p.planId === currentPlanId)!
  const otherPlans = [...plans]
    .filter((p) => p.planId !== currentPlanId)
    .sort((a, b) => a.annualCost - b.annualCost)
  const orderedPlans = [currentPlan, ...otherPlans]

  return (
    <div className="monthly-table-wrap">
      <h3 className="chart-card__title" style={{ marginBottom: '1rem' }}>Monthly Cost by Plan</h3>
      <div className="monthly-table-scroll">
        <table className="monthly-table">
          <thead>
            <tr>
              <th className="monthly-table__period-col">Period</th>
              <th className="monthly-table__kwh-col">kWh</th>
              {orderedPlans.map((p) => (
                <th
                  key={p.planId}
                  className={[
                    p.planId === currentPlanId ? 'monthly-table__current-col' : '',
                    p.planId === bestPlanId && p.planId !== currentPlanId ? 'monthly-table__best-col' : '',
                  ].join(' ')}
                >
                  {SHORT[p.planId] ?? p.planName}
                  {p.planId === currentPlanId && <span className="monthly-table__tag monthly-table__tag--current">current</span>}
                  {p.planId === bestPlanId && p.planId !== currentPlanId && <span className="monthly-table__tag monthly-table__tag--best">★ best</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => {
              const currentCost = costFor(currentPlan, period)
              return (
                <tr key={period}>
                  <td className="monthly-table__period-col">{label(period)}</td>
                  <td className="monthly-table__kwh-col">{kWhFor(period).toLocaleString()}</td>
                  {orderedPlans.map((p) => {
                    const cost = costFor(p, period)
                    const diff = p.planId !== currentPlanId ? cost - currentCost : null
                    return (
                      <td
                        key={p.planId}
                        className={[
                          p.planId === currentPlanId ? 'monthly-table__current-col' : '',
                          p.planId === bestPlanId && p.planId !== currentPlanId ? 'monthly-table__best-col' : '',
                        ].join(' ')}
                      >
                        <span className="monthly-table__cost">
                          ${cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                        {diff !== null && (
                          <span className={`monthly-table__diff ${diff < 0 ? 'monthly-table__diff--save' : 'monthly-table__diff--over'}`}>
                            {diff < 0 ? `−$${Math.abs(diff).toFixed(0)}` : `+$${diff.toFixed(0)}`}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="monthly-table__total-row">
              <td colSpan={2}>Annual total</td>
              {orderedPlans.map((p) => {
                const diff = p.planId !== currentPlanId ? p.annualCost - currentPlan.annualCost : null
                return (
                  <td
                    key={p.planId}
                    className={[
                      p.planId === currentPlanId ? 'monthly-table__current-col' : '',
                      p.planId === bestPlanId && p.planId !== currentPlanId ? 'monthly-table__best-col' : '',
                    ].join(' ')}
                  >
                    <strong>${p.annualCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
                    {diff !== null && (
                      <span className={`monthly-table__diff ${diff < 0 ? 'monthly-table__diff--save' : 'monthly-table__diff--over'}`}>
                        {diff < 0 ? `−$${Math.abs(diff).toFixed(0)}` : `+$${diff.toFixed(0)}`}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
