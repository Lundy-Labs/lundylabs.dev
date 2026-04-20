'use client'

import type { GasPlanResult, GasPlanId } from '@/lib/gas/types'

interface Props {
  plans: GasPlanResult[]
  bestPlanId: GasPlanId
  currentPlanId: GasPlanId
}

function label(period: string): string {
  const [year, month] = period.split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1, 1)
  return isNaN(d.getTime()) ? period : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function GasMonthlyTable({ plans, bestPlanId, currentPlanId }: Props) {
  const periods = plans[0]?.monthlyCosts.map((m) => m.period) ?? []

  const costFor = (p: GasPlanResult, period: string) =>
    p.monthlyCosts.find((m) => m.period === period)?.cost ?? 0
  const thermsFor = (period: string) =>
    plans[0]?.monthlyCosts.find((m) => m.period === period)?.therms ?? 0

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
              <th>Therms</th>
              {ordered.map((p) => (
                <th
                  key={p.planId}
                  className={
                    p.planId === bestPlanId && p.planId !== currentPlanId
                      ? 'pb-table__best-col'
                      : p.planId === currentPlanId
                      ? 'pb-table__current'
                      : ''
                  }
                >
                  <span title={p.planName}>{p.shortName}</span>
                  {p.planId === currentPlanId && <span className="pb-tag pb-tag--current">you</span>}
                  {p.planId === bestPlanId && p.planId !== currentPlanId && (
                    <span className="pb-tag pb-tag--best">best</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => {
              const curCost = costFor(current, period)
              return (
                <tr key={period}>
                  <td>{label(period)}</td>
                  <td className="pb-table__kwh">{thermsFor(period).toLocaleString('en-US', { maximumFractionDigits: 1 })}</td>
                  {ordered.map((p) => {
                    const cost = costFor(p, period)
                    const diff = p.planId !== currentPlanId ? cost - curCost : null
                    return (
                      <td
                        key={p.planId}
                        className={
                          p.planId === bestPlanId && p.planId !== currentPlanId
                            ? 'pb-table__best-col'
                            : p.planId === currentPlanId
                            ? 'pb-table__current'
                            : ''
                        }
                      >
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
                  <td
                    key={p.planId}
                    className={
                      p.planId === bestPlanId && p.planId !== currentPlanId
                        ? 'pb-table__best-col'
                        : p.planId === currentPlanId
                        ? 'pb-table__current'
                        : ''
                    }
                  >
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
