import Image from 'next/image'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <>
      <section id="mission" className="ll-mission ll-mission--top">
        <div className="ll-mission__inner">
          <figure className="ll-mission__figure">
            <div className="ll-mission__art">
              <svg viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="missionSky" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#e9efd8" />
                    <stop offset="100%" stopColor="#cdd9b8" />
                  </linearGradient>
                </defs>
                <rect width="400" height="320" fill="url(#missionSky)" />
                <circle cx="295" cy="95" r="40" fill="#f5f1e6" opacity="0.9" />
                <path d="M0 230 Q80 200 160 215 T320 220 T400 215 V320 H0 Z" fill="#b8c5a2" opacity="0.6" />
                <path d="M0 255 Q100 235 200 245 T400 240 V320 H0 Z" fill="#9bab84" opacity="0.55" />
                <path d="M0 280 Q120 265 240 275 T400 270 V320 H0 Z" fill="#7a8a66" opacity="0.5" />
                <g stroke="#3d4a32" strokeWidth="1.25" fill="none" opacity="0.55">
                  <path d="M120 280 L120 230 M120 245 L108 235 M120 250 L132 240 M120 260 L110 252" />
                  <path d="M260 285 L260 240 M260 252 L250 244 M260 258 L272 250" />
                </g>
              </svg>
            </div>
            <figcaption className="ll-mission__cap">Helping you love the life you live  .</figcaption>
          </figure>

          <div className="ll-mission__text">
            <p className="ll-mission__eyebrow">Our Goal</p>
            <h2 className="ll-mission__title">One goal — improve lives.</h2>
            <p className="ll-mission__lede">
              Our mission: Dream it, build it and live it. 
            </p>
            <p className="ll-mission__body">
              We are passionate about spreading love, smiles, dreams, and fulfillment.
            </p>
          </div>
        </div>
      </section>

      <section id="projects" className="ll-portfolio">
        <header className="ll-portfolio__head">
          <p className="ll-portfolio__eyebrow">Portfolio</p>
          <h2 className="ll-portfolio__title">Current project we are working on</h2>
        </header>

        <div className="ll-portfolio__grid">
          <a href="https://utilitypilot.co" className="ll-card ll-card--logo-only">
            <div className="ll-logo-tile">
              <Image
                src="/images/utility-pilot-logo.png"
                alt="Utility Pilot by Lundy Labs"
                width={1500}
                height={500}
                className="ll-logo-tile__img"
                priority
              />
              <span className="ll-card__badge ll-card__badge--floating">Live</span>
            </div>
            <div className="ll-card__meta">
              <span className="ll-card__tag">Energy</span>
              <h3 className="ll-card__name">Utility Pilot</h3>
              <p className="ll-card__cap">Compare electricity & gas plans with your real usage data.</p>
            </div>
          </a>

          <div className="ll-card ll-card--logo-only ll-card--soon">
            <div className="ll-logo-tile ll-logo-tile--soon">
              <span className="ll-logo-tile__mark">+</span>
              <span className="ll-card__badge ll-card__badge--soft ll-card__badge--floating">Soon</span>
            </div>
            <div className="ll-card__meta">
              <span className="ll-card__tag">In the lab</span>
              <h3 className="ll-card__name">More to come</h3>
              <p className="ll-card__cap">New tools in the works. Have an idea? Get in touch.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
