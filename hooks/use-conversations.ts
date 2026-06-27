"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import { rowToConversation, conversationToRow } from "@/lib/scouting/serializers"
import { isSupabaseConfigured, genId } from "@/lib/scouting/demo-mode"
import { DEMO_CONVERSATIONS } from "@/lib/scouting/mock-data"
import type { Conversation, ConversationMessage } from "@/types/scouting"

export function useConversations() {
  const { user } = useAuth()
  const demo = !isSupabaseConfigured()
  const [conversations, setConversations] = useState<Conversation[]>(() => (demo ? DEMO_CONVERSATIONS : []))
  const [loading, setLoading] = useState(!demo)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    if (demo) {
      setConversations(DEMO_CONVERSATIONS)
      setLoading(false)
      return
    }
    if (!user) {
      setConversations([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("scouting_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
    setConversations((data ?? []).map(rowToConversation))
    setLoading(false)
  }, [supabase, user, demo])

  useEffect(() => {
    if (demo || !user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversations()
  }, [fetchConversations, demo, user])

  const createConversation = async (c: Partial<Conversation>): Promise<Conversation> => {
    if (demo) {
      const created: Conversation = {
        id: genId("conv"),
        leadId: c.leadId ?? "",
        campaignId: c.campaignId ?? null,
        classification: c.classification ?? "unclear",
        unread: c.unread ?? true,
        lastMessageAt: c.lastMessageAt ?? new Date().toISOString(),
        messages: c.messages ?? [],
        suggestedReplies: c.suggestedReplies ?? [],
      }
      setConversations((prev) => [created, ...prev])
      return created
    }
    if (!user) throw new Error("Not authenticated")
    const { data, error } = await supabase
      .from("scouting_conversations")
      .insert({ ...conversationToRow(c), user_id: user.id })
      .select()
      .single()
    if (error) throw error
    const created = rowToConversation(data)
    setConversations((prev) => [created, ...prev])
    return created
  }

  const updateConversation = async (id: string, updates: Partial<Conversation>): Promise<Conversation> => {
    if (demo) {
      let updated = conversations.find((c) => c.id === id) as Conversation
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          updated = { ...c, ...updates }
          return updated
        })
      )
      return updated
    }
    const { data, error } = await supabase
      .from("scouting_conversations")
      .update(conversationToRow(updates))
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    const updated = rowToConversation(data)
    setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  // Append an outbound reply and mark the thread read.
  const sendReply = async (id: string, content: string) => {
    const conv = conversations.find((c) => c.id === id)
    if (!conv) return
    const msg: ConversationMessage = {
      id: `m-${Date.now()}`,
      direction: "outbound",
      content,
      timestamp: new Date().toISOString(),
    }
    return updateConversation(id, {
      messages: [...conv.messages, msg],
      unread: false,
      lastMessageAt: msg.timestamp,
    })
  }

  const markRead = (id: string) => updateConversation(id, { unread: false })

  return {
    conversations,
    loading,
    refetch: fetchConversations,
    createConversation,
    updateConversation,
    sendReply,
    markRead,
    unreadCount: conversations.filter((c) => c.unread).length,
  }
}
