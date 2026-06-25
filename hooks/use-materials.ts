"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { LearningMaterial } from "@/types"

export function useMaterials(courseId?: string) {
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    let q = supabase.from("learning_materials").select("*").order("created_at", { ascending: false })
    if (courseId) q = q.eq("course_id", courseId)
    const { data } = await q
    setMaterials((data as LearningMaterial[]) ?? [])
    setLoading(false)
  }, [supabase, courseId])

  useEffect(() => { fetchMaterials() }, [fetchMaterials])

  const createMaterial = async (material: Omit<LearningMaterial, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("learning_materials").insert([material]).select().single()
    if (error) throw error
    setMaterials((prev) => [data as LearningMaterial, ...prev])
    return data as LearningMaterial
  }

  const updateMaterial = async (id: string, updates: Partial<LearningMaterial>) => {
    const { data, error } = await supabase
      .from("learning_materials")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error) throw error
    setMaterials((prev) => prev.map((m) => (m.id === id ? (data as LearningMaterial) : m)))
    return data as LearningMaterial
  }

  const deleteMaterial = async (id: string) => {
    const { error } = await supabase.from("learning_materials").delete().eq("id", id)
    if (error) throw error
    setMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  return { materials, loading, refetch: fetchMaterials, createMaterial, updateMaterial, deleteMaterial }
}
