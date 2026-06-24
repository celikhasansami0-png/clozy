"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Task, TaskStatus } from "@/types"

export function useTasks(toolkitId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    let query = supabase.from("tasks").select("*").order("due_date", { ascending: true })
    if (toolkitId) query = query.eq("toolkit_id", toolkitId)

    const { data } = await query
    setTasks((data as Task[]) ?? [])
    setLoading(false)
  }, [supabase, toolkitId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("tasks").insert([task]).select().single()
    if (error) throw error
    setTasks((prev) => [...prev, data as Task])
    return data as Task
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)))
    return data as Task
  }

  const completeTask = async (id: string) => {
    return updateTask(id, {
      status: "completed",
      completed_at: new Date().toISOString(),
    })
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id)
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
