import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { type, title, description, word_count = 1000, citation_format = "ieee" } = await request.json()
    if (!title || !type) return fail("Title and type are required", 400)

    const content = await generateCompletion({
      messages: [
        {
          role: "system",
          content: `You are an expert academic writing assistant for engineering students.
Write a complete, well-structured ${type.replace(/_/g, " ")} in academic style.
Use ${citation_format.toUpperCase()} citation format where relevant. Target approximately ${word_count} words.
Format with clear headings, sections, and professional academic language.`,
        },
        {
          role: "user",
          content: `Write a ${type.replace(/_/g, " ")} titled: "${title}"\n\nDescription/Requirements:\n${description || "Generate appropriate content for this assignment type."}`,
        },
      ],
      maxTokens: 4096,
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error("generate-assignment error:", error)
    return fail("Failed to generate assignment content")
  }
}
