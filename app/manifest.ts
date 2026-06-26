import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Autopilot OS",
    short_name: "Autopilot OS",
    description: "AI-powered academic operating system for engineering students",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    orientation: "portrait",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    screenshots: [],
    shortcuts: [
      { name: "Flashcards", url: "/flashcards", description: "Review due flashcards" },
      { name: "Learn", url: "/learn", description: "Study materials" },
    ],
  }
}
