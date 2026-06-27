import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { topic, course, difficulty = "medium", question_count = 10, question_types = ["multiple_choice"] } = await request.json()
    if (!topic) return fail("Topic is required", 400)

    const rawJson = await generateCompletion({
      messages: [
        {
          role: "system",
          content: `You are an expert professor generating exam questions. Return ONLY a valid JSON array of question objects.
Each object must have: question (string), type ("multiple_choice"|"short_answer"|"true_false"|"fill_blank"),
options (string[] for multiple_choice, null otherwise), correct_answer (string), explanation (string),
difficulty ("easy"|"medium"|"hard"|"very_hard"), topic (string), marks (number 1-5).
No markdown, no code blocks, just the raw JSON array.`,
        },
        {
          role: "user",
          content: `Generate ${question_count} exam questions about: ${topic}${course ? ` (Course: ${course})` : ""}.
Difficulty: ${difficulty}. Question types: ${question_types.join(", ")}.`,
        },
      ],
      responseFormat: "json",
      maxTokens: 4000,
    })

    const questions = JSON.parse(rawJson)
    if (!Array.isArray(questions)) throw new Error("Expected array")

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("generate-exam error:", error)
    return fail("Failed to generate exam questions")
  }
}
