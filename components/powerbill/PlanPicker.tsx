'use client'

import type { PlanId, ProviderId } from '@/lib/powerbill/types'

const GP_OPTIONS: { id: PlanId; label: string; sub: string }[] = [
  { id: 'r30',                 label: 'Residential Service',   sub: 'Standard R-30' },
  { id: 'prepay',              label: 'PrePay',                sub: 'No commitment' },
  { id: 'nights_weekends',     label: 'Nights & Weekends',     sub: 'TOU off-peak' },
  { id: 'smart_usage',         label: 'Smart Usage',           sub: 'TOU + demand' },
  { id: 'overnight_advantage', label: 'Overnight Advantage',   sub: 'TOU overnight' },
]

const COBB_OPTIONS: { id: PlanId; label: string; sub: string }[] = [
  { id: 'cobb_standard',     label: 'Standard',     sub: 'Tiered seasonal' },
  { id: 'cobb_fixed',        label: 'Fixed Rate',   sub: 'Flat $0.0825' },
  { id: 'cobb_niteflex',     label: 'NiteFlex',     sub: 'TOU overnight' },
  { id: 'cobb_smart_choice', label: 'Smart Choice', sub: 'TOU + demand' },
]

interface Props {
  value: PlanId
  onChange: (id: PlanId) => void
  providerId: ProviderId
}

export default function PlanPicker({ value, onChange, providerId }: Props) {
  const options = providerId === 'cobb_emc' ? COBB_OPTIONS : GP_OPTIONS
  return (
    <div className="pb-section">
      <p className="pb-section__title">Select Your Current Plan</p>
      <div className="pb-plan-picker">
        {options.map((o) => (
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
