import type { Niche, NicheId } from "@/types"

export const NICHES: Record<NicheId, Niche> = {
  med_spa: {
    id: "med_spa",
    label: "Med Spa",
    description: "Medical spas, aesthetic clinics, and wellness centers",
    tone: "empathetic",
    icon: "✨",
    color: "#f0abfc",
    outreachStyle: "Lead with transformation, not treatments. Focus on confidence and results.",
    contentFocus: ["before/after results", "treatment education", "client testimonials", "luxury experience"],
    painPoints: [
      "Inconsistent client flow",
      "High competition in local market",
      "Difficulty converting consultations to bookings",
      "Retaining existing clients",
    ],
    ctaApproach: "Free consultation or complimentary assessment",
  },

  agencies: {
    id: "agencies",
    label: "Marketing Agencies",
    description: "Digital marketing, advertising, and creative agencies",
    tone: "bold",
    icon: "🚀",
    color: "#93c5fd",
    outreachStyle: "Lead with ROI data and case studies. Speak to growth metrics.",
    contentFocus: ["case studies", "ROI data", "industry insights", "campaign results"],
    painPoints: [
      "Difficulty demonstrating ROI",
      "Client retention and churn",
      "Scaling without sacrificing quality",
      "Standing out in a crowded market",
    ],
    ctaApproach: "Free audit or growth opportunity assessment",
  },

  saas_founders: {
    id: "saas_founders",
    label: "SaaS Founders",
    description: "B2B SaaS startups, product companies, and tech founders",
    tone: "professional",
    icon: "💻",
    color: "#6ee7b7",
    outreachStyle: "Lead with product-led growth insights and scalability challenges.",
    contentFocus: ["growth strategies", "product metrics", "fundraising", "team building", "market insights"],
    painPoints: [
      "User acquisition costs",
      "Churn and retention",
      "Moving from founder-led sales",
      "Scaling beyond initial traction",
    ],
    ctaApproach: "Strategy call for scaling their go-to-market motion",
  },

  coaches: {
    id: "coaches",
    label: "Business Coaches",
    description: "Executive coaches, business coaches, and consultants",
    tone: "authoritative",
    icon: "🎯",
    color: "#fcd34d",
    outreachStyle: "Lead with transformation story and results. Authority-first positioning.",
    contentFocus: ["client wins", "frameworks", "mindset shifts", "business strategy", "personal brand"],
    painPoints: [
      "Proving credibility and ROI",
      "Attracting premium clients",
      "Escaping the feast-and-famine cycle",
      "Packaging and pricing services",
    ],
    ctaApproach: "Strategy session or free breakthrough call",
  },

  real_estate: {
    id: "real_estate",
    label: "Real Estate",
    description: "Real estate agents, brokers, and property investors",
    tone: "professional",
    icon: "🏠",
    color: "#86efac",
    outreachStyle: "Lead with market insights and investment opportunities.",
    contentFocus: ["market data", "investment tips", "property showcases", "client success stories"],
    painPoints: [
      "Inconsistent lead generation",
      "Low quality leads",
      "Long sales cycles",
      "Differentiating from other agents",
    ],
    ctaApproach: "Free market analysis or investment consultation",
  },

  consultants: {
    id: "consultants",
    label: "Consultants",
    description: "Strategy, operations, and management consultants",
    tone: "professional",
    icon: "📊",
    color: "#c4b5fd",
    outreachStyle: "Lead with expertise, frameworks, and quantifiable outcomes.",
    contentFocus: ["frameworks", "case studies", "industry trends", "thought leadership"],
    painPoints: [
      "Long sales cycles with enterprise clients",
      "Positioning as premium vs. generalist",
      "Building credibility in new verticals",
      "Scaling beyond referrals",
    ],
    ctaApproach: "Free diagnostic or scoping call",
  },

  ecommerce: {
    id: "ecommerce",
    label: "E-Commerce",
    description: "Online stores, DTC brands, and e-commerce operators",
    tone: "bold",
    icon: "🛍️",
    color: "#fdba74",
    outreachStyle: "Lead with revenue optimization and conversion metrics.",
    contentFocus: ["revenue growth", "conversion optimization", "product launches", "brand story"],
    painPoints: [
      "Rising ad costs",
      "Customer acquisition cost",
      "Inventory and supply chain",
      "Competing with Amazon",
    ],
    ctaApproach: "Free revenue audit or growth analysis",
  },

  financial_advisors: {
    id: "financial_advisors",
    label: "Financial Advisors",
    description: "Financial planners, wealth managers, and investment advisors",
    tone: "authoritative",
    icon: "💼",
    color: "#67e8f9",
    outreachStyle: "Lead with security, trust, and long-term wealth outcomes.",
    contentFocus: ["financial tips", "market insights", "retirement planning", "wealth building"],
    painPoints: [
      "Building trust with high-net-worth prospects",
      "Compliance-friendly content creation",
      "Differentiating from robo-advisors",
      "Attracting ideal client profiles",
    ],
    ctaApproach: "Complimentary financial review or portfolio analysis",
  },

  law_firms: {
    id: "law_firms",
    label: "Law Firms",
    description: "Business attorneys, law firms, and legal service providers",
    tone: "authoritative",
    icon: "⚖️",
    color: "#a5b4fc",
    outreachStyle: "Lead with risk mitigation and business protection.",
    contentFocus: ["legal insights", "risk avoidance", "case wins", "business protection"],
    painPoints: [
      "Standing out in competitive legal market",
      "Attracting business clients vs. individual",
      "Building referral network",
      "Demonstrating ROI of legal services",
    ],
    ctaApproach: "Free legal consultation or business risk review",
  },

  recruiters: {
    id: "recruiters",
    label: "Recruiters",
    description: "Executive recruiters, talent agencies, and HR consultants",
    tone: "professional",
    icon: "🤝",
    color: "#fbcfe8",
    outreachStyle: "Lead with talent acquisition efficiency and quality of hire.",
    contentFocus: ["talent insights", "hiring tips", "market salary data", "company culture"],
    painPoints: [
      "Standing out from other recruiters",
      "Building exclusive client relationships",
      "Finding passive candidates",
      "Demonstrating placement quality",
    ],
    ctaApproach: "Free talent acquisition strategy session",
  },
}

export const NICHE_LIST = Object.values(NICHES)

export function getNiche(id: NicheId): Niche {
  return NICHES[id]
}

export function getNicheLabel(id: NicheId): string {
  return NICHES[id]?.label ?? id
}

export function getNichesByTone(tone: Niche["tone"]): Niche[] {
  return NICHE_LIST.filter((n) => n.tone === tone)
}

export function buildNicheContext(niche: Niche, input: {
  service: string
  target_client: string
  offer_price: number
  revenue_goal: number
}): string {
  return `
Niche: ${niche.label}
Tone: ${niche.tone}
Outreach Style: ${niche.outreachStyle}
Service: ${input.service}
Target Client: ${input.target_client}
Offer Price: $${input.offer_price}
Revenue Goal: $${input.revenue_goal}
Pain Points: ${niche.painPoints.join(", ")}
Content Focus: ${niche.contentFocus.join(", ")}
CTA Approach: ${niche.ctaApproach}
  `.trim()
}
