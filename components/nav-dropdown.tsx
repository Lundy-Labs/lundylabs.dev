'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

const products = [
  {
    href: 'https://utilitypilot.lundylabs.dev/power-analyzer',
    label: 'Power Analyzer',
    description: 'Compare electricity rate plans with your real usage data.',
    external: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    href: 'https://utilitypilot.lundylabs.dev/gas-analyzer',
    label: 'Gas Analyzer',
    description: 'Find the cheapest natural gas plan across GA, FL, TN, NC, SC.',
    external: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 22c5 0 8-3.5 8-7.5 0-2.5-1.5-4.5-3-6-0.5 2-2 3-2 3s-1-3-2.5-5C11.5 9 9 12 9 12s-1-1.5-1-3c-1.5 1.5-3 3.5-3 6.5C5 18.5 8 22 12 22z" />
      </svg>
    ),
  },
  {
    href: '/#projects',
    label: 'Rate Watch',
    description: 'Alerts when your utility files for a rate change.',
    badge: 'Soon',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
]

export function NavDropdown() {
  const [open, setOpen] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setOpen(true)
  }

  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div
      className="nav-dropdown-root"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button className="site-nav__link nav-dropdown-trigger" aria-expanded={open}>
        Products
        <ChevronDown
          size={13}
          className="nav-dropdown-chevron"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <div className={cn('nav-dropdown-panel', open && 'nav-dropdown-panel--open')}>
        <div className="nav-dropdown-header">
          <p className="nav-dropdown-header__eyebrow">Utility Pilot</p>
          <p className="nav-dropdown-header__sub">Free tools to cut your energy bills</p>
        </div>
        <div className="nav-dropdown-items">
          {products.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn('nav-dropdown-item', item.badge && 'nav-dropdown-item--muted')}
            >
              <span className="nav-dropdown-item__icon">{item.icon}</span>
              <span className="nav-dropdown-item__body">
                <span className="nav-dropdown-item__label">
                  {item.label}
                  {item.badge && <span className="nav-dropdown-item__badge">{item.badge}</span>}
                </span>
                <span className="nav-dropdown-item__desc">{item.description}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
