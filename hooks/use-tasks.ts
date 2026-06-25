"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { AcademicTask, TaskStatus } from "@/types"

export function useTasks(courseId?: string) {
  const [tasks, setTasks] = useState<AcademicTask[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    let query = supabase.from("academic_tasks").select("*").order("due_date", { ascending: true })
    if (courseId) query = query.eq("course_id", courseId)

    const { data } = await query
    setTasks((data as AcademicTask[]) ?? [])
    setLoading(false)
  }, [supabase, courseId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (task: Omit<AcademicTask, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("academic_tasks").insert([task]).select().single()
    if (error) throw error
    setTasks((prev) => [...prev, data as AcademicTask])
    return data as AcademicTask
  }

  const updateTask = async (id: string, updates: Partial<AcademicTask>) => {
    const { data, error } = await supabase
      .from("academic_tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    setTasks((prev) => prev.map((t) => (t.id === id ? (data as AcademicTask) : t)))
    return data as AcademicTask
  }

  const completeTask = async (id: string) => {
    return updateTask(id, {
      status: "completed",
      completed_at: new Date().toISOString(),
    })
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("academic_tasks").delete().eq("id", id)
    if (error) throw error
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const completedCount = tasks.filter((t) => t.status === "completed").length
  const pendingCount = tasks.filter((t) => t.status === "pending").length
  const todaysTasks = tasks.filter((t) => {
    if (!t.due_date) return false
    const today = new Date().toDateString()
    return new Date(t.due_date).toDateString() === today
  })

  return {
    tasks,
    loading,
    refetch: fetchTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    completedCount,
    pendingCount,
    todaysTasks,
    total: tasks.length,
  }
}
