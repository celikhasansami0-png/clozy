import {
  Banknote,
  UserPlus,
  MessageSquare,
  Swords,
  TrendingUp,
  Cpu,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { INTENT_SIGNAL_META } from "@/lib/scouting/constants"
import type { IntentSignal } from "@/types/scouting"

const ICONS: Record<string, LucideIcon> = {
  Banknote,
  UserPlus,
  MessageSquare,
  Swords,
  TrendingUp,
  Cpu,
}

interface IntentBadgeProps {
  signal: IntentSignal
  showLabel?: boolean
  className?: string
}

export function IntentBadge({ signal, showLabel = true, className }: IntentBadgeProps) {
  const meta = INTENT_SIGNAL_META[signal.type]
  const Icon = ICONS[meta.icon] ?? Banknote
  return (
    <span
      title={signal.detail}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        meta.pill,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel && (signal.label || meta.label)}
    </span>
  )
}

interface IntentDotsProps {
  signals: IntentSignal[]
  max?: number
}

export function IntentDots({ signals, max = 4 }: IntentDotsProps) {
  if (signals.length === 0) {
    return <span className="text-[11px] text-slate-400">No signals yet</span>
  }
  return (
    <div className="flex items-center gap-1">
      {signals.slice(0, max).map((s, i) => {
        const meta = INTENT_SIGNAL_META[s.type]
        return <span key={i} title={`${s.label}: ${s.detail}`} className={cn("h-2 w-2 rounded-full", meta.dot)} />
      })}
      {signals.length > max && <span className="text-[10px] text-slate-400">+{signals.length - max}</span>}
    </div>
  )
}
