import { cn } from "@/lib/utils"

interface ScoreRingProps {
  score: number // 0-100
  size?: number
  className?: string
}

function scoreColor(score: number) {
  if (score >= 80) return "#22C55E"
  if (score >= 65) return "#F59E0B"
  if (score >= 45) return "#2D5F9A"
  return "#94A3B8"
}

export function ScoreRing({ score, size = 44, className }: ScoreRingProps) {
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference - (clamped / 100) * circumference
  const color = scoreColor(clamped)

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[11px] font-bold" style={{ color }}>
        {clamped}
      </span>
    </div>
  )
}
