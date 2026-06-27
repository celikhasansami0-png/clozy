import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { abstract, title, authors } = await request.json()
    if (!abstract && !title) return fail("Abstract or title is required", 400)

    const rawJson = await generateCompletion({
      messages: [
        {
          role: "system",
          content: `You are an expert research analyst. Analyze the provided research paper and return ONLY valid JSON with:
summary (string), key_findings (string[], 3-7 items), methodology (string),
limitations (string), research_gap (string), relevance_score (number 1-10),
tags (string[], relevant keywords).
No markdown, no code blocks, just raw JSON.`,
        },
        {
          role: "user",
          content: `Analyze this research paper.\nTitle: ${title || "Unknown"}\nAuthors: ${(authors || []).join(", ") || "Unknown"}\n\nAbstract:\n${abstract || "No abstract provided."}`,
        },
      ],
      responseFormat: "json",
      maxTokens: 2000,
    })

    const result = JSON.parse(rawJson)
    return NextResponse.json(result)
  } catch (error) {
    console.error("analyze-research error:", error)
    return fail("Failed to analyze research paper")
  }
}
