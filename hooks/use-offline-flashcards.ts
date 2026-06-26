"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Flashcard } from "@/types"

const CACHE_KEY = "autopilot_flashcards_cache"
const QUEUE_KEY = "autopilot_flashcards_review_queue"

interface PendingReview {
  id: string
  quality: 0 | 1 | 2 | 3 | 4 | 5
  ease_factor: number
  interval_days: number
  repetitions: number
  next_review_at: string
  difficulty: Flashcard["difficulty"]
  updated_at: string
}

function sm2(card: Flashcard, quality: 0 | 1 | 2 | 3 | 4 | 5) {
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
  return { ease_factor, interval_days, repetitions, next_review_at, difficulty }
}

export function useOfflineFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const supabase = createClient()
  const syncedRef = useRef(false)

  // Track online status
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline) }
  }, [])

  const getQueue = (): PendingReview[] => {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") } catch { return [] }
  }

  const getCached = (): Flashcard[] => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "[]") } catch { return [] }
  }

  const flushQueue = useCallback(async () => {
    const queue = getQueue()
    if (queue.length === 0) return
    setSyncing(true)
    try {
      for (const r of queue) {
        await supabase.from("flashcards").update({
          ease_factor: r.ease_factor,
          interval_days: r.interval_days,
          repetitions: r.repetitions,
          next_review_at: r.next_review_at,
          difficulty: r.difficulty,
          updated_at: r.updated_at,
        }).eq("id", r.id)
      }
      localStorage.removeItem(QUEUE_KEY)
    } finally {
      setSyncing(false)
    }
  }, [supabase])

  const fetchFlashcards = useCallback(async () => {
    setLoading(true)
    if (!navigator.onLine) {
      const cached = getCached()
      setFlashcards(cached)
      setLoading(false)
      return
    }
    const { data } = await supabase.from("flashcards").select("*").order("created_at", { ascending: false })
    const cards = (data as Flashcard[]) ?? []
    setFlashcards(cards)
    localStorage.setItem(CACHE_KEY, JSON.stringify(cards))
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchFlashcards() }, [fetchFlashcards])

  // Flush queue when coming back online
  useEffect(() => {
    if (isOnline && !syncedRef.current) {
      syncedRef.current = true
      flushQueue().then(fetchFlashcards)
    }
    if (!isOnline) syncedRef.current = false
  }, [isOnline, flushQueue, fetchFlashcards])

  const submitReview = useCallback(async (id: string, quality: 0 | 3 | 5) => {
    const card = flashcards.find((f) => f.id === id)
    if (!card) return

    const updates = sm2(card, quality)
    const updated_at = new Date().toISOString()
    const updatedCard: Flashcard = { ...card, ...updates, updated_at }

    // Optimistically update local state and cache
    setFlashcards((prev) => {
      const next = prev.map((f) => f.id === id ? updatedCard : f)
      localStorage.setItem(CACHE_KEY, JSON.stringify(next))
      return next
    })

    if (navigator.onLine) {
      await supabase.from("flashcards").update({ ...updates, updated_at }).eq("id", id)
    } else {
      const queue = getQueue()
      const existing = queue.findIndex((r) => r.id === id)
      const entry: PendingReview = { id, quality, ...updates, updated_at }
      if (existing >= 0) queue[existing] = entry
      else queue.push(entry)
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    }
  }, [flashcards, supabase])

  const dueCards = flashcards.filter(
    (f) => !f.next_review_at || new Date(f.next_review_at) <= new Date()
  )

  const pendingCount = getQueue().length

  return { flashcards, dueCards, loading, isOnline, syncing, pendingCount, submitReview, refetch: fetchFlashcards }
}
