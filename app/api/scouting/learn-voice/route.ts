import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"
import { SYSTEM_PROMPTS, userPrompt, parseJson, PROMPT_MARKERS } from "@/lib/scouting/prompts"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { messages } = await request.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return fail("At least one writing sample is required", 400)
    }

    const raw = await generateCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.voice },
        { role: "user", content: userPrompt(PROMPT_MARKERS.voice, { messages }) },
      ],
      responseFormat: "json",
      maxTokens: 1500,
    })

    return NextResponse.json({ voiceProfile: parseJson(raw) })
  } catch (error) {
    console.error("learn-voice error:", error)
    return fail("Failed to analyze voice")
  }
}
