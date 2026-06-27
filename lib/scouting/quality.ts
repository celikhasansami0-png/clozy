import type { MessageQuality } from "@/types/scouting"
import { SPAM_TRIGGERS } from "./constants"

/**
 * Message Quality Gate (PRD 6.2.4).
 * Reject for spam / length / no personalization; warn for soft issues;
 * otherwise approve. Pure function — safe on client and server.
 */
export function runQualityGate(content: string): MessageQuality {
  const text = content.trim()
  const lower = text.toLowerCase()
  const reasons: string[] = []

  // Hard rejects
  const spamHits = SPAM_TRIGGERS.filter((w) => lower.includes(w))
  if (spamHits.length > 0) reasons.push(`Contains spam trigger word(s): ${spamHits.join(", ")}`)
  if (text.length > 900) reasons.push("Too long — keep it concise and scannable")
  if (text.length === 0) reasons.push("Message is empty")
  const hasPersonalization = /\{\{|\bnoticed\b|\bsaw\b|\byour\b|\byou'?re\b/i.test(text)
  if (!hasPersonalization) reasons.push("No personalization — reference something specific")

  if (reasons.length > 0) {
    return { verdict: "reject", reasons }
  }

  // Soft warnings
  const warnings: string[] = []
  const hasCTA = /\?|worth|open to|happy to|book|chat|call|connect|let me know/i.test(lower)
  if (!hasCTA) warnings.push("No clear call-to-action")
  if (/buy|deal|discount|pricing|sign up now/i.test(lower)) warnings.push("Sounds salesy — soften the pitch")
  if (/^(hi|hey|hello)[\s,!]+(there|friend)?$/i.test(text.split("\n")[0].trim().slice(0, 20)))
    warnings.push("Opening is generic")

  if (warnings.length > 0) {
    return { verdict: "warn", reasons: warnings }
  }

  return { verdict: "approve", reasons: ["Personalized, concise, human-sounding, clear next step"] }
}
