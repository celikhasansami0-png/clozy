"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { AcademicAnalytics } from "@/types"

export function useAnalytics() {
  const [overview, setOverview] = useState<AcademicAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)

    const { data: courses } = await supabase.from("courses").select("id, status")
    const { data: exams } = await supabase.from("exams").select("id, status")
    const { data: attempts } = await supabase.from("exam_attempts").select("score, total_marks")
    const { data: assignments } = await supabase.from("assignments").select("id, status")
    const { data: flashcards } = await supabase.from("flashcards").select("id")
    const { data: sessions } = await supabase.from("learning_sessions").select("duration_minutes, created_at")

    const activeCourses = (courses ?? []).filter((c) => c.status === "active").length
    const completedCourses = (courses ?? []).filter((c) => c.status === "completed").length
    const examsTaken = (attempts ?? []).length
    const avgScore = examsTaken > 0
      ? (attempts ?? []).reduce((sum, a) => sum + (a.score ?? 0) / a.total_marks * 100, 0) / examsTaken
      : 0

    const submittedAssignments = (assignments ?? []).filter((a) => a.status === "submitted").length
    const pendingAssignments = (assignments ?? []).filter((a) => a.status !== "submitted").length

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    const studyHoursThisWeek = (sessions ?? [])
      .filter((s) => new Date(s.created_at) >= weekStart)
      .reduce((sum, s) => sum + s.duration_minutes, 0) / 60

    const today = new Date().toISOString().slice(0, 10)
    const flashcardsToday = (flashcards ?? []).length

    setOverview({
      gpa: null,
      courses_active: activeCourses,
      courses_completed: completedCourses,
      exams_taken: examsTaken,
      exams_average_score: Math.round(avgScore),
      assignments_submitted: submittedAssignments,
      assignments_pending: pendingAssignments,
      study_hours_this_week: Math.round(studyHoursThisWeek * 10) / 10,
      flashcards_reviewed_today: flashcardsToday,
      exam_readiness_score: 0,
    })

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { overview, loading, refetch: fetchAnalytics }
}
