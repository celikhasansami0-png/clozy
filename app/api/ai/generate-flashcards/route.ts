import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { content, title, count = 10 } = await request.json()
    if (!content) return fail("Content is required", 400)

    const rawJson = await generateCompletion({
      messages: [
        {
          role: "system",
          content: `You are an expert academic tutor. Generate exactly ${count} flashcards from the provided content.
Return ONLY a valid JSON array with objects having these keys: front (string), back (string), difficulty ("easy"|"medium"|"hard").
No markdown, no code blocks, just the raw JSON array.`,
        },
        {
          role: "user",
          content: `Material title: ${title}\n\nContent:\n${content.slice(0, 8000)}`,
        },
      ],
      responseFormat: "json",
      maxTokens: 3000,
    })

    const flashcards = JSON.parse(rawJson)
    if (!Array.isArray(flashcards)) throw new Error("Expected array")

    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error("generate-flashcards error:", error)
    return fail("Failed to generate flashcards")
  }
}
