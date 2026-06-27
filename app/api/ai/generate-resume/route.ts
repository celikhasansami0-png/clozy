import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"

export async function POST(request: Request) {
  const { unauthorized } = await requireAuth()
  if (unauthorized) return unauthorized

  try {
    const { full_name, university, department, target_role, target_industry, skills, experiences, projects } = await request.json()
    if (!full_name || !target_role) return fail("Name and target role are required", 400)

    const content = await generateCompletion({
      messages: [
        {
          role: "system",
          content: `You are an expert career coach and resume writer specializing in engineering students.
Create a complete, ATS-optimized resume in clean Markdown format. Include: professional summary,
education, skills, projects, experience, and achievements. Use strong action verbs and quantify achievements where possible.`,
        },
        {
          role: "user",
          content: `Create a resume for:\nName: ${full_name}\nUniversity: ${university || "N/A"}\nDepartment: ${department || "N/A"}\nTarget Role: ${target_role}\nTarget Industry: ${target_industry || "Engineering"}\n\nSkills: ${(skills || []).join(", ")}\n\nExperiences: ${JSON.stringify(experiences || [])}\n\nProjects: ${JSON.stringify(projects || [])}`,
        },
      ],
      maxTokens: 3000,
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error("generate-resume error:", error)
    return fail("Failed to generate resume")
  }
}
