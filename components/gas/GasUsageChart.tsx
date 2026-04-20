'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { GasPeriodSummary } from '@/lib/gas/types'

export default function GasUsageChart({ data }: { data: GasPeriodSummary[] }) {
  return (
    <div className="pb-section">
      <p className="pb-section__title">Monthly usage</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 36 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0 0)" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }} />
          <Tooltip
            contentStyle={{ background: 'white', border: '1px solid oklch(0.9 0 0)', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            formatter={(v) => [`${Number(v).toLocaleString('en-US', { maximumFractionDigits: 1 })} therms`]}
            labelStyle={{ fontWeight: 600, marginBottom: 2 }}
          />
          <Bar dataKey="therms" radius={[3, 3, 0, 0]} maxBarSize={32}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.isHeatingMonth ? '#2d8f73' : '#b9e8d7'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.25rem' }}>
        {[['#2d8f73', 'Heating season (Nov–Mar)'], ['#b9e8d7', 'Non-heating (Apr–Oct)']].map(([color, label]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'oklch(0.6 0 0)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
