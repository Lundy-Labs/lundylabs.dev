'use client'

import type { ProviderId } from '@/lib/powerbill/types'

const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: 'georgia_power', label: 'Georgia Power' },
  { id: 'cobb_emc',      label: 'Cobb EMC' },
]

interface Props {
  value: ProviderId
  onChange: (id: ProviderId) => void
}

export default function ProviderPicker({ value, onChange }: Props) {
  return (
    <div className="pb-provider-picker">
      <label className="pb-provider-picker__label" htmlFor="provider-select">
        Utility Provider
      </label>
      <select
        id="provider-select"
        className="pb-provider-picker__select"
        value={value}
        onChange={(e) => onChange(e.target.value as ProviderId)}
      >
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
    </div>
  )
}
