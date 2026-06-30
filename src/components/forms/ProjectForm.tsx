'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Modal from '../Modal'
import { Field, TextInput, Select, ColorPicker, Slider, SubmitButton } from '../form'
import { emit, evt, type ReplacePayload } from '@/lib/bus'
import { logActivity, notify } from '@/lib/log'
import { useNiche } from '../NicheProvider'
import type { Job, JobStatus } from '@/lib/types'

const STATUS: JobStatus[] = ['In Progress', 'On Track', 'Delayed', 'Complete']

export default function ProjectForm({ userId, onClose }: { userId: string; onClose: () => void }) {
  const supabase = createClient()
  const { module: mod, term } = useNiche()
  const PHASE = mod.stages
  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState(false)
  const [color, setColor] = useState('#4D7FFF')
  const [status, setStatus] = useState<JobStatus>('In Progress')
  const [phase, setPhase] = useState(PHASE[0])
  const [completion, setCompletion] = useState(0)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setNameErr(true); return }
    setLoading(true)
    const tempId = 'temp-' + crypto.randomUUID()
    const optimistic: Job = { id: tempId, owner_id: userId, name: name.trim(), color, status, phase, completion, created_at: new Date().toISOString(), niche: 'general', metadata: {} }
    emit(evt.add('project'), optimistic)
    onClose()
    const { data, error } = await supabase.from('jobs').insert({ owner_id: userId, niche: 'general', name: name.trim(), color, status, phase, completion, metadata: {} }).select('*').single()
    if (error || !data) emit(evt.remove('project'), tempId)
    else {
      const row = data as Job
      emit<ReplacePayload<Job>>(evt.replace('project'), { tempId, row })
      logActivity(supabase, { projectId: row.id, ownerId: userId, action: 'project_created', entityType: 'project', entityId: row.id, metadata: { name: row.name, actor: 'You' } })
      if (completion === 100) notify(supabase, userId, { title: `${term.project} complete`, body: `${row.name} is at 100%`, type: 'project', link: `/dashboard/jobs?job=${row.id}` })
    }
  }

  return (
    <Modal title={`New ${term.project.toLowerCase()}`} subtitle={`Added to your ${term.project.toLowerCase()}s`} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label={`${term.project} name`} required error={nameErr ? `${term.project} name is required` : undefined}>
          <TextInput value={name} error={nameErr} onChange={v => { setName(v); setNameErr(false) }} placeholder="Downtown Office Renovation" />
        </Field>
        <Field label="Color"><ColorPicker value={color} onChange={setColor} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Status"><Select value={status} onChange={v => setStatus(v as JobStatus)} options={STATUS.map(s => ({ value: s, label: s }))} /></Field>
          <Field label="Phase"><Select value={phase} onChange={setPhase} options={PHASE.map(s => ({ value: s, label: s }))} /></Field>
        </div>
        <Field label="Completion"><Slider value={completion} onChange={setCompletion} /></Field>
        <SubmitButton loading={loading}>Create {term.project.toLowerCase()}</SubmitButton>
      </form>
    </Modal>
  )
}
