import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BioNova — Solar EPC & energy consulting project ops',
  description: 'Track solar projects, permits, team and commissioning — with @Bionova AI built in.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
