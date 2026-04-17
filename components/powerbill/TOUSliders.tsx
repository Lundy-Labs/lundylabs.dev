'use client'

import type { TOUAssumptions } from '@/lib/powerbill/types'

export default function TOUSliders({ assumptions, onChange }: { assumptions: TOUAssumptions; onChange: (a: TOUAssumptions) => void }) {
  return (
    <div className="tou-sliders">
      <h3 className="tou-sliders__title">Time-of-use assumptions</h3>
      <p className="tou-sliders__desc">
        Your data is daily totals — no hourly breakdown. Adjust to match your habits; TOU plan costs update live.
      </p>
      <label className="tou-slider__label">
        <span>Peak usage (2–7 PM, summer weekdays): <strong>{assumptions.summerWeekdayPeakPct}%</strong></span>
        <span className="tou-slider__hint">AC running all day → ~30%. Away at work, thermostat up → ~15%.</span>
        <input type="range" min={5} max={50} step={5} value={assumptions.summerWeekdayPeakPct}
          onChange={(e) => onChange({ ...assumptions, summerWeekdayPeakPct: +e.target.value })} className="tou-slider__input" />
        <div className="tou-slider__ticks"><span>5%</span><span>25%</span><span>50%</span></div>
      </label>
      <label className="tou-slider__label">
        <span>Overnight usage (11 PM–7 AM daily): <strong>{assumptions.superOffPeakPct}%</strong></span>
        <span className="tou-slider__hint">EV charged overnight → ~40%+. No overnight loads → ~20%.</span>
        <input type="range" min={10} max={60} step={5} value={assumptions.superOffPeakPct}
          onChange={(e) => onChange({ ...assumptions, superOffPeakPct: +e.target.value })} className="tou-slider__input" />
        <div className="tou-slider__ticks"><span>10%</span><span>35%</span><span>60%</span></div>
      </label>
    </div>
  )
}
