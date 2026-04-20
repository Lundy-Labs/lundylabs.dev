import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Natural Gas Plan Analyzer | Lundy Labs',
  description: 'Upload your monthly gas usage and find the cheapest natural gas plan for your household. Compare providers in Georgia, Florida, Tennessee, North Carolina, and South Carolina.',
}

export default function GasAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
