import Link from 'next/link'
import type { Metadata } from 'next'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'About — Lundy Labs',
  description: 'A small think tank building practical tools for everyday decisions.',
}

export default function AboutPage() {
  return (
    <>
      <section className="ll-page ll-page--top">
        <header className="ll-page__head">
          <p className="ll-page__eyebrow">About</p>
          <h1 className="ll-page__title">The world doesnt change, if we don't try.</h1>
          <p className="ll-page__lede">
            We strive to improve peoples lives by putting smiles on their faces, make dreams realities, and allowing people to live fulfilled lives.
          </p>
        </header>

        <div className="ll-prose-grid">
          <div className="ll-prose">
            <p>
              We build focused tools for problems that are technically solvable but practically ignored.
            </p>
            <p>
              Most everyday decisions happen in the dark — people don't know if they're on the right rate plan, whether solar makes sense for their roof, or how their usage compares to similar homes. We build tools that change that.
            </p>
            <p>
              Everything we ship is free, private, and runs entirely in your browser. No accounts. No tracking. No data retention.
            </p>
          </div>

          <ul className="ll-pillars">
            <li>
              <p className="ll-pillar__tag">Love driven</p>
              <p className="ll-pillar__body">There's no oth.</p>
            </li>
            <li>
              <p className="ll-pillar__tag">Fun by design</p>
              <p className="ll-pillar__body">Your files never leave your browser. No accounts, no tracking, no data retention.</p>
            </li>
            <li>
              <p className="ll-pillar__tag">Keep dreaming</p>
              <p className="ll-pillar__body">A</p>
            </li>
          </ul>
        </div>
      </section>

      {/* <section className="ll-page ll-page--rule">
        <div className="ll-page__head">
          <p className="ll-page__eyebrow">How we work</p>
          <h2 className="ll-page__title ll-page__title--md">Small, opinionated, finished.</h2>
        </div>
        <div className="ll-prose-pair">
          <p>
            Lundy Labs ships small tools. Each one solves a single problem well — usually a problem we hit ourselves and couldn't find a clean answer to.
          </p>
          <p>
            We don't take advertising, sell user data, or build engagement loops. If a tool answers your question and you never come back, that's a success.
          </p>
        </div>
      </section> */}

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
