import type { GasPlanResult, GasPlanId } from '@/lib/gas/types'
import { GAS_STATES } from '@/lib/gas/rates'

interface Props {
  plans: GasPlanResult[]
  currentPlanId: GasPlanId
  bestPlanId: GasPlanId
  stateId: string
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })

export default function GasBreakdown({ plans, currentPlanId, bestPlanId, stateId }: Props) {
  const sorted = [...plans].sort((a, b) => a.annualCost - b.annualCost)
  const state = GAS_STATES[stateId]

  return (
    <div className="pb-section">
      <p className="pb-section__title">Detailed calculations</p>
      <p className="pb-calc-intro">
        Annual cost broken down by commodity, distribution, and fixed fees — so you can see exactly why some plans win at different usage levels.
      </p>
      <div className="pb-calc-grid">
        {sorted.map((plan) => {
          const isCurrent = plan.planId === currentPlanId
          const isBest = plan.planId === bestPlanId
          const monthsOfData = plan.monthlyCosts.length
          const avgMonthlyFee = plan.breakdown.customerCharge / Math.max(monthsOfData, 1)
          const ratePerTherm = state.plans.find((p) => p.id === plan.planId)?.ratePerTherm ?? 0
          const monthlyFee = state.plans.find((p) => p.id === plan.planId)?.monthlyFee ?? 0

          return (
            <div
              key={plan.planId}
              className={`pb-calc-card${isBest ? ' pb-calc-card--best' : ''}${isCurrent ? ' pb-calc-card--current' : ''}`}
            >
              <div className="pb-calc-card__header">
                <div>
                  <p className="pb-calc-card__name">{plan.planName}</p>
                  <p className="gb-calc-card__provider">{plan.provider}</p>
                </div>
                <div className="pb-calc-card__badges">
                  {isBest && <span className="pb-calc-badge pb-calc-badge--best">Cheapest</span>}
                  {isCurrent && <span className="pb-calc-badge pb-calc-badge--current">Your plan</span>}
                </div>
              </div>

              <div className="pb-calc-rows">
                <div className="pb-calc-row">
                  <span>Annual usage</span>
                  <span>{plan.annualTherms.toLocaleString('en-US', { maximumFractionDigits: 1 })} therms</span>
                </div>
                <div className="pb-calc-row">
                  <span>Commodity charge <span className="pb-calc-row__rate">${ratePerTherm.toFixed(3)}/therm</span></span>
                  <span>{fmt(plan.breakdown.commodityCharge)}</span>
                </div>
                {plan.breakdown.distributionCharge > 0 && (
                  <div className="pb-calc-row">
                    <span>Distribution <span className="pb-calc-row__rate">${state.distributionRatePerTherm.toFixed(3)}/therm</span></span>
                    <span>{fmt(plan.breakdown.distributionCharge)}</span>
                  </div>
                )}
                <div className="pb-calc-row">
                  <span>Monthly fees <span className="pb-calc-row__rate">
                    ${monthlyFee.toFixed(2)}/mo{state.distributionMonthlyFee > 0 ? ` + $${state.distributionMonthlyFee.toFixed(2)} dist.` : ''}
                  </span></span>
                  <span>{fmt(plan.breakdown.customerCharge)}</span>
                </div>
                <div className="pb-calc-row pb-calc-row--total">
                  <span>Annual estimate</span>
                  <strong>
                    {fmt(plan.breakdown.total)}{' '}
                    <span className="pb-calc-row__monthly">({fmt(plan.breakdown.total / monthsOfData)}/mo avg)</span>
                  </strong>
                </div>
              </div>

              {(plan.isVariable || plan.notes.length > 0) && (
                <ul className="pb-calc-notes">
                  {plan.notes.map((note, i) => <li key={i}>{note}</li>)}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
