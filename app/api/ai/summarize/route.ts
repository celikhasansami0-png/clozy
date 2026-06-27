import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { content, title } = await request.json()
    if (!content) return fail("Content is required", 400)

    const rawJson = await generateCompletion({
      messages: [
        {
          role: "system",
          content: `You are an expert academic summarizer. Return ONLY a valid JSON object with:
summary (string, 2-4 paragraphs), key_topics (string[], 5-10 topics), key_concepts (string[], important terms),
learning_objectives (string[], what students should learn).
No markdown, no code blocks, just raw JSON.`,
        },
        {
          role: "user",
          content: `Summarize this academic material.\nTitle: ${title || "Untitled"}\n\nContent:\n${content.slice(0, 8000)}`,
        },
      ],
      responseFormat: "json",
      maxTokens: 2000,
    })

    const result = JSON.parse(rawJson)
    return NextResponse.json(result)
  } catch (error) {
    console.error("summarize error:", error)
    return fail("Failed to summarize material")
  }
}
