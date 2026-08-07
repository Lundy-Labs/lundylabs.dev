import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'About — Lundy Labs',
  description:
    'Lundy Labs is built by Nic Lundegard — dream it, build it, live it, and leave the world better than we found it.',
}

const LINKEDIN_URL = 'https://www.linkedin.com/in/nlundegard'
const PERSONAL_SITE_URL = 'https://lundy.me'

export default function AboutPage() {
  return (
    <>
      <section className="ll-page ll-page--top ll-page--narrow">
        <div className="ll-about-intro">
          <Image
            src="/images/nic-lundegard.jpg"
            alt="Nic Lundegard, founder of Lundy Labs"
            width={960}
            height={960}
            className="ll-about-photo"
            priority
            sizes="(max-width: 640px) 160px, 200px"
          />
          <header className="ll-page__head ll-about-intro__head">
            <p className="ll-page__eyebrow">About</p>
            <h1 className="ll-page__title">Hi, I&apos;m Nic Lundegard.</h1>
            <p className="ll-page__lede">
              I like to build things. Lundy Labs is where I dream it, build it, live it,
              and love it — using imagination to leave the world better than I found it.
            </p>
          </header>
        </div>

        <div className="ll-prose">
          <p>
            I started Lundy Labs because I believe the world doesn&apos;t change if we
            don&apos;t try. I want to spread love, put smiles on faces, and help people
            live more fulfilled lives — one idea at a time.
          </p>
          <p>
            Everything here is built from that mindset: dream boldly, build with care,
            live what you make, and love the work enough to leave things better than
            you found them.
          </p>
          <p>
            If something here resonates, or you have an idea worth building, I&apos;m
            easy to reach. This is my name on it.
          </p>
        </div>

        <div className="ll-contact-card">
          <div className="ll-contact-row">
            <span className="ll-contact-row__label">Founder</span>
            <span className="ll-contact-row__value">Nic Lundegard</span>
          </div>
          <div className="ll-contact-row">
            <span className="ll-contact-row__label">LinkedIn</span>
            <a
              href={LINKEDIN_URL}
              className="ll-contact-row__value"
              target="_blank"
              rel="noreferrer"
            >
              linkedin.com/in/nlundegard
            </a>
          </div>
          <div className="ll-contact-row">
            <span className="ll-contact-row__label">Personal</span>
            <a
              href={PERSONAL_SITE_URL}
              className="ll-contact-row__value"
              target="_blank"
              rel="noreferrer"
            >
              lundy.me
            </a>
          </div>
          <div className="ll-contact-row">
            <span className="ll-contact-row__label">Email</span>
            <a href="mailto:nic@lundylabs.dev" className="ll-contact-row__value">
              nic@lundylabs.dev
            </a>
          </div>
          <div className="ll-contact-row">
            <span className="ll-contact-row__label">Location</span>
            <span className="ll-contact-row__value">Atlanta, Georgia</span>
          </div>
        </div>
      </section>

      <section className="ll-page ll-page--cta">
        <div className="ll-cta">
          <h2 className="ll-cta__title">Got an idea worth building?</h2>
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
