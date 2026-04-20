import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__inner">
          <p className="home-hero__tag">Lundy Labs LLC</p>
          <h1 className="home-hero__title">Practical ideas, shipped.</h1>
          <p className="home-hero__copy">
            A small think tank focused on tools that help real people make smarter decisions about energy, money, and everyday life.
          </p>
          <div className="home-hero__actions">
            <a href="https://utilitypilot.lundylabs.dev" className={cn(buttonVariants({ size: 'sm' }), 'home-hero__cta')}>
              Utility Pilot <ArrowRight size={14} />
            </a>
            <Link href="/#about" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'home-hero__ghost')}>
              About
            </Link>
          </div>
        </div>
      </section>

      <div className="home-feature-strip">
        <div className="home-feature-strip__inner">
          <div className="home-feature-strip__left">
            <span className="home-feature-strip__eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              New
            </span>
            <p className="home-feature-strip__text">Utility Pilot — compare electricity &amp; gas plans with your real usage data</p>
          </div>
          <a href="https://utilitypilot.lundylabs.dev" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'home-feature-strip__cta')}>
            Try it free <ArrowRight size={13} />
          </a>
        </div>
      </div>

      <main className="home-body">
        <section id="projects" className="home-section">
          <div className="home-section__head">
            <p className="home-section__eyebrow">Projects</p>
            <h2 className="home-section__title">Tools we've built</h2>
          </div>
          <div className="home-projects-grid">
            <a href="https://utilitypilot.lundylabs.dev" className="home-project home-project--live">
              <div className="home-project__header">
                <div className="home-project__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <span className="home-project__status home-project__status--live">Live</span>
              </div>
              <p className="home-project__tag">Energy</p>
              <h3 className="home-project__title">Utility Pilot</h3>
              <p className="home-project__desc">Upload your usage history and see exactly which electricity or gas plan saves you the most money — fixed fees included.</p>
              <ul className="home-project__features">
                <li>Georgia Power — 5 residential rate plans</li>
                <li>Natural gas — GA, FL, TN, NC, SC</li>
                <li>Hourly or monthly usage data</li>
              </ul>
              <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'home-project__cta')}>
                Open <ExternalLink size={12} />
              </span>
            </a>

            <div className="home-project">
              <div className="home-project__header">
                <div className="home-project__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                </div>
                <span className="home-project__status home-project__status--research">Research</span>
              </div>
              <p className="home-project__tag">Finance</p>
              <h3 className="home-project__title">Rate Watch</h3>
              <p className="home-project__desc">Alerts when your utility provider files for a rate change — so you know before the bill arrives.</p>
            </div>

            <div className="home-project">
              <div className="home-project__header">
                <div className="home-project__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </div>
                <span className="home-project__status home-project__status--planned">Planned</span>
              </div>
              <p className="home-project__tag">Home</p>
              <h3 className="home-project__title">Home Efficiency Score</h3>
              <p className="home-project__desc">A simple score that benchmarks your home's energy use against comparable homes and shows where to cut.</p>
            </div>
          </div>
        </section>

        <section id="about" className="home-section">
          <div className="home-section__head">
            <p className="home-section__eyebrow">About</p>
            <h2 className="home-section__title">What we do</h2>
          </div>
          <div className="home-about">
            <div>
              <p className="home-about__lead">We build focused tools for problems that are technically solvable but practically ignored.</p>
              <p className="home-about__body">Most energy decisions happen in the dark — people don't know if they're on the right rate plan, whether solar makes sense for their roof, or how their usage compares. We build tools that change that.</p>
              <p className="home-about__body">Everything we ship is free, private, and runs entirely in your browser.</p>
            </div>
            <div className="home-about__pillars">
              <div className="home-about__pillar">
                <div className="home-about__pillar-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                </div>
                <div>
                  <strong>Data-driven</strong>
                  <p>We use your real usage data — not averages — so results are specific to you.</p>
                </div>
              </div>
              <div className="home-about__pillar">
                <div className="home-about__pillar-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <div>
                  <strong>Private by design</strong>
                  <p>Your files never leave your browser. No accounts, no tracking, no data retention.</p>
                </div>
              </div>
              <div className="home-about__pillar">
                <div className="home-about__pillar-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>
                <div>
                  <strong>Transparent math</strong>
                  <p>Every calculation is shown step by step. No black boxes.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="blog" className="home-section">
          <div className="home-section__head">
            <p className="home-section__eyebrow">Blog</p>
            <h2 className="home-section__title">Writing</h2>
            <p className="home-section__sub">Notes on energy, tools, and building in public.</p>
          </div>
          <div className="home-blog-grid">
            <div className="home-blog-card home-blog-card--stub">
              <p className="home-blog-card__tag">Energy</p>
              <h3 className="home-blog-card__title">Why your electricity rate plan probably isn't optimal</h3>
              <p className="home-blog-card__date">Coming soon</p>
            </div>
            <div className="home-blog-card home-blog-card--stub">
              <p className="home-blog-card__tag">Tools</p>
              <h3 className="home-blog-card__title">How we calculate natural gas plan costs (fixed fees matter more than you think)</h3>
              <p className="home-blog-card__date">Coming soon</p>
            </div>
            <div className="home-blog-card home-blog-card--stub">
              <p className="home-blog-card__tag">Solar</p>
              <h3 className="home-blog-card__title">Georgia Power's net metering changes and what they mean for solar ROI</h3>
              <p className="home-blog-card__date">Coming soon</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer__inner">
          <div className="home-footer__left">
            <span className="home-footer__wordmark">Lundy Labs</span>
            <p>Building practical tools for everyday decisions.</p>
          </div>
          <p className="home-footer__copy">© {new Date().getFullYear()} Lundy Labs LLC</p>
        </div>
      </footer>
    </>
  )
}
