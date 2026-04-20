'use client'

import type { GasPlanResult } from '@/lib/gas/types'

interface Props {
  plan: GasPlanResult
  isWinner: boolean
  isCurrent: boolean
  baselineCost?: number
}

export default function GasPlanCard({ plan, isWinner, isCurrent, baselineCost }: Props) {
  const savings = baselineCost != null ? baselineCost - plan.annualCost : null
  const costs = plan.monthlyCosts.map((m) => m.cost)
  const minMo = costs.length ? Math.min(...costs) : null
  const maxMo = costs.length ? Math.max(...costs) : null

  return (
    <div className={`pb-plan-card ${isWinner ? 'pb-plan-card--winner' : ''} ${isCurrent ? 'pb-plan-card--current' : ''}`}>
      <div className="pb-plan-card__row">
        {isWinner && !isCurrent && <span className="pb-plan-card__badge">Cheapest</span>}
        {isCurrent && <span className="pb-plan-card__badge pb-plan-card__badge--current">Your plan</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="pb-plan-card__name">{plan.planName}</p>
          <p className="gb-plan-card__provider">{plan.provider}</p>
        </div>
        <div className="pb-plan-card__cost-group">
          {minMo != null && maxMo != null ? (
            <>
              <div className="pb-plan-card__cost">
                <span className="pb-plan-card__amount">
                  ${minMo.toLocaleString('en-US', { maximumFractionDigits: 0 })}–${maxMo.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
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
      {plan.promoNote && (
        <div className="gb-plan-card__promo">{plan.promoNote}</div>
      )}
      <ul className="pb-plan-card__notes">
        {plan.isVariable && <li>Variable rate plan — rate shown is an annual estimate.</li>}
        {plan.contractMonths > 0 && <li>{plan.contractMonths}-month contract.</li>}
        {plan.notes.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
    </div>
  )
}
