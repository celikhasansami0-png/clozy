import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Voltly — Project ops for solar EPC teams',
  description: 'Track solar projects, permits, crew and commissioning in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
