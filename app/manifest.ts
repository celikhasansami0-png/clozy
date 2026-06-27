import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scouting — AI LinkedIn Outreach",
    short_name: "Scouting",
    description: "AI-powered LinkedIn B2B outreach platform for SaaS teams",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0F1B35",
    orientation: "portrait",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    screenshots: [],
    shortcuts: [
      { name: "Inbox", url: "/inbox", description: "Reply intelligence" },
      { name: "Scout", url: "/scout", description: "Find new leads" },
    ],
  }
}
