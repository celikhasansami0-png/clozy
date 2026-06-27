import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"
import { SYSTEM_PROMPTS, userPrompt, parseJson, PROMPT_MARKERS } from "@/lib/scouting/prompts"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { reply, context } = await request.json()
    if (!reply || typeof reply !== "string") return fail("Reply text is required", 400)

    const raw = await generateCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.classify },
        { role: "user", content: userPrompt(PROMPT_MARKERS.classify, { reply, context }) },
      ],
      responseFormat: "json",
      maxTokens: 1500,
    })

    return NextResponse.json(parseJson(raw))
  } catch (error) {
    console.error("classify-reply error:", error)
    return fail("Failed to classify reply")
  }
}
