"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Assignment } from "@/types"

export function useAssignments(courseId?: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    let q = supabase.from("assignments").select("*").order("due_date", { ascending: true, nullsFirst: false })
    if (courseId) q = q.eq("course_id", courseId)
    const { data } = await q
    setAssignments((data as Assignment[]) ?? [])
    setLoading(false)
  }, [supabase, courseId])

  useEffect(() => { fetchAssignments() }, [fetchAssignments])

  const createAssignment = async (assignment: Omit<Assignment, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("assignments").insert([assignment]).select().single()
    if (error) throw error
    setAssignments((prev) => [data as Assignment, ...prev])
    return data as Assignment
  }

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    const { data, error } = await supabase
      .from("assignments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error) throw error
    setAssignments((prev) => prev.map((a) => (a.id === id ? (data as Assignment) : a)))
    return data as Assignment
  }

  const deleteAssignment = async (id: string) => {
    const { error } = await supabase.from("assignments").delete().eq("id", id)
    if (error) throw error
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }

  const active = assignments.filter((a) => a.status !== "submitted")
  const submitted = assignments.filter((a) => a.status === "submitted")

  return { assignments, active, submitted, loading, refetch: fetchAssignments, createAssignment, updateAssignment, deleteAssignment }
}
