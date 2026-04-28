import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Projects — Lundy Labs',
  description: 'Tools we have built, are building, and are planning.',
}

export default function ProjectsPage() {
  return (
    <>
      <section className="ll-page ll-page--top">
        <header className="ll-page__head">
          <p className="ll-page__eyebrow">Projects</p>
          <h1 className="ll-page__title">Projects we&apos;re working on.</h1>
          <p className="ll-page__lede">
            We are trying to spread love and smiles, one project at a time.
          </p>
        </header>

        <div className="ll-projects-list">
          <a href="https://utilitypilot.co" className="ll-project-row ll-project-row--live ll-project-row--logo-only">
            <div className="ll-logo-tile ll-logo-tile--row">
              <Image
                src="/images/utility-pilot-logo.png"
                alt="Utility Pilot by Lundy Labs"
                width={1500}
                height={500}
                className="ll-logo-tile__img"
                priority
              />
              <span className="ll-project-row__status ll-project-row__status--live ll-project-row__status--floating">Live</span>
            </div>
            <div className="ll-project-row__body">
              <p className="ll-project-row__index">01 — Energy</p>
              <h2 className="ll-project-row__title">Utility Pilot</h2>
              <p className="ll-project-row__desc">
                Helping you optimize your utilities and put money back in your pocket.
              </p>
              <ul className="ll-project-row__features">
                <li>Power Rate Plan Analyzer</li>
                <li>Gate Plan Analyzer</li>
                <li>Solar and Battery ROI Calculator</li>
                <li>Cell and Internet Analyzer</li>
              </ul>
              <span className="ll-project-row__cta">
                Visit project
                <svg width="14" height="10" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M1 6h13M9 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </a>

          <article className="ll-project-row ll-project-row--logo-only">
            <div className="ll-logo-tile ll-logo-tile--row ll-logo-tile--soon">
              <span className="ll-logo-tile__mark ll-logo-tile__mark--lg">+</span>
              <span className="ll-project-row__status ll-project-row__status--planned ll-project-row__status--floating">Soon</span>
            </div>
            <div className="ll-project-row__body">
              <p className="ll-project-row__index">02 — In the lab</p>
              <h2 className="ll-project-row__title">More to come</h2>
              <p className="ll-project-row__desc">
                We&apos;re heads-down on the next tool. Same recipe: solve one annoying problem, keep it private, keep it free.
              </p>
              <p className="ll-project-row__desc">
                Got an idea worth building? <Link href="/contact" className="ll-project-row__inline-link">Tell us about it</Link>.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="ll-page ll-page--cta">
        <div className="ll-cta">
          <h2 className="ll-cta__title">Have an idea worth building?</h2>
          <Link href="/contact" className="ll-cta__btn">
            Get in touch
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M1 6h13M9 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
