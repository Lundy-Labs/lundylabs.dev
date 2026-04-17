'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { BillingPeriodSummary } from '@/lib/powerbill/types'

export default function UsageChart({ data }: { data: BillingPeriodSummary[] }) {
  return (
    <div className="chart-card">
      <h3 className="chart-card__title">Monthly Usage (kWh)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,143,115,0.15)" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#406259' }} angle={-45} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11, fill: '#406259' }} />
          <Tooltip
            contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #2d8f73', borderRadius: 10, fontSize: 13 }}
            formatter={(v) => [`${Number(v).toLocaleString()} kWh`, 'Usage']}
          />
          <Bar dataKey="kWh" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.isSummer ? '#2d8f73' : '#8ecfbc'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <span className="chart-legend__item chart-legend__item--summer">Summer (Jun–Sep)</span>
        <span className="chart-legend__item chart-legend__item--winter">Winter (Oct–May)</span>
      </div>
    </div>
  )
}
