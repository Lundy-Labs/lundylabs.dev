import Link from 'next/link'
import { ArrowRight, FileSpreadsheet, MapPin, Search, Target, Zap } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const projects = [
  {
    id: 'bill-analyzer',
    title: 'Georgia Power Bill Analyzer',
    description:
      'Upload your Georgia Power usage export and compare all five residential rate plans side by side to see which one actually costs less.',
    status: 'live' as const,
    tag: 'Public-interest tool',
    href: '/powerbill',
    Icon: FileSpreadsheet,
    features: [
      'Runs entirely in your browser — no data uploaded',
      'All 5 residential plans compared',
      'Annual cost breakdown with the math shown',
    ],
  },
  {
    id: 'utility-research',
    title: 'Utility Research',
    description:
      'Ongoing research into residential utility pricing, policy changes, and consumer impact across Georgia.',
    status: 'research' as const,
    tag: 'Research',
    href: null,
    Icon: Search,
    features: [],
  },
  {
    id: 'decision-tools',
    title: 'Decision Tools',
    description:
      'More lightweight tools that help households make smarter decisions using data they already have.',
    status: 'planned' as const,
    tag: 'Roadmap',
    href: null,
    Icon: Target,
    features: [],
  },
]

const blogPosts = [
  { title: 'Why we built the bill analyzer', tag: 'Product' },
  { title: 'How Georgia Power residential plans actually work', tag: 'Research' },
  { title: 'Small tools, real impact', tag: 'Philosophy' },
]

const statusLabel: Record<string, string> = {
  live: 'Live',
  research: 'Research',
  planned: 'Planned',
}

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero__inner">
          <p className="home-hero__tag">Lundy Labs · Think Tank</p>
          <h1 className="home-hero__title">Practical ideas. Useful tools.</h1>
          <p className="home-hero__copy">
            Lundy Labs is a small think tank building research and software that helps people make
            better decisions. We start in Georgia, with a focus on public-interest problems.
          </p>
          <div className="home-hero__actions">
            <Link href="/powerbill" className={cn(buttonVariants(), 'home-hero__cta')}>
              Try Bill Analyzer
              <ArrowRight size={15} />
            </Link>
            <Link
              href="#projects"
              className={cn(buttonVariants({ variant: 'ghost' }), 'home-hero__ghost')}
            >
              See our work
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature strip ── */}
      <div className="home-feature-strip">
        <div className="home-feature-strip__inner">
          <div className="home-feature-strip__left">
            <span className="home-feature-strip__eyebrow">
              <Zap size={13} />
              Live now
            </span>
            <p className="home-feature-strip__text">
              Are you on the right Georgia Power plan? Find out in minutes.
            </p>
          </div>
          <Link
            href="/powerbill"
            className={cn(
              buttonVariants({ size: 'sm', variant: 'outline' }),
              'home-feature-strip__cta',
            )}
          >
            Open analyzer
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="home-body">
        {/* ── Projects ── */}
        <section id="projects" className="home-section">
          <div className="home-section__head">
            <p className="home-section__eyebrow">Work</p>
            <h2 className="home-section__title">Projects</h2>
            <p className="home-section__sub">One live tool and more in progress.</p>
          </div>
          <div className="home-projects-grid">
            {projects.map(({ id, title, description, status, tag, href, Icon, features }) => (
              <div
                key={id}
                className={cn('home-project', status === 'live' && 'home-project--live')}
              >
                <div className="home-project__header">
                  <div className="home-project__icon">
                    <Icon size={17} />
                  </div>
                  <span className={cn('home-project__status', `home-project__status--${status}`)}>
                    {statusLabel[status]}
                  </span>
                </div>
                <p className="home-project__tag">{tag}</p>
                <h3 className="home-project__title">{title}</h3>
                <p className="home-project__desc">{description}</p>
                {features.length > 0 && (
                  <ul className="home-project__features">
                    {features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                {href && (
                  <Link
                    href={href}
                    className={cn(buttonVariants({ size: 'sm' }), 'home-project__cta')}
                  >
                    Open
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── About ── */}
        <section id="about" className="home-section">
          <div className="home-section__head">
            <p className="home-section__eyebrow">Who we are</p>
            <h2 className="home-section__title">About Us</h2>
          </div>
          <div className="home-about">
            <div className="home-about__left">
              <p className="home-about__lead">
                Lundy Labs is a research and product studio inside the Lundy family of work.
              </p>
              <p className="home-about__body">
                We focus on problems where data and product design need to live together — and where
                a clean, honest answer is more valuable than a complicated one.
              </p>
              <p className="home-about__body">
                Our work starts local, with a close eye on the systems affecting people in Georgia
                every day. We build tools that are lightweight, privacy-respecting, and built to
                actually get used.
              </p>
            </div>
            <div className="home-about__pillars">
              <div className="home-about__pillar">
                <div className="home-about__pillar-icon">
                  <Zap size={16} />
                </div>
                <div>
                  <strong>Applied Research</strong>
                  <p>
                    We turn practical questions into usable analysis, not reports that sit on a
                    shelf.
                  </p>
                </div>
              </div>
              <div className="home-about__pillar">
                <div className="home-about__pillar-icon">
                  <FileSpreadsheet size={16} />
                </div>
                <div>
                  <strong>Public Interest Tools</strong>
                  <p>
                    Lightweight products that help households and communities make better decisions.
                  </p>
                </div>
              </div>
              <div className="home-about__pillar">
                <div className="home-about__pillar-icon">
                  <MapPin size={16} />
                </div>
                <div>
                  <strong>Georgia First</strong>
                  <p>We start local, with eyes on the systems affecting Georgians every day.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Blog ── */}
        <section id="blog" className="home-section">
          <div className="home-section__head">
            <p className="home-section__eyebrow">Writing</p>
            <h2 className="home-section__title">Blog</h2>
            <p className="home-section__sub">Notes on our work, research, and ideas.</p>
          </div>
          <div className="home-blog-grid">
            {blogPosts.map(({ title, tag }) => (
              <div key={title} className="home-blog-card home-blog-card--stub">
                <span className="home-blog-card__tag">{tag}</span>
                <h3 className="home-blog-card__title">{title}</h3>
                <span className="home-blog-card__date">Coming soon</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="home-footer__inner">
          <div className="home-footer__left">
            <span className="home-footer__wordmark">Lundy Labs</span>
            <p>Independent thinking, practical outputs.</p>
          </div>
          <p className="home-footer__copy">© {new Date().getFullYear()} Lundy Labs LLC</p>
        </div>
      </footer>
    </>
  )
}
