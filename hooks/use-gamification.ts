"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface GamificationState {
  xp: number
  streak: number
  level: number
  xpToNextLevel: number
  badges: string[]
  todayActive: boolean
}

const XP_PER_LEVEL = 200

export const BADGES = {
  FIRST_SESSION: { id: "first_session", label: "First Steps", emoji: "🎯", desc: "Complete your first study session" },
  STREAK_3: { id: "streak_3", label: "On Fire", emoji: "🔥", desc: "3-day study streak" },
  STREAK_7: { id: "streak_7", label: "Week Warrior", emoji: "⚔️", desc: "7-day study streak" },
  STREAK_30: { id: "streak_30", label: "Iron Will", emoji: "🏆", desc: "30-day study streak" },
  CARDS_100: { id: "cards_100", label: "Card Master", emoji: "🃏", desc: "Review 100 flashcards" },
  EXAMS_5: { id: "exams_5", label: "Exam Ready", emoji: "📝", desc: "Complete 5 exams" },
  ASSIGNMENTS_10: { id: "assignments_10", label: "Deadline Crusher", emoji: "✅", desc: "Submit 10 assignments" },
  HOURS_10: { id: "hours_10", label: "Deep Focus", emoji: "🧠", desc: "Study for 10 total hours" },
}

function computeLevel(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpInLevel = xp % XP_PER_LEVEL
  const xpToNext = XP_PER_LEVEL - xpInLevel
  return { level, xpInLevel, xpToNextLevel: xpToNext }
}

function computeStreak(sessions: { created_at: string }[]): number {
  if (!sessions.length) return 0
  const days = [...new Set(sessions.map((s) => s.created_at.slice(0, 10)))].sort().reverse()
  let streak = 0
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (days[0] !== today && days[0] !== yesterday) return 0
  let expected = days[0] === today ? today : yesterday
  for (const day of days) {
    if (day === expected) {
      streak++
      const d = new Date(expected)
      d.setDate(d.getDate() - 1)
      expected = d.toISOString().slice(0, 10)
    } else break
  }
  return streak
}

function computeBadges(params: {
  streak: number
  totalCards: number
  examsCompleted: number
  assignmentsSubmitted: number
  studyHoursTotal: number
  sessionCount: number
}): string[] {
  const earned: string[] = []
  if (params.sessionCount >= 1) earned.push(BADGES.FIRST_SESSION.id)
  if (params.streak >= 3) earned.push(BADGES.STREAK_3.id)
  if (params.streak >= 7) earned.push(BADGES.STREAK_7.id)
  if (params.streak >= 30) earned.push(BADGES.STREAK_30.id)
  if (params.totalCards >= 100) earned.push(BADGES.CARDS_100.id)
  if (params.examsCompleted >= 5) earned.push(BADGES.EXAMS_5.id)
  if (params.assignmentsSubmitted >= 10) earned.push(BADGES.ASSIGNMENTS_10.id)
  if (params.studyHoursTotal >= 10) earned.push(BADGES.HOURS_10.id)
  return earned
}

export function useGamification() {
  const [state, setState] = useState<GamificationState>({
    xp: 0, streak: 0, level: 1, xpToNextLevel: XP_PER_LEVEL, badges: [], todayActive: false,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const compute = useCallback(async () => {
    setLoading(true)
    try {
      const [
        { data: sessions },
        { data: flashcards },
        { data: attempts },
        { data: assignments },
      ] = await Promise.all([
        supabase.from("learning_sessions").select("created_at, duration_minutes"),
        supabase.from("flashcards").select("repetitions"),
        supabase.from("exam_attempts").select("id"),
        supabase.from("assignments").select("status"),
      ])

      const streak = computeStreak(sessions ?? [])
      const totalCards = (flashcards ?? []).reduce((sum, f) => sum + (f.repetitions ?? 0), 0)
      const examsCompleted = (attempts ?? []).length
      const assignmentsSubmitted = (assignments ?? []).filter((a) => a.status === "submitted").length
      const studyHoursTotal = (sessions ?? []).reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) / 60
      const sessionCount = (sessions ?? []).length

      // XP calculation
      const xp =
        sessionCount * 10 +
        totalCards * 5 +
        examsCompleted * 15 +
        assignmentsSubmitted * 20 +
        Math.floor(studyHoursTotal) * 8

      const { level, xpToNextLevel } = computeLevel(xp)
      const badges = computeBadges({ streak, totalCards, examsCompleted, assignmentsSubmitted, studyHoursTotal, sessionCount })

      const todayStr = new Date().toISOString().slice(0, 10)
      const todayActive = (sessions ?? []).some((s) => s.created_at.slice(0, 10) === todayStr)

      setState({ xp, streak, level, xpToNextLevel, badges, todayActive })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { compute() }, [compute])

  return { ...state, loading, refetch: compute }
}
