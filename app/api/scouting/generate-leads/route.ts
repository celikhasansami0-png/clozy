import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"
import { SYSTEM_PROMPTS, userPrompt, parseJson, PROMPT_MARKERS } from "@/lib/scouting/prompts"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { icp, count = 8 } = await request.json()
    if (!icp) return fail("ICP is required", 400)

    const raw = await generateCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.generateLeads },
        { role: "user", content: userPrompt(PROMPT_MARKERS.generateLeads, { icp, count }) },
      ],
      responseFormat: "json",
      maxTokens: 3000,
    })

    return NextResponse.json(parseJson(raw))
  } catch (error) {
    console.error("generate-leads error:", error)
    return fail("Failed to generate leads")
  }
}
