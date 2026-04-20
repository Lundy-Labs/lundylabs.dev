'use client'

import type { ProviderId } from '@/lib/powerbill/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor="provider-select" className="pb-how__title" style={{ margin: 0 }}>Utility Provider</label>
      <Select value={value} onValueChange={(v) => onChange(v as ProviderId)}>
        <SelectTrigger id="provider-select">
          <SelectValue>
            {(v: string | null) => PROVIDERS.find(p => p.id === v)?.label ?? v}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {PROVIDERS.map((p) => (
            <SelectItem key={p.id} value={p.id} label={p.label}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
