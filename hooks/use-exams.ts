"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Exam, ExamAttempt } from "@/types"

export function useExams(courseId?: string) {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchExams = useCallback(async () => {
    setLoading(true)
    let q = supabase.from("exams").select("*").order("created_at", { ascending: false })
    if (courseId) q = q.eq("course_id", courseId)
    const { data } = await q
    setExams((data as Exam[]) ?? [])
    setLoading(false)
  }, [supabase, courseId])

  useEffect(() => { fetchExams() }, [fetchExams])

  const createExam = async (exam: Omit<Exam, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("exams").insert([exam]).select().single()
    if (error) throw error
    setExams((prev) => [data as Exam, ...prev])
    return data as Exam
  }

  const updateExam = async (id: string, updates: Partial<Exam>) => {
    const { data, error } = await supabase
      .from("exams")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error) throw error
    setExams((prev) => prev.map((e) => (e.id === id ? (data as Exam) : e)))
    return data as Exam
  }

  const deleteExam = async (id: string) => {
    const { error } = await supabase.from("exams").delete().eq("id", id)
    if (error) throw error
    setExams((prev) => prev.filter((e) => e.id !== id))
  }

  const submitAttempt = async (attempt: Omit<ExamAttempt, "id" | "user_id">) => {
    const { data, error } = await supabase.from("exam_attempts").insert([attempt]).select().single()
    if (error) throw error
    return data as ExamAttempt
  }

  return { exams, loading, refetch: fetchExams, createExam, updateExam, deleteExam, submitAttempt }
}
