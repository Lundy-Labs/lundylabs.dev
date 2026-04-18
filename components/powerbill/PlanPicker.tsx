'use client'

import type { PlanId } from '@/lib/powerbill/types'

const OPTIONS: { id: PlanId; label: string; sub: string }[] = [
  { id: 'r30',                 label: 'Residential Service',   sub: 'Standard R-30' },
  { id: 'prepay',              label: 'PrePay',                sub: 'No commitment' },
  { id: 'nights_weekends',     label: 'Nights & Weekends',     sub: 'TOU off-peak' },
  { id: 'smart_usage',         label: 'Smart Usage',           sub: 'TOU + demand' },
  { id: 'overnight_advantage', label: 'Overnight Advantage',   sub: 'TOU overnight' },
]

interface Props {
  value: PlanId
  onChange: (id: PlanId) => void
}

export default function PlanPicker({ value, onChange }: Props) {
  return (
    <div className="pb-section">
      <p className="pb-section__title">Your current plan</p>
      <div className="pb-plan-picker">
        {OPTIONS.map((o) => (
          <label key={o.id} className={`pb-plan-option ${value === o.id ? 'pb-plan-option--active' : ''}`}>
            <input type="radio" name="currentPlan" value={o.id} checked={value === o.id}
              onChange={() => onChange(o.id)} className="sr-only" />
            <span className="pb-plan-option__name">{o.label}</span>
            <span className="pb-plan-option__sub">{o.sub}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
