import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Utility Pilot — Energy Bill Analyzers',
  description: 'Compare electricity and natural gas plans using your real usage data. Find out which plan saves you the most money.',
}

export default function UtilityPilotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
