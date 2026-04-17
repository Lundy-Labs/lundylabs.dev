'use client'

import type { PlanResult } from '@/lib/powerbill/types'

const ICONS: Record<string, string> = {
  r30: '⚡', prepay: '💳', nights_weekends: '🌙', smart_usage: '🧠', overnight_advantage: '🌃',
}

interface Props {
  plan: PlanResult
  isWinner: boolean
  isCurrent: boolean
  baselineCost?: number // current plan's annual cost; undefined when this IS the current plan
}

export default function PlanCard({ plan, isWinner, isCurrent, baselineCost }: Props) {
  const savings = baselineCost != null ? baselineCost - plan.annualCost : null

  return (
    <div className={`plan-card ${isWinner ? 'plan-card--winner' : ''} ${isCurrent ? 'plan-card--current' : ''}`}>
      {isWinner && !isCurrent && <div className="plan-card__badge">Best for you</div>}
      {isCurrent && <div className="plan-card__badge plan-card__badge--current">Your current plan</div>}
      <div className="plan-card__header">
        <span className="plan-card__icon">{ICONS[plan.planId] ?? '⚡'}</span>
        <h3 className="plan-card__name">{plan.planName}</h3>
      </div>
      <div className="plan-card__cost">
        <span className="plan-card__cost-value">
          ${plan.annualCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
        <span className="plan-card__cost-label">/year est.</span>
      </div>
      {savings != null && savings > 0 && (
        <div className="plan-card__savings">Save ${savings.toLocaleString('en-US', { maximumFractionDigits: 0 })} vs your plan</div>
      )}
      {savings != null && savings < 0 && (
        <div className="plan-card__penalty">+${Math.abs(savings).toLocaleString('en-US', { maximumFractionDigits: 0 })} vs your plan</div>
      )}
      {plan.requiresTOUAssumption && <div className="plan-card__tou-badge">Uses time-of-use estimate</div>}
      <ul className="plan-card__notes">
        {plan.notes.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
    </div>
  )
}
