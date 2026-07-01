'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Modal from './Modal'
import { emit, evt } from '@/lib/bus'
import type { Job } from '@/lib/types'

const C = { bgCard:'#FFFFFF', bgElevated:'#F0EEE6', border:'#DEDBD2', borderSubtle:'#ECE9E0', text:'#1F1E1C', sub:'#5C5A52', muted:'#8C8980', accent:'#CC785C' }

type TemplateTask = { title: string; priority: string; tag: string; due_offset_days: number }
type Template = { id: string; name: string; description: string; task_count: number; template_data: { tasks?: TemplateTask[] } }

export default function TemplatesButton() {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  async function load() {
    setOpen(true)
    const { data } = await supabase.from('project_templates').select('*').order('created_at').limit(20)
    setTemplates((data || []) as Template[])
  }

  async function applyTemplate(tpl: Template) {
    setBusy(tpl.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(null); return }
    const { data: jobRow } = await supabase.from('jobs')
      .insert({ owner_id: user.id, niche: 'general', name: tpl.name, color: '#CC785C', status: 'In Progress', phase: 'Planning', completion: 0, metadata: {} })
      .select('*').single()
    if (!jobRow) { setBusy(null); return }
    const job = jobRow as Job
    emit(evt.add('project'), job)
    const tasks = (tpl.template_data?.tasks || []).map(t => {
      const due = new Date(Date.now() + (t.due_offset_days || 0) * 86400000).toISOString().slice(0, 10)
      return { job_id: job.id, owner_id: user.id, title: t.title, status: 'todo', priority: ['urgent', 'high', 'normal'].includes(t.priority) ? t.priority : 'normal', assignee_id: null, due_date: due, tag: t.tag || 'Planning' }
    })
    if (tasks.length) await supabase.from('tasks').insert(tasks)
    setBusy(null); setOpen(false)
    router.push(`/dashboard/jobs?job=${job.id}`)
  }

  return (
    <>
      <button onClick={load} style={{ background:'#FFFFFF', border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer' }}>Templates</button>
      {open && (
        <Modal title="Project templates" subtitle="Start a project from a reusable template" onClose={() => setOpen(false)} width={560}>
          {templates === null ? (
            <div style={{ fontSize:13, color:C.muted, padding:'8px 0' }}>Loading…</div>
          ) : templates.length === 0 ? (
            <div style={{ fontSize:13, color:C.muted, padding:'8px 0' }}>No templates yet. Save a project as a template from its ⋯ menu.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {templates.map(t => (
                <div key={t.id} style={{ border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600 }}>{t.name}</div>
                    <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{t.description || 'Template'} · {t.task_count} tasks</div>
                  </div>
                  <button onClick={() => applyTemplate(t)} disabled={busy === t.id} style={{ background:C.accent, border:'none', color:'#FFFFFF', borderRadius:8, padding:'7px 13px', fontSize:12.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer', opacity: busy === t.id ? 0.6 : 1, flexShrink:0 }}>{busy === t.id ? 'Creating…' : 'Use Template'}</button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
