import Link from 'next/link'
import { headers } from 'next/headers'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function Nav() {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const isUtilityPilot = host.startsWith('utilitypilot.')

  if (isUtilityPilot) {
    return (
      <header className="site-nav">
        <div className="site-nav__inner">
          <a href="https://lundylabs.dev" className="site-nav__logo">
            Utility Pilot
          </a>
          <nav className="site-nav__links" aria-label="Primary navigation">
            <Link href="/power-analyzer" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Power Analyzer
            </Link>
            <Link href="/gas-analyzer" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Gas Analyzer
            </Link>
          </nav>
        </div>
      </header>
    )
  }

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
          <a href="https://utilitypilot.lundylabs.dev" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            Utility Pilot
          </a>
        </nav>
      </div>
    </header>
  )
}
