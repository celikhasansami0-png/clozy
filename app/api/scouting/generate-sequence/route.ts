import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"
import { SYSTEM_PROMPTS, userPrompt, parseJson, PROMPT_MARKERS } from "@/lib/scouting/prompts"
import { runQualityGate } from "@/lib/scouting/quality"

interface GenMessage {
  sequenceStep: number
  type: string
  content: string
  personalizationHooks: string[]
  confidence: number
}

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { firstName, company, hook, voiceProfile, researchBrief } = await request.json()
    if (!firstName) return fail("Lead first name is required", 400)

    const raw = await generateCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.sequence },
        {
          role: "user",
          content: userPrompt(PROMPT_MARKERS.sequence, {
            firstName,
            company,
            hook,
            voiceProfile,
            researchBrief,
          }),
        },
      ],
      responseFormat: "json",
      maxTokens: 3000,
    })

    const { messages } = parseJson<{ messages: GenMessage[] }>(raw)
    const withQuality = messages.map((m) => ({
      ...m,
      charCount: m.content.length,
      quality: runQualityGate(m.content),
    }))

    return NextResponse.json({ messages: withQuality })
  } catch (error) {
    console.error("generate-sequence error:", error)
    return fail("Failed to generate sequence")
  }
}
