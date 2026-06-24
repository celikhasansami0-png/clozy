"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { GrowthForm } from "@/components/growth/growth-form"
import { ReportViewer } from "@/components/growth/report-viewer"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useSubscription } from "@/hooks/use-subscription"
import { generateGrowthSystem } from "@/services/growth-generator"
import { createClient } from "@/lib/supabase/client"
import type { GrowthInput, GrowthOutput } from "@/types"
import { toast } from "sonner"

export default function GrowthPage() {
  const [output, setOutput] = useState<GrowthOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { hasReachedLimit } = useSubscription()
  const router = useRouter()
  const supabase = createClient()

  const handleGenerate = async (input: GrowthInput) => {
    if (!user) {
      toast.error("Please sign in to generate a growth system")
      return
    }

    setLoading(true)
    try {
      const result = await generateGrowthSystem(input, user.id)

      // Save to Supabase
      const { data: toolkit, error } = await supabase
        .from("toolkits")
        .insert([{
          user_id: user.id,
          title: `${input.service} — ${input.niche}`,
          niche: input.niche,
          growth_output: result,
          status: "active",
        }])
        .select()
        .single()

      if (error) {
        console.error("Failed to save toolkit:", error)
        toast.error("Generated but failed to save. Please try again.")
      } else {
        toast.success("Growth system generated!")
        setOutput(result)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to generate. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToTasks = async () => {
    if (!output || !user) return

    const tasks = output.execution_plan.flatMap((day) =>
      day.tasks.map((taskTitle, i) => ({
        user_id: user.id,
        title: taskTitle,
        description: `Day ${day.day}: ${day.focus}`,
        type: "custom" as const,
        status: "pending" as const,
        priority: "medium" as const,
        day_number: day.day,
        due_date: new Date(Date.now() + (day.day - 1) * 86400000).toISOString().split("T")[0],
      }))
    )

    const { error } = await supabase.from("tasks").insert(tasks)
    if (error) {
      toast.error("Failed to create tasks")
    } else {
      toast.success(`${tasks.length} tasks added to your execution plan!`)
      router.push("/tasks")
    }
  }

  return (
    <div>
      <PageHeader
        title={output ? "Your Growth System" : "Growth Generator"}
        description={
          output
            ? "AI-generated LinkedIn growth strategy for your business."
            : "Enter your business details to generate a complete LinkedIn growth system."
        }
        actions={
          output ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOutput(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              New System
            </Button>
          ) : undefined
        }
      />

      <div className="p-6">
        {output ? (
          <ReportViewer output={output} onConvertToTasks={handleConvertToTasks} />
        ) : (
          <GrowthForm onSubmit={handleGenerate} loading={loading} />
        )}
      </div>
    </div>
  )
}
