import type { PricingPlan, LeadStage, TaskType } from "@/types"

export const APP_NAME = "LinkedIn Growth OS"
export const APP_DESCRIPTION = "Revenue Operating System for service businesses"

export const LEAD_STAGES: { id: LeadStage; label: string; color: string; description: string }[] = [
  { id: "new", label: "New", color: "#94a3b8", description: "Identified prospect" },
  { id: "contacted", label: "Contacted", color: "#60a5fa", description: "Outreach sent" },
  { id: "replied", label: "Replied", color: "#a78bfa", description: "Responded to outreach" },
  { id: "booked", label: "Booked", color: "#f59e0b", description: "Call or meeting scheduled" },
  { id: "closed", label: "Closed", color: "#10b981", description: "Deal won" },
  { id: "lost", label: "Lost", color: "#ef4444", description: "Deal lost" },
]

export const TASK_TYPES: { id: TaskType; label: string; icon: string }[] = [
  { id: "send_connection_request", label: "Send Connection Request", icon: "UserPlus" },
  { id: "send_follow_up", label: "Send Follow-up", icon: "MessageSquare" },
  { id: "post_content", label: "Post Content", icon: "FileText" },
  { id: "review_replies", label: "Review Replies", icon: "Mail" },
  { id: "book_call", label: "Book Call", icon: "Phone" },
  { id: "send_proposal", label: "Send Proposal", icon: "Send" },
  { id: "follow_up_call", label: "Follow-up Call", icon: "PhoneCall" },
  { id: "custom", label: "Custom Task", icon: "CheckSquare" },
]

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    tier: "free",
    price: 0,
    interval: "month",
    stripe_price_id: "",
    features: [
      "2 growth systems per month",
      "Up to 25 leads",
      "Basic outreach scripts",
      "7-day execution plans",
      "Pipeline tracking",
    ],
    cta: "Get Started Free",
  },
  {
    id: "pro_monthly",
    name: "Pro",
    tier: "pro",
    price: 97,
    interval: "month",
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
    highlighted: true,
    features: [
      "Unlimited growth systems",
      "Unlimited leads",
      "Full template library",
      "Advanced AI scripts",
      "14-day execution plans",
      "Analytics dashboard",
      "CSV export",
      "Priority support",
    ],
    cta: "Start Pro Trial",
  },
  {
    id: "pro_annual",
    name: "Pro Annual",
    tier: "pro",
    price: 79,
    interval: "year",
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID ?? "",
    features: [
      "Everything in Pro",
      "2 months free",
      "Early access to new features",
    ],
    cta: "Save 20% Annually",
  },
]

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/growth", label: "Growth Generator", icon: "Zap" },
  { href: "/crm", label: "Pipeline & CRM", icon: "Users" },
  { href: "/templates", label: "Templates", icon: "Library" },
  { href: "/tasks", label: "Execution Plan", icon: "CheckSquare" },
  { href: "/analytics", label: "Analytics", icon: "BarChart2" },
  { href: "/billing", label: "Billing", icon: "CreditCard" },
]

export const PIPELINE_VALUE_PER_STAGE: Record<LeadStage, number> = {
  new: 0.05,
  contacted: 0.1,
  replied: 0.25,
  booked: 0.5,
  closed: 1.0,
  lost: 0,
}
