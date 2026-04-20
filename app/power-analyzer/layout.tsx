import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Power Rate Plan Analyzer | Lundy Labs',
  description: 'Upload your hourly electricity usage and instantly compare every rate plan from your provider. Find out if switching plans could save you hundreds a year.',
}

export default function PowerBillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
