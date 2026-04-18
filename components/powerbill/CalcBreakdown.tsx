import type { PlanResult, PlanId } from '@/lib/powerbill/types'

interface Props {
  plans: PlanResult[]
  currentPlanId: PlanId
  bestPlanId: PlanId
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })

export default function CalcBreakdown({ plans, currentPlanId, bestPlanId }: Props) {
  const sorted = [...plans].sort((a, b) => a.annualCost - b.annualCost)

  return (
    <div className="pb-section">
      <p className="pb-section__title">Detailed calculations</p>
      <p className="pb-calc-intro">
        Every number broken down — energy charges, riders, and fixed costs — so you can verify the math yourself.
      </p>
      <div className="pb-calc-grid">
        {sorted.map((plan) => {
          const isCurrent = plan.planId === currentPlanId
          const isBest = plan.planId === bestPlanId
          return (
            <div
              key={plan.planId}
              className={`pb-calc-card${isBest ? ' pb-calc-card--best' : ''}${isCurrent ? ' pb-calc-card--current' : ''}`}
            >
              <div className="pb-calc-card__header">
                <p className="pb-calc-card__name">{plan.planName}</p>
                <div className="pb-calc-card__badges">
                  {isBest && <span className="pb-calc-badge pb-calc-badge--best">Cheapest</span>}
                  {isCurrent && <span className="pb-calc-badge pb-calc-badge--current">Your plan</span>}
                </div>
              </div>

              <div className="pb-calc-rows">
                <div className="pb-calc-row">
                  <span>Annual usage</span>
                  <span>{Math.round(plan.annualKWh).toLocaleString()} kWh</span>
                </div>
                <div className="pb-calc-row">
                  <span>Energy charges</span>
                  <span>{fmt(plan.breakdown.energyCharge)}</span>
                </div>
                <div className="pb-calc-row">
                  <span>Rider adder <span className="pb-calc-row__rate">$0.050/kWh</span></span>
                  <span>{fmt(plan.breakdown.riderCharge)}</span>
                </div>
                {plan.breakdown.customerCharge > 0 && (
                  <div className="pb-calc-row">
                    <span>Customer charge <span className="pb-calc-row__rate">$10.82/mo</span></span>
                    <span>{fmt(plan.breakdown.customerCharge)}</span>
                  </div>
                )}
                {plan.breakdown.demandCharge > 0 && (
                  <div className="pb-calc-row">
                    <span>Demand charge <span className="pb-calc-row__rate">$12.21/kW</span></span>
                    <span>{fmt(plan.breakdown.demandCharge)}</span>
                  </div>
                )}
                <div className="pb-calc-row pb-calc-row--total">
                  <span>Annual estimate</span>
                  <strong>{fmt(plan.breakdown.total)}</strong>
                </div>
              </div>

              {plan.notes.length > 0 && (
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
