import type { Metadata, Viewport } from "next"
import "./globals.css"
import { PWARegister } from "@/components/pwa-register"

export const metadata: Metadata = {
  title: "Scouting — AI LinkedIn Outreach for SaaS",
  description:
    "Define your ideal customer. Scouting finds them, researches them, writes for them, follows up — and stops only when they reply.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Scouting",
  },
}

export const viewport: Viewport = {
  themeColor: "#0F1B35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  )
}
