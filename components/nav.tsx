import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Nav() {
  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <Link href="/" className="site-nav__logo">
          Lundy Labs
        </Link>
        <nav className="site-nav__links" aria-label="Primary navigation">
          <Link href="/#about" className="site-nav__link">About</Link>
          <Link href="/#projects" className="site-nav__link">Projects</Link>
          <Link href="/#blog" className="site-nav__link">Blog</Link>
          <Link href="/power-analyzer" className="site-nav__link">Electric Analyzer</Link>
          <Link href="/gas-analyzer" className={cn(buttonVariants({ size: 'sm' }))}>
            Gas Analyzer
          </Link>
        </nav>
      </div>
    </header>
  )
}
