import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "LinkedIn Growth OS — Revenue Operating System",
  description:
    "The complete Revenue Operating System for service businesses — generate clients, manage pipeline, track leads, and measure performance.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
