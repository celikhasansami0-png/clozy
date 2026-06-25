// @ts-nocheck
"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Lead, LeadStage } from "@/types"
import { LEAD_STAGES } from "@/lib/constants"

interface LeadFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (lead: Omit<Lead, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>
  initialData?: Partial<Lead>
}

export function LeadForm({ open, onClose, onSubmit, initialData }: LeadFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    company: initialData?.company ?? "",
    linkedin_url: initialData?.linkedin_url ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    stage: initialData?.stage ?? "new" as LeadStage,
    notes: initialData?.notes ?? "",
    deal_value: initialData?.deal_value ?? undefined as number | undefined,
    tags: initialData?.tags ?? [] as string[],
    last_contact_at: initialData?.last_contact_at ?? null,
    toolkit_id: initialData?.toolkit_id ?? undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        name: form.name,
        company: form.company || null,
        linkedin_url: form.linkedin_url || null,
        email: form.email || null,
        phone: form.phone || null,
        stage: form.stage,
        notes: form.notes || null,
        deal_value: form.deal_value ?? null,
        tags: form.tags,
        last_contact_at: form.last_contact_at,
        toolkit_id: form.toolkit_id,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData?.name ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Johnson"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              value={form.linkedin_url}
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alex@acme.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal_value">Deal Value ($)</Label>
              <Input
                id="deal_value"
                type="number"
                min={0}
                value={form.deal_value ?? ""}
                onChange={(e) => setForm({ ...form, deal_value: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="3000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stage">Stage</Label>
            <Select
              value={form.stage}
              onValueChange={(v) => setForm({ ...form, stage: v as LeadStage })}
            >
              <SelectTrigger id="stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STAGES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Add notes about this lead..."
              className="h-20"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData?.name ? "Update Lead" : "Add Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
