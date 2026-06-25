"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { KnowledgeNote } from "@/types"

export function useKnowledge(courseId?: string) {
  const [notes, setNotes] = useState<KnowledgeNote[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    let q = supabase.from("knowledge_notes").select("*").order("updated_at", { ascending: false })
    if (courseId) q = q.eq("course_id", courseId)
    const { data } = await q
    setNotes((data as KnowledgeNote[]) ?? [])
    setLoading(false)
  }, [supabase, courseId])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const createNote = async (note: Omit<KnowledgeNote, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("knowledge_notes").insert([note]).select().single()
    if (error) throw error
    setNotes((prev) => [data as KnowledgeNote, ...prev])
    return data as KnowledgeNote
  }

  const updateNote = async (id: string, updates: Partial<KnowledgeNote>) => {
    const { data, error } = await supabase
      .from("knowledge_notes")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error) throw error
    setNotes((prev) => prev.map((n) => (n.id === id ? (data as KnowledgeNote) : n)))
    return data as KnowledgeNote
  }

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("knowledge_notes").delete().eq("id", id)
    if (error) throw error
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const searchNotes = async (query: string): Promise<KnowledgeNote[]> => {
    const { data } = await supabase
      .from("knowledge_notes")
      .select("*")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("updated_at", { ascending: false })
    return (data as KnowledgeNote[]) ?? []
  }

  return { notes, loading, refetch: fetchNotes, createNote, updateNote, deleteNote, searchNotes }
}
