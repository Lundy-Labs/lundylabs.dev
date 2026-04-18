'use client'

import type { PlanResult } from '@/lib/powerbill/types'

export default function PlanCard({ plan, isWinner, isCurrent, baselineCost }: {
  plan: PlanResult; isWinner: boolean; isCurrent: boolean; baselineCost?: number
}) {
  const savings = baselineCost != null ? baselineCost - plan.annualCost : null
  const costs = plan.monthlyCosts.map(m => m.cost)
  const minMo = costs.length ? Math.min(...costs) : null
  const maxMo = costs.length ? Math.max(...costs) : null

  return (
    <div className={`pb-plan-card ${isWinner ? 'pb-plan-card--winner' : ''} ${isCurrent ? 'pb-plan-card--current' : ''}`}>
      <div className="pb-plan-card__row">
        {isWinner && !isCurrent && <span className="pb-plan-card__badge">Cheapest</span>}
        {isCurrent && <span className="pb-plan-card__badge pb-plan-card__badge--current">Your plan</span>}
        <p className="pb-plan-card__name">{plan.planName}</p>
        <div className="pb-plan-card__cost-group">
          {minMo != null && maxMo != null ? (
            <>
              <div className="pb-plan-card__cost">
                <span className="pb-plan-card__amount">${minMo.toLocaleString('en-US', { maximumFractionDigits: 0 })}–${maxMo.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                <span className="pb-plan-card__period">/mo</span>
              </div>
              <div className="pb-plan-card__annual">${plan.annualCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}/yr</div>
            </>
          ) : (
            <>
              <div className="pb-plan-card__cost">
                <span className="pb-plan-card__amount">${(plan.annualCost / 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                <span className="pb-plan-card__period">/mo</span>
              </div>
              <div className="pb-plan-card__annual">${plan.annualCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}/yr</div>
            </>
          )}
        </div>
        {savings != null && savings > 0 && (
          <div className="pb-plan-card__delta-save">Save ${savings.toLocaleString('en-US', { maximumFractionDigits: 0 })}/yr</div>
        )}
        {savings != null && savings < 0 && (
          <div className="pb-plan-card__delta-over">+${Math.abs(savings).toLocaleString('en-US', { maximumFractionDigits: 0 })}/yr</div>
        )}
      </div>
      <ul className="pb-plan-card__notes">
        {plan.notes.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
    </div>
  )
}
