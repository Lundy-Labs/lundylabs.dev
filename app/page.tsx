import Link from 'next/link'
import { ArrowRight, BarChart3, FileSpreadsheet, Lightbulb, MapPin } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

const focusAreas = [
  {
    title: 'Applied Research',
    description: 'We turn practical questions into usable analysis instead of reports that sit on a shelf.',
    icon: Lightbulb,
  },
  {
    title: 'Public Interest Tools',
    description: 'We build lightweight products that help households and communities make better decisions.',
    icon: BarChart3,
  },
  {
    title: 'Georgia Context',
    description: 'Our work starts local, with a close eye on the systems affecting people in Georgia every day.',
    icon: MapPin,
  },
]

const signals = [
  'Research',
  'Strategy',
  'Public-interest software',
  'Georgia',
]

export default function Home() {
  return (
    <main className="home-shell">
      <section className="home-hero">
        <div className="home-hero__intro">
          <div className="home-topline">
            <span className="home-wordmark">Lundy Labs</span>
            <span className="home-topline__dot" />
            <span className="home-topline__text">Part of the Lundy family</span>
          </div>
          <Badge variant="outline" className="home-kicker">
            Think tank
          </Badge>
          <h1 className="home-title">A small think tank for practical ideas.</h1>
          <p className="home-sub">
            Lundy Labs sits inside a broader family of work. Here, the focus is research, strategy, and simple software
            that helps people make better decisions in the real world.
          </p>
          <div className="home-actions">
            <Link href="/powerbill" className={cn(buttonVariants())}>
              Open the analyzer
            </Link>
            <Link href="#current-work" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'home-link-button')}>
              Current work
            </Link>
          </div>
          <div className="home-signal-row">
            {signals.map((signal) => (
              <div key={signal} className="home-signal-chip">
                {signal}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-story">
        <div className="home-story__intro">
          <p className="home-section__label">How we work</p>
          <h2 className="home-section__title">Quietly opinionated. Deliberately useful.</h2>
          <p className="home-story__copy">
            We focus on work where analysis and product design need to live together, and where a clean answer is more
            valuable than a complicated one.
          </p>
        </div>
        <div className="home-grid">
          {focusAreas.map(({ title, description, icon: Icon }, index) => (
            <Card key={title} size="sm" className="home-info-card">
              <CardHeader>
                <div className="home-info-card__meta">
                  <div className="home-info-card__icon">
                    <Icon size={18} />
                  </div>
                  <span className="home-info-card__index">0{index + 1}</span>
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="current-work" className="home-section home-section--feature">
        <div className="home-section__heading">
          <p className="home-section__label">Current work</p>
          <h2 className="home-section__title">One live product so far.</h2>
        </div>
        <Card className="home-project-card">
          <CardHeader className="home-project-card__header">
            <div className="home-project-card__eyebrow">
              <FileSpreadsheet size={16} />
              Current functionality
            </div>
            <div className="home-project-card__top">
              <CardTitle>Georgia Power Bill Analyzer</CardTitle>
              <Badge variant="outline" className="home-badge-live">
                Live
              </Badge>
            </div>
            <CardDescription>
              Upload your Georgia Power usage export and compare residential plans side by side to see which option
              actually costs less.
            </CardDescription>
          </CardHeader>
          <CardContent className="home-project-card__content">
            <div className="home-project-feature">
              <span className="home-project-feature__label">Input</span>
              <strong>Georgia Power usage export</strong>
            </div>
            <div className="home-project-feature">
              <span className="home-project-feature__label">What you get</span>
              <strong>Annual cost comparison across plans</strong>
            </div>
            <div className="home-project-feature">
              <span className="home-project-feature__label">Built for</span>
              <strong>Residents choosing the right rate</strong>
            </div>
          </CardContent>
          <div className="home-project-card__cta-row">
            <Link href="/powerbill" className={cn(buttonVariants({ size: 'xs' }), 'home-project-card__button')}>
              Open analyzer
              <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      </section>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} Lundy Labs LLC</p>
        <p>Independent thinking, practical outputs.</p>
      </footer>
    </main>
  )
}
