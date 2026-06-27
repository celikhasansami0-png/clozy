"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import { rowToMessage, messageToRow } from "@/lib/scouting/serializers"
import { isSupabaseConfigured, genId } from "@/lib/scouting/demo-mode"
import { DEMO_MESSAGES } from "@/lib/scouting/mock-data"
import { runQualityGate } from "@/lib/scouting/quality"
import type { OutreachMessage } from "@/types/scouting"

function completeMessage(p: Partial<OutreachMessage>): OutreachMessage {
  const content = p.content ?? ""
  return {
    id: p.id ?? genId("msg"),
    leadId: p.leadId ?? "",
    campaignId: p.campaignId ?? null,
    sequenceStep: p.sequenceStep ?? 1,
    type: p.type ?? "message",
    direction: p.direction ?? "outbound",
    content,
    generatedBy: p.generatedBy ?? "ai",
    personalizationHooks: p.personalizationHooks ?? [],
    confidence: p.confidence ?? 0,
    quality: p.quality ?? runQualityGate(content),
    variant: p.variant ?? null,
    status: p.status ?? "draft",
    charCount: content.length,
    sentAt: p.sentAt ?? null,
    createdAt: new Date().toISOString(),
  }
}

export function useScoutingMessages() {
  const { user } = useAuth()
  const demo = !isSupabaseConfigured()
  const [messages, setMessages] = useState<OutreachMessage[]>(() => (demo ? DEMO_MESSAGES : []))
  const [loading, setLoading] = useState(!demo)
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    if (demo) {
      setMessages(DEMO_MESSAGES)
      setLoading(false)
      return
    }
    if (!user) {
      setMessages([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("scouting_messages")
      .select("*")
      .eq("direction", "outbound")
      .order("created_at", { ascending: true })
    setMessages((data ?? []).map(rowToMessage))
    setLoading(false)
  }, [supabase, user, demo])

  useEffect(() => {
    if (demo || !user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages()
  }, [fetchMessages, demo, user])

  const createMessages = async (drafts: Partial<OutreachMessage>[]): Promise<OutreachMessage[]> => {
    if (demo) {
      const created = drafts.map((d) => completeMessage(d))
      setMessages((prev) => [...prev, ...created])
      return created
    }
    if (!user) throw new Error("Not authenticated")
    const rows = drafts.map((d) => ({ ...messageToRow(d), user_id: user.id }))
    const { data, error } = await supabase.from("scouting_messages").insert(rows).select()
    if (error) throw error
    const created = (data ?? []).map(rowToMessage)
    setMessages((prev) => [...prev, ...created])
    return created
  }

  const updateMessage = async (id: string, updates: Partial<OutreachMessage>): Promise<OutreachMessage | null> => {
    if (demo) {
      let updated: OutreachMessage | null = null
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m
          updated = { ...m, ...updates }
          return updated
        })
      )
      return updated
    }
    const { data, error } = await supabase
      .from("scouting_messages")
      .update(messageToRow(updates))
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    const updated = rowToMessage(data)
    setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)))
    return updated
  }

  const markSent = (id: string) =>
    updateMessage(id, { status: "sent", sentAt: new Date().toISOString() })

  // Messages sent today (for daily-limit counters)
  const sentToday = messages.filter(
    (m) => m.sentAt && new Date(m.sentAt).toDateString() === new Date().toDateString()
  ).length

  return {
    messages,
    loading,
    refetch: fetchMessages,
    createMessages,
    updateMessage,
    markSent,
    sentToday,
    pending: messages.filter((m) => m.status === "draft" || m.status === "approved"),
  }
}
