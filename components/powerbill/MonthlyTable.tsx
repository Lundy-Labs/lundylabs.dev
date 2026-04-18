'use client'

import type { PlanResult, PlanId } from '@/lib/powerbill/types'

const SHORT: Record<string, string> = {
  r30: 'Standard', prepay: 'PrePay', nights_weekends: 'Nights & Wknd',
  smart_usage: 'Smart Usage', overnight_advantage: 'Overnight Adv.',
}

interface Props { plans: PlanResult[]; bestPlanId: PlanId; currentPlanId: PlanId }

export default function MonthlyTable({ plans, bestPlanId, currentPlanId }: Props) {
  const periods = plans[0]?.monthlyCosts.map((m) => m.billPeriod) ?? []

  function label(bp: string) {
    const d = new Date((bp.split(' - ')[0] ?? '') + 'T12:00:00')
    return isNaN(d.getTime()) ? bp : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  const costFor = (p: PlanResult, bp: string) => p.monthlyCosts.find((m) => m.billPeriod === bp)?.cost ?? 0
  const kWhFor = (bp: string) => plans[0]?.monthlyCosts.find((m) => m.billPeriod === bp)?.kWh ?? 0

  const current = plans.find((p) => p.planId === currentPlanId)!
  const others = [...plans].filter((p) => p.planId !== currentPlanId).sort((a, b) => a.annualCost - b.annualCost)
  const ordered = [current, ...others]

  return (
    <div className="pb-section">
      <p className="pb-section__title">Monthly breakdown</p>
      <div className="pb-table-wrap">
        <table className="pb-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Period</th>
              <th>kWh</th>
              {ordered.map((p) => (
                <th key={p.planId} className={p.planId === bestPlanId && p.planId !== currentPlanId ? 'pb-table__best-col' : p.planId === currentPlanId ? 'pb-table__current' : ''}>
                  {SHORT[p.planId]}
                  {p.planId === currentPlanId && <span className="pb-tag pb-tag--current">you</span>}
                  {p.planId === bestPlanId && p.planId !== currentPlanId && <span className="pb-tag pb-tag--best">best</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((bp) => {
              const curCost = costFor(current, bp)
              return (
                <tr key={bp}>
                  <td>{label(bp)}</td>
                  <td className="pb-table__kwh">{kWhFor(bp).toLocaleString()}</td>
                  {ordered.map((p) => {
                    const cost = costFor(p, bp)
                    const diff = p.planId !== currentPlanId ? cost - curCost : null
                    return (
                      <td key={p.planId} className={p.planId === bestPlanId && p.planId !== currentPlanId ? 'pb-table__best-col' : p.planId === currentPlanId ? 'pb-table__current' : ''}>
                        <span className="pb-cost">${cost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        {diff !== null && (
                          <span className={`pb-diff ${diff < 0 ? 'pb-diff--save' : 'pb-diff--over'}`}>
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
            <tr>
              <td colSpan={2} style={{ textAlign: 'left' }}>Annual total</td>
              {ordered.map((p) => {
                const diff = p.planId !== currentPlanId ? p.annualCost - current.annualCost : null
                return (
                  <td key={p.planId} className={p.planId === bestPlanId && p.planId !== currentPlanId ? 'pb-table__best-col' : p.planId === currentPlanId ? 'pb-table__current' : ''}>
                    <span className="pb-cost">${p.annualCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    {diff !== null && (
                      <span className={`pb-diff ${diff < 0 ? 'pb-diff--save' : 'pb-diff--over'}`}>
                        {diff < 0 ? `−$${Math.abs(diff).toFixed(0)}/yr` : `+$${diff.toFixed(0)}/yr`}
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
