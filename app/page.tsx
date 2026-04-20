import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <div className="home-landing">
      <span className="home-landing__eyebrow">Practical energy savings</span>
      <h1 className="home-landing__title">Energy Bill Analyzers</h1>
      <p className="home-landing__sub">
        Upload your usage history and see exactly which plan saves you the most money — for electricity and natural gas.
      </p>
      <div className="home-landing__tools">
        <Link href="/power-analyzer" className="home-landing__tool-card">
          <div className="home-landing__tool-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <p className="home-landing__tool-name">Georgia Power Analyzer</p>
            <p className="home-landing__tool-desc">Compare 5 residential rate plans using your hourly usage data</p>
          </div>
          <ArrowRight size={16} className="home-landing__tool-arrow" />
        </Link>
        <Link href="/gas-analyzer" className="home-landing__tool-card">
          <div className="home-landing__tool-icon home-landing__tool-icon--gas">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 8v4l3 3" />
              <path d="M9 3.6A9 9 0 0 0 3.6 9" />
            </svg>
          </div>
          <div>
            <p className="home-landing__tool-name">Natural Gas Plan Analyzer</p>
            <p className="home-landing__tool-desc">Compare providers in GA, FL, TN, NC &amp; SC — fixed fees included</p>
          </div>
          <ArrowRight size={16} className="home-landing__tool-arrow" />
        </Link>
      </div>
      <p className="home-landing__meta">Built for clear side-by-side rate plan comparisons in a few clicks.</p>
    </div>
  )
}
