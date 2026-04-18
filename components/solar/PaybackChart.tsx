'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import type { ScenarioROI, SolarScenario } from '@/lib/solar/types'

const LABELS: Record<SolarScenario, string> = {
  solar_only: 'Solar Only',
  battery_only: 'Battery Only',
  solar_battery: 'Solar + Battery',
}

interface Props {
  scenarios: ScenarioROI[]
  recommendedScenario: SolarScenario | 'none'
}

export default function PaybackChart({ scenarios, recommendedScenario }: Props) {
  const data = scenarios
    .filter(s => isFinite(s.simplePaybackYears) && s.simplePaybackYears > 0)
    .map(s => ({
      name: LABELS[s.scenario],
      scenario: s.scenario,
      years: parseFloat(s.simplePaybackYears.toFixed(1)),
    }))

  if (data.length === 0) return null

  return (
    <div className="sr-chart">
      <p className="sr-chart__title">Payback period (years)</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.94 0 0)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'oklch(0.45 0 0)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'oklch(0.45 0 0)' }} unit="yr" axisLine={false} tickLine={false} width={40} />
          <Tooltip
            formatter={(v) => [`${v} years`, 'Payback']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid oklch(0.9 0 0)' }}
          />
          <ReferenceLine y={10} stroke="#b45309" strokeDasharray="4 2" />
          <Bar dataKey="years" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell
                key={entry.scenario}
                fill={entry.scenario === recommendedScenario ? '#2d8f73' : 'oklch(0.85 0 0)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="sr-chart__note">Orange line = 10-year benchmark</p>
    </div>
  )
}
