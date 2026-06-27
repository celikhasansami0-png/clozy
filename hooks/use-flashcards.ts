"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Flashcard } from "@/types"

export function useFlashcards(courseId?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchFlashcards = useCallback(async () => {
    setLoading(true)
    let q = supabase.from("flashcards").select("*").order("created_at", { ascending: false })
    if (courseId) q = q.eq("course_id", courseId)
    const { data } = await q
    setFlashcards((data as Flashcard[]) ?? [])
    setLoading(false)
  }, [supabase, courseId])

  useEffect(() => { fetchFlashcards() }, [fetchFlashcards])

  const createFlashcard = async (card: Omit<Flashcard, "id" | "user_id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("flashcards").insert([card]).select().single()
    if (error) throw error
    setFlashcards((prev) => [data as Flashcard, ...prev])
    return data as Flashcard
  }

  const submitReview = async (id: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const card = flashcards.find((f) => f.id === id)
    if (!card) return

    // SM-2 algorithm
    let { ease_factor, interval_days, repetitions } = card
    if (quality >= 3) {
      if (repetitions === 0) interval_days = 1
      else if (repetitions === 1) interval_days = 6
      else interval_days = Math.round(interval_days * ease_factor)
      repetitions += 1
      ease_factor = Math.max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    } else {
      repetitions = 0
      interval_days = 1
    }

    const next_review_at = new Date(Date.now() + interval_days * 86400000).toISOString()
    const difficulty: Flashcard["difficulty"] = quality >= 4 ? "easy" : quality >= 2 ? "medium" : "hard"

    const { data, error } = await supabase
      .from("flashcards")
      .update({ ease_factor, interval_days, repetitions, next_review_at, difficulty, updated_at: new Date().toISOString() })
      .eq("id", id).select().single()
    if (error) throw error
    setFlashcards((prev) => prev.map((f) => (f.id === id ? (data as Flashcard) : f)))
    return data as Flashcard
  }

  const deleteFlashcard = async (id: string) => {
    const { error } = await supabase.from("flashcards").delete().eq("id", id)
    if (error) throw error
    setFlashcards((prev) => prev.filter((f) => f.id !== id))
  }

  const dueCards = flashcards.filter(
    (f) => !f.next_review_at || new Date(f.next_review_at) <= new Date()
  )

  return { flashcards, dueCards, loading, refetch: fetchFlashcards, createFlashcard, submitReview, deleteFlashcard }
}
