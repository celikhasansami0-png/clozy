import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  description?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-indigo-600",
  iconBg = "bg-indigo-50",
  description,
  className,
}: MetricCardProps) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
          {change && (
            <p
              className={cn("mt-1 text-xs font-medium", {
                "text-emerald-600": changeType === "positive",
                "text-red-500": changeType === "negative",
                "text-slate-400": changeType === "neutral",
              })}
            >
              {change}
            </p>
          )}
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  )
}
