import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <div className="home-landing">
      <span className="home-landing__eyebrow">Practical energy savings</span>
      <h1 className="home-landing__title">Georgia Power Rate Plan Analyzer</h1>
      <p className="home-landing__sub">
        Upload your usage history and see exactly which rate plan saves you the most money.
      </p>
      <Link href="/power-analyzer" className={cn(buttonVariants({ size: 'lg' }), 'home-landing__cta')}>
        Try it now
        <ArrowRight size={16} />
      </Link>
      <p className="home-landing__meta">Built for clear side-by-side rate plan comparisons in a few clicks.</p>
    </div>
  )
}
