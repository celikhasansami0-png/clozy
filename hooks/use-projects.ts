"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Project, Milestone } from "@/types"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false })
    setProjects((data as Project[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const createProject = async (project: Omit<Project, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("projects").insert([project]).select().single()
    if (error) throw error
    setProjects((prev) => [data as Project, ...prev])
    return data as Project
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error) throw error
    setProjects((prev) => prev.map((p) => (p.id === id ? (data as Project) : p)))
    return data as Project
  }

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id)
    if (error) throw error
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const fetchMilestones = async (projectId: string): Promise<Milestone[]> => {
    const { data } = await supabase
      .from("milestones")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true })
    return (data as Milestone[]) ?? []
  }

  const createMilestone = async (milestone: Omit<Milestone, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("milestones").insert([milestone]).select().single()
    if (error) throw error
    return data as Milestone
  }

  const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
    const { data, error } = await supabase
      .from("milestones")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error) throw error
    return data as Milestone
  }

  const deleteMilestone = async (id: string) => {
    const { error } = await supabase.from("milestones").delete().eq("id", id)
    if (error) throw error
  }

  const activeProjects = projects.filter((p) => p.status === "in_progress")

  return {
    projects, activeProjects, loading, refetch: fetchProjects,
    createProject, updateProject, deleteProject,
    fetchMilestones, createMilestone, updateMilestone, deleteMilestone,
  }
}
