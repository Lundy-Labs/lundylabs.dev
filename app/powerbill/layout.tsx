import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Power Bill Analyzer | Lundy Labs',
  description: 'Upload your Georgia Power usage data and find the cheapest residential rate plan for your household.',
}

export default function PowerBillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
