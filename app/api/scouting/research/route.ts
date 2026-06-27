import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"
import { SYSTEM_PROMPTS, userPrompt, parseJson, PROMPT_MARKERS } from "@/lib/scouting/prompts"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { firstName, lastName, title, company, companyDomain } = await request.json()
    if (!firstName || !company) return fail("Lead name and company are required", 400)

    const raw = await generateCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.research },
        {
          role: "user",
          content: userPrompt(PROMPT_MARKERS.research, { firstName, lastName, title, company, companyDomain }),
        },
      ],
      responseFormat: "json",
      maxTokens: 2000,
    })

    const brief = parseJson<Record<string, unknown>>(raw)
    return NextResponse.json({ researchBrief: { ...brief, generatedAt: new Date().toISOString() } })
  } catch (error) {
    console.error("research error:", error)
    return fail("Failed to run research")
  }
}
