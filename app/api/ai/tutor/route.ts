import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"
import type { AIMessage } from "@/services/ai"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { question, context, history = [] } = await request.json()
    if (!question) return fail("Question is required", 400)

    const messages: AIMessage[] = [
      {
        role: "system",
        content: `You are an expert AI tutor for engineering students. Explain concepts clearly, use examples,
and adapt your explanations to the student's level. When appropriate, use analogies, diagrams described in text,
and step-by-step breakdowns. Be encouraging and precise.${context ? `\n\nRelevant material context:\n${context.slice(0, 3000)}` : ""}`,
      },
      ...history,
      { role: "user", content: question },
    ]

    const answer = await generateCompletion({ messages, maxTokens: 2000 })
    return NextResponse.json({ answer })
  } catch (error) {
    console.error("tutor error:", error)
    return fail("Failed to get tutor response")
  }
}
