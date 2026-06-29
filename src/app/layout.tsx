import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Voltly — Project ops for electrical contractors',
  description: 'Track jobs, permits, crew and inspections in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
