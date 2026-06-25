"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ResearchPaper } from "@/types"

export function useResearch() {
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchPapers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("research_papers")
      .select("*")
      .order("created_at", { ascending: false })
    setPapers((data as ResearchPaper[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchPapers() }, [fetchPapers])

  const addPaper = async (paper: Omit<ResearchPaper, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("research_papers").insert([paper]).select().single()
    if (error) throw error
    setPapers((prev) => [data as ResearchPaper, ...prev])
    return data as ResearchPaper
  }

  const updatePaper = async (id: string, updates: Partial<ResearchPaper>) => {
    const { data, error } = await supabase
      .from("research_papers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error) throw error
    setPapers((prev) => prev.map((p) => (p.id === id ? (data as ResearchPaper) : p)))
    return data as ResearchPaper
  }

  const deletePaper = async (id: string) => {
    const { error } = await supabase.from("research_papers").delete().eq("id", id)
    if (error) throw error
    setPapers((prev) => prev.filter((p) => p.id !== id))
  }

  return { papers, loading, refetch: fetchPapers, addPaper, updatePaper, deletePaper }
}
