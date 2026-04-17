'use client'

import type { PlanId } from '@/lib/powerbill/types'

const OPTIONS: { id: PlanId; label: string; sub: string }[] = [
  { id: 'r30',                label: 'Residential Service',  sub: 'Standard (R-30) — most common' },
  { id: 'prepay',             label: 'PrePay',               sub: 'Pay-as-you-go, no commitment' },
  { id: 'nights_weekends',    label: 'Nights & Weekends',    sub: 'TOU — cheap off-peak' },
  { id: 'smart_usage',        label: 'Smart Usage',          sub: 'TOU + demand charge' },
  { id: 'overnight_advantage',label: 'Overnight Advantage',  sub: 'TOU — cheap 11 PM–7 AM' },
]

interface Props {
  value: PlanId
  onChange: (id: PlanId) => void
}

export default function PlanPicker({ value, onChange }: Props) {
  return (
    <div className="plan-picker">
      <h3 className="plan-picker__title">What plan are you currently on?</h3>
      <p className="plan-picker__desc">This sets your baseline — the table and savings calculations compare every plan against it.</p>
      <div className="plan-picker__options">
        {OPTIONS.map((o) => (
          <label key={o.id} className={`plan-picker__option ${value === o.id ? 'plan-picker__option--active' : ''}`}>
            <input
              type="radio"
              name="currentPlan"
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
              className="sr-only"
            />
            <span className="plan-picker__option-label">{o.label}</span>
            <span className="plan-picker__option-sub">{o.sub}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
