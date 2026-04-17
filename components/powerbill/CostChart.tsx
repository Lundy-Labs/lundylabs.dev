'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { PlanResult } from '@/lib/powerbill/types'

const COLORS: Record<string, string> = {
  r30: '#4a9e84', prepay: '#2d8f73', nights_weekends: '#1a6b55',
  smart_usage: '#8ecfbc', overnight_advantage: '#6bb8a4',
}

export default function CostChart({ plans, bestPlanId }: { plans: PlanResult[]; bestPlanId: string }) {
  const sorted = [...plans].sort((a, b) => a.annualCost - b.annualCost)
  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Estimated Annual Cost by Plan</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,143,115,0.15)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#406259' }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
          <YAxis type="category" dataKey="planName" width={140} tick={{ fontSize: 12, fill: '#11352d' }} />
          <Tooltip
            contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #2d8f73', borderRadius: 10, fontSize: 13 }}
            formatter={(v) => [`$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'Annual est.']}
          />
          <Bar dataKey="annualCost" radius={[0, 4, 4, 0]}>
            {sorted.map((e) => <Cell key={e.planId} fill={e.planId === bestPlanId ? '#11352d' : (COLORS[e.planId] ?? '#2d8f73')} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
