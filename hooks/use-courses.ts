"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Course } from "@/types"

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })
    setCourses((data as Course[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  const createCourse = async (course: Omit<Course, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("courses").insert([course]).select().single()
    if (error) throw error
    setCourses((prev) => [data as Course, ...prev])
    return data as Course
  }

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    const { data, error } = await supabase
      .from("courses")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error) throw error
    setCourses((prev) => prev.map((c) => (c.id === id ? (data as Course) : c)))
    return data as Course
  }

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id)
    if (error) throw error
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  const activeCourses = courses.filter((c) => c.status === "active")
  const completedCourses = courses.filter((c) => c.status === "completed")

  return { courses, activeCourses, completedCourses, loading, refetch: fetchCourses, createCourse, updateCourse, deleteCourse }
}
