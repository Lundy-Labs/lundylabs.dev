'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { GasPlanResult } from '@/lib/gas/types'

interface Props {
  plans: GasPlanResult[]
  bestPlanId: string
  currentPlanId: string
}

export default function GasCostChart({ plans, bestPlanId, currentPlanId }: Props) {
  const sorted = [...plans].sort((a, b) => a.annualCost - b.annualCost)
  const chartData = sorted.map((p) => ({ planName: p.shortName, annualCost: p.annualCost, planId: p.planId }))

  return (
    <div className="pb-section">
      <p className="pb-section__title">Annual cost estimate</p>
      <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 38)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 56, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0 0)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
          <YAxis
            type="category"
            dataKey="planName"
            width={130}
            tick={{ fontSize: 11, fill: 'oklch(0.3 0 0)' }}
          />
          <Tooltip
            contentStyle={{ background: 'white', border: '1px solid oklch(0.9 0 0)', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            formatter={(v) => [`$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'Annual est.']}
          />
          <Bar dataKey="annualCost" radius={[0, 3, 3, 0]} maxBarSize={26}>
            {chartData.map((e) => (
              <Cell
                key={e.planId}
                fill={
                  e.planId === bestPlanId
                    ? '#2d8f73'
                    : e.planId === currentPlanId
                    ? 'oklch(0.82 0 0)'
                    : 'oklch(0.88 0 0)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
