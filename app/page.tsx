import Image from 'next/image'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <>
      <section id="mission" className="ll-mission ll-mission--top">
        <div className="ll-mission__inner">
          <figure className="ll-mission__figure">
            <div className="ll-mission__art ll-mission__art--photo">
              <Image
                src="/images/mission-photo.jpg"
                alt="Lundy Labs"
                width={2000}
                height={1500}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="ll-mission__photo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                priority
              />
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
