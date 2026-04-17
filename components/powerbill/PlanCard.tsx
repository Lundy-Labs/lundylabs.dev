'use client'

import type { PlanResult } from '@/lib/powerbill/types'

export default function PlanCard({ plan, isWinner, isCurrent, baselineCost }: {
  plan: PlanResult; isWinner: boolean; isCurrent: boolean; baselineCost?: number
}) {
  const savings = baselineCost != null ? baselineCost - plan.annualCost : null

  return (
    <div className={`pb-plan-card ${isWinner ? 'pb-plan-card--winner' : ''} ${isCurrent ? 'pb-plan-card--current' : ''}`}>
      {isWinner && !isCurrent && <div className="pb-plan-card__badge">Cheapest</div>}
      {isCurrent && <div className="pb-plan-card__badge pb-plan-card__badge--current">Your plan</div>}
      <p className="pb-plan-card__name">{plan.planName}</p>
      <div className="pb-plan-card__cost">
        <span className="pb-plan-card__amount">${plan.annualCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        <span className="pb-plan-card__period">/yr</span>
      </div>
      {savings != null && savings > 0 && (
        <div className="pb-plan-card__delta-save">Save ${savings.toLocaleString('en-US', { maximumFractionDigits: 0 })}/yr</div>
      )}
      {savings != null && savings < 0 && (
        <div className="pb-plan-card__delta-over">+${Math.abs(savings).toLocaleString('en-US', { maximumFractionDigits: 0 })}/yr</div>
      )}
      {plan.requiresTOUAssumption && <div className="pb-plan-card__tou">Estimate based on usage assumptions</div>}
      <ul className="pb-plan-card__notes">
        {plan.notes.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
    </div>
  )
}
