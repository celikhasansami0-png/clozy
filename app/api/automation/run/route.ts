import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

type RuleId = "auto_schedule" | "auto_exam_prep" | "auto_priority" | "auto_reminders" | "auto_revision" | "auto_project" | "auto_notes"
type Supabase = Awaited<ReturnType<typeof createClient>>

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth.unauthorized) return auth.unauthorized

  const { rule } = await req.json() as { rule: RuleId }
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail("Unauthorized", 401)

  try {
    if (rule === "auto_schedule") return await runAutoSchedule(supabase, user.id)
    if (rule === "auto_exam_prep") return await runAutoExamPrep(supabase, user.id)
    if (rule === "auto_priority") return await runAutoPriority(supabase, user.id)
    return NextResponse.json({ message: "Rule acknowledged", tasks_created: 0 })
  } catch (err) {
    console.error("automation run error:", err)
    return fail("Automation failed")
  }
}

async function runAutoSchedule(supabase: Supabase, userId: string) {
  const twoWeeksOut = new Date()
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14)

  const { data: exams } = await supabase
    .from("exams")
    .select("id, title, course_id")
    .eq("user_id", userId)
    .in("status", ["draft", "ready"])

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_date, course_id")
    .eq("user_id", userId)
    .neq("status", "submitted")
    .not("due_date", "is", null)
    .lte("due_date", twoWeeksOut.toISOString())
    .gte("due_date", new Date().toISOString())

  const { data: existingTasks } = await supabase
    .from("academic_tasks")
    .select("title")
    .eq("user_id", userId)
    .in("status", ["pending", "in_progress"])

  const existingTitles = new Set((existingTasks ?? []).map((t: { title: string }) => t.title))

  const tasksToCreate: {
    user_id: string; title: string; description: string; type: string
    status: string; priority: string; due_date: string; course_id: string | null; completed_at: null
  }[] = []

  for (const exam of exams ?? []) {
    const title = `Study for: ${exam.title}`
    if (!existingTitles.has(title)) {
      const d = new Date(); d.setDate(d.getDate() + 7)
      tasksToCreate.push({
        user_id: userId, title,
        description: "Auto-scheduled by Automation OS",
        type: "exam_prep", status: "pending", priority: "high",
        due_date: d.toISOString().slice(0, 10),
        course_id: exam.course_id ?? null, completed_at: null,
      })
    }
  }

  for (const assignment of assignments ?? []) {
    const title = `Complete: ${assignment.title}`
    if (!existingTitles.has(title)) {
      const d = new Date(assignment.due_date); d.setDate(d.getDate() - 1)
      tasksToCreate.push({
        user_id: userId, title,
        description: "Auto-scheduled by Automation OS based on assignment deadline",
        type: "assignment", status: "pending", priority: "medium",
        due_date: d.toISOString().slice(0, 10),
        course_id: assignment.course_id ?? null, completed_at: null,
      })
    }
  }

  if (tasksToCreate.length > 0) await supabase.from("academic_tasks").insert(tasksToCreate)
  return NextResponse.json({ message: "Auto scheduling complete", tasks_created: tasksToCreate.length })
}

async function runAutoExamPrep(supabase: Supabase, userId: string) {
  const { data: exams } = await supabase
    .from("exams")
    .select("id, title, course_id")
    .eq("user_id", userId)
    .eq("status", "ready")

  const { data: existingTasks } = await supabase
    .from("academic_tasks")
    .select("title")
    .eq("user_id", userId)
    .eq("type", "review_flashcards")
    .in("status", ["pending", "in_progress"])

  const existingTitles = new Set((existingTasks ?? []).map((t: { title: string }) => t.title))

  const tasksToCreate: {
    user_id: string; title: string; description: string; type: string
    status: string; priority: string; due_date: string; course_id: string | null; completed_at: null
  }[] = []

  for (const exam of exams ?? []) {
    const title = `Review flashcards for: ${exam.title}`
    if (!existingTitles.has(title)) {
      tasksToCreate.push({
        user_id: userId, title,
        description: "Auto-created by Exam Prep automation. Review your flashcards before the exam.",
        type: "review_flashcards", status: "pending", priority: "high",
        due_date: new Date().toISOString().slice(0, 10),
        course_id: exam.course_id ?? null, completed_at: null,
      })
    }
  }

  if (tasksToCreate.length > 0) await supabase.from("academic_tasks").insert(tasksToCreate)
  return NextResponse.json({ message: "Auto exam prep complete", tasks_created: tasksToCreate.length })
}

async function runAutoPriority(supabase: Supabase, userId: string) {
  const { data: pendingTasks } = await supabase
    .from("academic_tasks")
    .select("id, due_date")
    .eq("user_id", userId)
    .in("status", ["pending", "in_progress"])
    .not("due_date", "is", null)

  const now = new Date()
  let updated = 0

  for (const task of pendingTasks ?? []) {
    if (!task.due_date) continue
    const daysUntil = Math.ceil((new Date(task.due_date).getTime() - now.getTime()) / 86400000)
    const priority = daysUntil <= 3 ? "high" : daysUntil <= 7 ? "medium" : "low"
    await supabase
      .from("academic_tasks")
      .update({ priority, updated_at: new Date().toISOString() })
      .eq("id", task.id)
    updated++
  }

  return NextResponse.json({ message: "Priorities updated", tasks_updated: updated })
}
