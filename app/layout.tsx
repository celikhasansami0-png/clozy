import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Engineering Autopilot OS — Academic Operating System",
  description:
    "Upload your academic material and the system will teach, train, organize, simulate, evaluate and optimize your entire academic journey.",
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
