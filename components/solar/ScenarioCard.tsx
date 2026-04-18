import type { ScenarioROI, SolarScenario } from '@/lib/solar/types'

const LABELS: Record<SolarScenario, string> = {
  solar_only: 'Solar Only',
  battery_only: 'Battery Only',
  solar_battery: 'Solar + Battery',
}

const DESCS: Record<SolarScenario, string> = {
  solar_only: 'Tesla solar panels — no battery',
  battery_only: 'Powerwall only, grid-charged at night',
  solar_battery: 'Solar panels + Powerwall',
}

interface Props {
  roi: ScenarioROI
  isRecommended: boolean
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function ScenarioCard({ roi, isRecommended }: Props) {
  const { scenario, annualSavings, installCostNet, installCostGross, federalITC,
          simplePaybackYears, npv20yr, bestPlanName } = roi
  const payback = isFinite(simplePaybackYears) && simplePaybackYears > 0
    ? `${simplePaybackYears.toFixed(1)} yr`
    : annualSavings <= 0 ? 'No savings' : '—'

  return (
    <div className={`sr-card${isRecommended ? ' sr-card--recommended' : ''}`}>
      {isRecommended && <div className="sr-card__badge">Best ROI</div>}
      <p className="sr-card__title">{LABELS[scenario]}</p>
      <p className="sr-card__desc">{DESCS[scenario]}</p>

      <div className="sr-card__stats">
        <div className="sr-card__stat">
          <span className={`sr-card__stat-value${annualSavings > 0 ? ' sr-card__stat-value--positive' : ''}`}>
            {fmt(annualSavings)}
          </span>
          <span className="sr-card__stat-label">annual savings</span>
          <span className="sr-card__stat-note">on {bestPlanName}</span>
        </div>
        <div className="sr-card__stat">
          <span className="sr-card__stat-value">{payback}</span>
          <span className="sr-card__stat-label">payback period</span>
        </div>
        <div className="sr-card__stat">
          <span className={`sr-card__stat-value${npv20yr > 0 ? ' sr-card__stat-value--positive' : ' sr-card__stat-value--negative'}`}>
            {fmt(npv20yr)}
          </span>
          <span className="sr-card__stat-label">20-yr NPV</span>
          <span className="sr-card__stat-note">at 6% discount</span>
        </div>
      </div>

      <div className="sr-card__cost-breakdown">
        <div className="sr-card__cost-line">
          <span className="sr-card__cost-label">Pay upfront</span>
          <span className="sr-card__cost-amount">{fmt(installCostGross)}</span>
        </div>
        <div className="sr-card__cost-line sr-card__cost-line--itc">
          <span className="sr-card__cost-label">
            Federal tax credit (30% ITC)
            <span className="sr-card__cost-sublabel">returned on your tax return</span>
          </span>
          <span className="sr-card__cost-amount sr-card__cost-amount--credit">−{fmt(federalITC)}</span>
        </div>
        <div className="sr-card__cost-line sr-card__cost-line--net">
          <span className="sr-card__cost-label">Net out-of-pocket</span>
          <span className="sr-card__cost-amount sr-card__cost-amount--net">{fmt(installCostNet)}</span>
        </div>
      </div>
    </div>
  )
}
