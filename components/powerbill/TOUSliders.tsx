'use client'

import { Slider } from '@/components/ui/slider'
import type { TOUAssumptions } from '@/lib/powerbill/types'

export default function TOUSliders({ assumptions, onChange }: { assumptions: TOUAssumptions; onChange: (a: TOUAssumptions) => void }) {
  return (
    <div className="pb-section">
      <p className="pb-section__title">Time-of-use assumptions</p>
      <p style={{ fontSize: '0.82rem', color: 'oklch(0.55 0 0)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        Your data is daily totals — no hourly breakdown. Adjust to match your habits.
      </p>
      <div className="pb-sliders">
        <div className="pb-slider-row">
          <div className="pb-slider-label">
            <span>Peak usage · 2–7 PM summer weekdays</span>
            <span className="pb-slider-value">{assumptions.summerWeekdayPeakPct}%</span>
          </div>
          <Slider
            min={5} max={50} step={5}
            value={[assumptions.summerWeekdayPeakPct]}
            onValueChange={(vals) => onChange({ ...assumptions, summerWeekdayPeakPct: Array.isArray(vals) ? (vals[0] ?? assumptions.summerWeekdayPeakPct) : assumptions.summerWeekdayPeakPct })}
          />
          <div className="pb-slider-ticks"><span>5% (away at work)</span><span>50% (home all day)</span></div>
        </div>
        <div className="pb-slider-row">
          <div className="pb-slider-label">
            <span>Overnight usage · 11 PM–7 AM daily</span>
            <span className="pb-slider-value">{assumptions.superOffPeakPct}%</span>
          </div>
          <Slider
            min={10} max={60} step={5}
            value={[assumptions.superOffPeakPct]}
            onValueChange={(vals) => onChange({ ...assumptions, superOffPeakPct: Array.isArray(vals) ? (vals[0] ?? assumptions.superOffPeakPct) : assumptions.superOffPeakPct })}
          />
          <div className="pb-slider-ticks"><span>10% (no overnight loads)</span><span>60% (EV charging)</span></div>
        </div>
      </div>
    </div>
  )
}
