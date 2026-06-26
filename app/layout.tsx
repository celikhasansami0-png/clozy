import type { Metadata, Viewport } from "next"
import "./globals.css"
import { PWARegister } from "@/components/pwa-register"

export const metadata: Metadata = {
  title: "Engineering Autopilot OS — Academic Operating System",
  description:
    "Upload your academic material and the system will teach, train, organize, simulate, evaluate and optimize your entire academic journey.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Autopilot OS",
  },
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
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
