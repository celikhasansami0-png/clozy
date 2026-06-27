import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"
import { SYSTEM_PROMPTS, userPrompt, parseJson, PROMPT_MARKERS } from "@/lib/scouting/prompts"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { text } = await request.json()
    if (!text || typeof text !== "string") return fail("Description text is required", 400)

    const raw = await generateCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.parseIcp },
        { role: "user", content: userPrompt(PROMPT_MARKERS.parseIcp, { text }) },
      ],
      responseFormat: "json",
      maxTokens: 1000,
    })

    return NextResponse.json({ icp: parseJson(raw) })
  } catch (error) {
    console.error("parse-icp error:", error)
    return fail("Failed to parse ICP")
  }
}
